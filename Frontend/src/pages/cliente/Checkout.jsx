import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pedidoService from "../../services/pedidoService.js";
import * as pagoService from "../../services/pagoService.js";
import * as stripeService from "../../services/stripeService.js";
import ResumenPedido from "../../components/cliente/ResumenPedido.jsx";
import { useCarrito } from "../../hooks/useCarrito.js";
import "./Checkout.css";

const COSTOS_ENVIO = {
  retiro_tienda: 0,
  zona_cubierta: 2,
  fuera_zona: 0,
};

const OPCIONES_ENVIO = [
  { valor: "retiro_tienda", icono: "storefront", titulo: "Retiro en tienda", detalle: "Sin costo de envío." },
  { valor: "zona_cubierta", icono: "local_shipping", titulo: "Zona cubierta", detalle: "Envío $2.00." },
  { valor: "fuera_zona", icono: "map", titulo: "Fuera de zona", detalle: "Te cotizamos el costo del envío." },
];

const OPCIONES_PAGO = [
  { valor: "tarjeta", icono: "credit_card", titulo: "Tarjeta", detalle: "Pago seguro con Stripe." },
  { valor: "efectivo", icono: "payments", titulo: "Efectivo", detalle: "Lo confirmamos cuando recibamos el pago." },
  { valor: "transferencia", icono: "account_balance", titulo: "Transferencia", detalle: "Queda pendiente hasta validarla." },
];

// Una opción seleccionable (radio con apariencia de tarjeta).
function Opcion({ name, opcion, seleccionado, onSeleccionar }) {
  return (
    <label className={`checkout__opcion ${seleccionado ? "checkout__opcion--activa" : ""}`}>
      <input
        type="radio"
        name={name}
        value={opcion.valor}
        checked={seleccionado}
        onChange={() => onSeleccionar(opcion.valor)}
      />
      <span className="material-symbols-outlined checkout__opcion-icono">{opcion.icono}</span>
      <span className="checkout__opcion-texto">
        <strong>{opcion.titulo}</strong>
        <small>{opcion.detalle}</small>
      </span>
      <span className="material-symbols-outlined checkout__opcion-check">check_circle</span>
    </label>
  );
}

function Checkout() {
  const { items, subtotal, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();

  const [direccion, setDireccion] = useState({
    etiqueta: "Casa",
    linea1: "",
    linea2: "",
    ciudad: "",
    referencia: "",
  });

  const [tipoEnvio, setTipoEnvio] = useState("zona_cubierta");
  const [metodoPago, setMetodoPago] = useState("tarjeta");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const envio = COSTOS_ENVIO[tipoEnvio];
  const impuesto = 0;

  // Texto del envío en el resumen (así "retiro en tienda" no dice "A calcular").
  const textoEnvio =
    tipoEnvio === "retiro_tienda" ? "Gratis" : tipoEnvio === "fuera_zona" ? "A cotizar" : undefined;

  // Fecha mínima para el selector: ahora mismo, en hora local.
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  const fechaMinima = ahora.toISOString().slice(0, 16);

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

    if (new Date(fechaEntrega) < new Date()) {
      setError("La fecha de entrega no puede estar en el pasado.");
      return;
    }

    setEnviando(true);
    setError("");

    let pedidoId = null;

    try {
      const resultado = await pedidoService.crearPedidoDesdeCarrito({
        tipoEnvio,
        direccionEntrega: direccion,
        fechaEntregaEstimada: fechaEntrega,
      });

      const pedido = resultado.pedido;
      pedidoId = pedido._id;

      // El backend ya vacía el carrito; esto solo sincroniza el contexto local.
      await vaciarCarrito();

      // Fuera de zona: todavía no se crea el pago porque el total final
      // depende de la cotización de envío que hará el administrador.
      if (tipoEnvio === "fuera_zona") {
        navigate(`/mis-pedidos/${pedidoId}`, {
          state: {
            mensaje:
              "Tu pedido fue enviado para cotización. Cuando el administrador establezca el costo del envío podrás realizar el pago.",
          },
        });
        return;
      }

      if (metodoPago === "tarjeta") {
        const sesion = await stripeService.crearSesionCheckout(pedidoId);
        window.location.href = sesion.url;
        return;
      }

      // Efectivo o transferencia quedan pendientes de confirmación manual.
      await pagoService.crearPago(pedidoId, metodoPago);

      navigate(`/mis-pedidos/${pedidoId}`, {
        state: {
          mensaje:
            metodoPago === "efectivo"
              ? "Pedido creado. El pago en efectivo está pendiente de confirmación."
              : "Pedido creado. La transferencia está pendiente de confirmación.",
        },
      });
    } catch (e) {
      console.error(e);

      // Si el pedido ya se creó pero falló el pago, no lo dejamos aquí:
      // lo llevamos al detalle, donde puede pagar de nuevo.
      if (pedidoId) {
        navigate(`/mis-pedidos/${pedidoId}`, {
          state: {
            mensaje:
              "Tu pedido se creó, pero no pudimos iniciar el pago. Puedes pagarlo desde aquí.",
          },
        });
        return;
      }

      setError(
        e.response?.data?.error || e.response?.data?.mensaje || "No se pudo completar el pedido."
      );
    } finally {
      setEnviando(false);
    }
  };

  // El método de pago ya se elige arriba, así que el botón no lo repite.
  const textoBoton = enviando
    ? "Procesando..."
    : tipoEnvio === "fuera_zona"
      ? "Solicitar cotización"
      : "Confirmar pedido";

  return (
    <main className="checkout">
      <div className="checkout__contenedor">
        <header className="checkout__encabezado">
          <h1>Entrega y pago</h1>
          <p>Confirma los datos de entrega y elige cómo deseas pagar.</p>
        </header>

        <div className="checkout__layout">
          <section className="checkout__formulario">
            {/* --- 1. Dirección y fecha --- */}
            <div className="checkout__bloque">
              <h2>
                <span className="material-symbols-outlined">pin_drop</span>
                Dirección y fecha de entrega
              </h2>

              <div className="checkout__campo">
                <label htmlFor="checkout-linea1">Calle y número</label>
                <input
                  id="checkout-linea1"
                  type="text"
                  value={direccion.linea1}
                  onChange={actualizarCampo("linea1")}
                  placeholder="Av. Las Rosas 412"
                  autoComplete="street-address"
                />
              </div>

              <div className="checkout__fila">
                <div className="checkout__campo">
                  <label htmlFor="checkout-linea2">Interior / Depto (opcional)</label>
                  <input
                    id="checkout-linea2"
                    type="text"
                    value={direccion.linea2}
                    onChange={actualizarCampo("linea2")}
                  />
                </div>

                <div className="checkout__campo">
                  <label htmlFor="checkout-ciudad">Ciudad</label>
                  <input
                    id="checkout-ciudad"
                    type="text"
                    value={direccion.ciudad}
                    onChange={actualizarCampo("ciudad")}
                    placeholder="Sonsonate"
                  />
                </div>
              </div>

              <div className="checkout__campo">
                <label htmlFor="checkout-referencia">Referencia (opcional)</label>
                <textarea
                  id="checkout-referencia"
                  rows={2}
                  value={direccion.referencia}
                  onChange={actualizarCampo("referencia")}
                  placeholder="Ej. Casa blanca, portón negro"
                />
              </div>

              <div className="checkout__campo">
                <label htmlFor="checkout-fecha">Fecha y hora de entrega</label>
                <input
                  id="checkout-fecha"
                  type="datetime-local"
                  min={fechaMinima}
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>
            </div>

            {/* --- 2. Tipo de entrega --- */}
            <div className="checkout__bloque">
              <h2>
                <span className="material-symbols-outlined">local_shipping</span>
                Tipo de entrega
              </h2>

              <div className="checkout__opciones">
                {OPCIONES_ENVIO.map((opcion) => (
                  <Opcion
                    key={opcion.valor}
                    name="envio"
                    opcion={opcion}
                    seleccionado={tipoEnvio === opcion.valor}
                    onSeleccionar={setTipoEnvio}
                  />
                ))}
              </div>
            </div>

            {/* --- 3. Pago --- */}
            <div className="checkout__bloque">
              <h2>
                <span className="material-symbols-outlined">payments</span>
                Método de pago
              </h2>

              {tipoEnvio === "fuera_zona" ? (
                <div className="checkout__aviso">
                  <span className="material-symbols-outlined">info</span>
                  <p>
                    Primero cotizamos el envío. Cuando el administrador lo establezca, podrás
                    pagar desde el detalle de tu pedido.
                  </p>
                </div>
              ) : (
                <div className="checkout__opciones">
                  {OPCIONES_PAGO.map((opcion) => (
                    <Opcion
                      key={opcion.valor}
                      name="pago"
                      opcion={opcion}
                      seleccionado={metodoPago === opcion.valor}
                      onSeleccionar={setMetodoPago}
                    />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="checkout__error" role="alert">
                <span className="material-symbols-outlined">error</span>
                <p>{error}</p>
              </div>
            )}
          </section>

          {/* El único botón de acción vive en el resumen. */}
          <aside className="checkout__resumen">
            <ResumenPedido
              subtotal={subtotal}
              envio={envio}
              textoEnvio={textoEnvio}
              impuesto={impuesto}
              textoBoton={textoBoton}
              deshabilitado={enviando || !items.length}
              onContinuar={manejarConfirmar}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;