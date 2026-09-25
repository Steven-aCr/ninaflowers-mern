import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pedidoService from "../../services/pedidoService.js";
import * as pagoService from "../../services/pagoService.js";
import * as stripeService from "../../services/stripeService.js";
import ResumenPedido from "../../components/cliente/ResumenPedido.jsx";
import Boton from "../../components/common/Boton.jsx";
import { useCarrito } from "../../hooks/useCarrito.js";
import "./Checkout.css";

const COSTOS_ENVIO = {
  retiro_tienda: 0,
  zona_cubierta: 2,
  fuera_zona: 0
};

function Checkout() {
  const { items, subtotal, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();

  const [direccion, setDireccion] = useState({
    etiqueta: "Casa",
    linea1: "",
    linea2: "",
    ciudad: "",
    referencia: ""
  });

  const [tipoEnvio, setTipoEnvio] = useState("zona_cubierta");
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const envio = COSTOS_ENVIO[tipoEnvio];
  const impuesto = 0;

  const actualizarCampo = (campo) => (evento) => {
    setDireccion((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const manejarConfirmar = async () => {
    if (!items.length) {
      setError("Tu carrito está vacío.");
      return;
    }

    if (!direccion.linea1.trim() || !direccion.ciudad.trim()) {
      setError("Completa la calle y la ciudad.");
      return;
    }

    if (!fechaEntrega) {
      setError("Selecciona una fecha de entrega.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const resultado = await pedidoService.crearPedidoDesdeCarrito({
        tipoEnvio,
        direccionEntrega: direccion,
        fechaEntregaEstimada: fechaEntrega
      });

      const pedido = resultado.pedido;

      // El backend ya vacía el carrito; esto solo sincroniza el contexto local.
      await vaciarCarrito();

      // Fuera de zona: todavía no se crea el pago porque el total final
      // depende de la cotización de envío que hará el administrador.
      if (tipoEnvio === "fuera_zona") {
        navigate(`/mis-pedidos/${pedido._id}`, {
          state: {
            mensaje: "Tu pedido fue enviado para cotización. Cuando el administrador establezca el costo del envío podrás realizar el pago."
          }
        });
        return;
      }

      if (metodoPago === "tarjeta") {
        const sesion = await stripeService.crearSesionCheckout(pedido._id);
        window.location.href = sesion.url;
        return;
      }

      // Efectivo o transferencia quedan pendientes de confirmación manual.
      await pagoService.crearPago(pedido._id, metodoPago);

      navigate(`/mis-pedidos/${pedido._id}`, {
        state: {
          mensaje: metodoPago === "efectivo"
            ? "Pedido creado. El pago en efectivo está pendiente de confirmación."
            : "Pedido creado. La transferencia está pendiente de confirmación."
        }
      });
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.response?.data?.mensaje || "No se pudo completar el pedido.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="checkout">
      <div className="checkout__contenedor">
        <header className="checkout__encabezado">
          <h1>Entrega y pago</h1>
          <p>Confirma los datos de entrega y selecciona cómo deseas pagar.</p>
        </header>

        <div className="checkout__layout">
          <section className="checkout__formulario">
            <div className="checkout__bloque">
              <h2><span className="material-symbols-outlined">pin_drop</span>Dirección de entrega</h2>

              <div className="checkout__campo">
                <label>Calle y número</label>
                <input
                  type="text"
                  value={direccion.linea1}
                  onChange={actualizarCampo("linea1")}
                  placeholder="Av. Las Rosas 412"
                />
              </div>

              <div className="checkout__fila">
                <div className="checkout__campo">
                  <label>Interior / Depto</label>
                  <input
                    type="text"
                    value={direccion.linea2}
                    onChange={actualizarCampo("linea2")}
                    placeholder="Opcional"
                  />
                </div>

                <div className="checkout__campo">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    value={direccion.ciudad}
                    onChange={actualizarCampo("ciudad")}
                    placeholder="San Salvador"
                  />
                </div>
              </div>

              <div className="checkout__campo">
                <label>Referencia</label>
                <textarea
                  value={direccion.referencia}
                  onChange={actualizarCampo("referencia")}
                  placeholder="Indicaciones adicionales..."
                />
              </div>
            </div>

            <div className="checkout__bloque">
              <h2><span className="material-symbols-outlined">local_shipping</span>Método de entrega</h2>

              <label className="checkout__opcion">
                <input
                  type="radio"
                  name="envio"
                  value="retiro_tienda"
                  checked={tipoEnvio === "retiro_tienda"}
                  onChange={(e) => setTipoEnvio(e.target.value)}
                />
                <div>
                  <strong>Retiro en tienda</strong>
                  <p>Sin costo de envío.</p>
                </div>
              </label>

              <label className="checkout__opcion">
                <input
                  type="radio"
                  name="envio"
                  value="zona_cubierta"
                  checked={tipoEnvio === "zona_cubierta"}
                  onChange={(e) => setTipoEnvio(e.target.value)}
                />
                <div>
                  <strong>Zona cubierta</strong>
                  <p>Envío $2.00.</p>
                </div>
              </label>

              <label className="checkout__opcion">
                <input
                  type="radio"
                  name="envio"
                  value="fuera_zona"
                  checked={tipoEnvio === "fuera_zona"}
                  onChange={(e) => setTipoEnvio(e.target.value)}
                />
                <div>
                  <strong>Fuera de zona</strong>
                  <p>El administrador cotizará el costo.</p>
                </div>
              </label>
            </div>

            <div className="checkout__bloque">
              <h2><span className="material-symbols-outlined">calendar_month</span>Fecha de entrega</h2>
              <div className="checkout__campo">
                <input
                  type="datetime-local"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>
            </div>

            <div className="checkout__bloque">
              <h2><span className="material-symbols-outlined">payments</span>Método de pago</h2>

              {tipoEnvio === "fuera_zona" ? (
                <div className="checkout__aviso">
                  Primero necesitamos cotizar el costo del envío.
                  Cuando el administrador lo establezca podrás seleccionar y realizar
                  el pago desde el detalle de tu pedido.
                </div>
              ) : (
                <>
                  <label className="checkout__opcion">
                    <input
                      type="radio"
                      name="pago"
                      value="tarjeta"
                      checked={metodoPago === "tarjeta"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <div>
                      <strong>Tarjeta</strong>
                      <p>Pago seguro mediante Stripe.</p>
                    </div>
                  </label>

                  <label className="checkout__opcion">
                    <input
                      type="radio"
                      name="pago"
                      value="efectivo"
                      checked={metodoPago === "efectivo"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <div>
                      <strong>Efectivo</strong>
                      <p>El administrador confirmará el pago cuando sea recibido.</p>
                    </div>
                  </label>

                  <label className="checkout__opcion">
                    <input
                      type="radio"
                      name="pago"
                      value="transferencia"
                      checked={metodoPago === "transferencia"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <div>
                      <strong>Transferencia</strong>
                      <p>Quedará pendiente hasta su validación.</p>
                    </div>
                  </label>
                </>
              )}
            </div>

            {error && <div className="checkout__error">{error}</div>}

            <Boton onClick={manejarConfirmar} disabled={enviando || !items.length}>
              {enviando
                ? "Procesando..."
                : tipoEnvio === "fuera_zona"
                  ? "Solicitar cotización"
                  : metodoPago === "tarjeta"
                    ? "Continuar con Stripe"
                    : "Confirmar pedido"}
            </Boton>
          </section>

          <aside>
            <ResumenPedido items={items} subtotal={subtotal} envio={envio} impuesto={impuesto} />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;