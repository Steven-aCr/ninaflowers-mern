import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ResumenPedido from "../../components/cliente/ResumenPedido.jsx";
import Boton from "../../components/common/Boton.jsx";
import { useCarrito } from "../../hooks/useCarrito.js";
import "./Checkout.css";

const COSTO_ENVIO_REFERENCIAL = 8;
const TASA_IMPUESTO = 0.1;

// Campos de dirección según tu Direccion embebida: etiqueta, linea1,
// linea2, ciudad, referencia. "metodo" usa el mismo enum que pagoModel:
// tarjeta | efectivo | transferencia.
//
// El botón "Continuar con el pago" todavía NO llama a pedidoService ni
// pagoService (no existe conexión real). Por ahora solo vacía el carrito
// y navega a Mis Pedidos, para poder probar el flujo completo de principio
// a fin. Cuando conectemos el backend, aquí se hará en este orden:
//   1. pedidoService.crearPedido({ productos: items, direccionEntrega, ... })
//   2. pagoService.crearPago({ pedidoId, metodo })
//   3. vaciarCarrito() SOLO si los dos pasos anteriores tuvieron éxito.
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
  const [metodo, setMetodo] = useState("tarjeta");
  const [error, setError] = useState("");

  const envio = COSTO_ENVIO_REFERENCIAL;
  const impuesto = subtotal * TASA_IMPUESTO;

  const actualizarCampo = (campo) => (evento) => {
    setDireccion((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const manejarConfirmar = () => {
    if (!direccion.linea1.trim() || !direccion.ciudad.trim()) {
      setError("Completa al menos la calle y la ciudad de entrega.");
      return;
    }
    setError("");
    vaciarCarrito();
    navigate("/mis-pedidos");
  };

  return (
    <main className="checkout">
      <div className="checkout__contenedor">
        <header className="checkout__encabezado">
          <h1>Entrega y pago</h1>
          <p>Confirma los datos de envío y el método de pago de tu pedido.</p>
        </header>

        <div className="checkout__layout">
          <section className="checkout__formulario">
            <div className="checkout__bloque">
              <h2>
                <span className="material-symbols-outlined">pin_drop</span>
                Dirección de envío
              </h2>

              <div className="checkout__campo">
                <label htmlFor="checkout-linea1">Calle y número</label>
                <input
                  id="checkout-linea1"
                  type="text"
                  value={direccion.linea1}
                  onChange={actualizarCampo("linea1")}
                  placeholder="Av. Las Rosas 412"
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
                    placeholder="Depto 3B"
                  />
                </div>
                <div className="checkout__campo">
                  <label htmlFor="checkout-ciudad">Ciudad</label>
                  <input
                    id="checkout-ciudad"
                    type="text"
                    value={direccion.ciudad}
                    onChange={actualizarCampo("ciudad")}
                    placeholder="Ciudad Jardín"
                  />
                </div>
              </div>

              <div className="checkout__campo">
                <label htmlFor="checkout-referencia">Referencia de entrega (opcional)</label>
                <input
                  id="checkout-referencia"
                  type="text"
                  value={direccion.referencia}
                  onChange={actualizarCampo("referencia")}
                  placeholder="Portón blanco, timbre lateral"
                />
              </div>
            </div>

            <div className="checkout__bloque">
              <h2>
                <span className="material-symbols-outlined">credit_card</span>
                Método de pago
              </h2>

              <div className="checkout__metodos">
                {[
                  { valor: "tarjeta", icono: "credit_card", texto: "Tarjeta" },
                  { valor: "efectivo", icono: "payments", texto: "Efectivo" },
                  { valor: "transferencia", icono: "account_balance", texto: "Transferencia" },
                ].map((opcion) => (
                  <button
                    key={opcion.valor}
                    type="button"
                    className={
                      metodo === opcion.valor
                        ? "checkout__metodo checkout__metodo--activo"
                        : "checkout__metodo"
                    }
                    onClick={() => setMetodo(opcion.valor)}
                  >
                    <span className="material-symbols-outlined">{opcion.icono}</span>
                    <span>{opcion.texto}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="checkout__error">{error}</p>}
          </section>

          <section className="checkout__resumen">
            <ResumenPedido
              subtotal={subtotal}
              envio={envio}
              impuesto={impuesto}
              textoBoton="Continuar con el pago"
              onContinuar={manejarConfirmar}
              deshabilitado={items.length === 0}
            />
            <div className="checkout__nota">
              <Boton variante="fantasma" onClick={() => navigate("/carrito")} icono="arrow_back">
                Volver a la bolsa
              </Boton>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
