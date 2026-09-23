import { useState } from "react";
import * as pedidoService from "../../services/pedidoService.js";
import { useNavigate } from "react-router-dom";
import ResumenPedido from "../../components/cliente/ResumenPedido.jsx";
import Boton from "../../components/common/Boton.jsx";
import { useCarrito } from "../../hooks/useCarrito.js";
import "./Checkout.css";

const COSTOS_ENVIO = { retiro_tienda: 0, zona_cubierta: 2, fuera_zona: 0 };

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
  const [tipoEnvio, setTipoEnvio] = useState("zona_cubierta");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const envio = COSTOS_ENVIO[tipoEnvio];
  const impuesto = 0;

  const actualizarCampo = (campo) => (evento) => {
    setDireccion((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const manejarConfirmar = async () => {
    if (!direccion.linea1.trim() || !direccion.ciudad.trim()) { setError("Completa al menos la calle y la ciudad de entrega."); return; }
    if (!fechaEntrega) { setError("Selecciona una fecha estimada de entrega."); return; }
    setEnviando(true); setError("");
    try {
      await pedidoService.crearPedidoDesdeCarrito({ tipoEnvio, direccionEntrega: direccion, fechaEntregaEstimada: fechaEntrega });
      await vaciarCarrito();
      navigate("/mis-pedidos");
    } catch (e) { setError(e.response?.data?.error || "No se pudo crear el pedido."); }
    finally { setEnviando(false); }
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
              <h2><span className="material-symbols-outlined">local_shipping</span>Tipo de entrega</h2>
              <div className="checkout__metodos">
                {[{valor:"retiro_tienda",icono:"store",texto:"Retiro en tienda"},{valor:"zona_cubierta",icono:"local_shipping",texto:"Zona cubierta"},{valor:"fuera_zona",icono:"distance",texto:"Fuera de zona"}].map(opcion => (
                  <button key={opcion.valor} type="button" className={tipoEnvio===opcion.valor?"checkout__metodo checkout__metodo--activo":"checkout__metodo"} onClick={()=>setTipoEnvio(opcion.valor)}><span className="material-symbols-outlined">{opcion.icono}</span><span>{opcion.texto}</span></button>
                ))}
              </div>
              {tipoEnvio === "fuera_zona" && <p className="checkout__error">El costo de envío será cotizado por administración antes de confirmar el pedido.</p>}
              <div className="checkout__campo"><label htmlFor="checkout-fecha">Fecha estimada de entrega</label><input id="checkout-fecha" type="datetime-local" value={fechaEntrega} min={new Date(Date.now()+3600000).toISOString().slice(0,16)} onChange={e=>setFechaEntrega(e.target.value)} /></div>
            </div>

            {error && <p className="checkout__error">{error}</p>}
          </section>

          <section className="checkout__resumen">
            <ResumenPedido
              subtotal={subtotal}
              envio={envio}
              impuesto={impuesto}
              textoBoton={enviando ? "Creando pedido..." : "Confirmar pedido"}
              onContinuar={manejarConfirmar}
              deshabilitado={items.length === 0 || enviando}
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