import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import * as pedidoService from "../../services/pedidoService.js";
import Loader from "../../components/common/Loader.jsx";
import { obtenerEstadoPedido } from "../../utils/constantes.js";
import { formatearPrecio } from "../../utils/formatearPrecio.js";
import "./DetallePedido.css";

// NOTA: recibe "pedido" por props (null = no encontrado). El :id de la URL
// ya se lee con useParams para cuando conectemos
// pedidoService.buscarPedidoId(id) en un useEffect.
//
// El resumen de precios NO reutiliza el componente ResumenPedido: ese
// componente está pensado para Carrito/Checkout (recalcula el total y
// siempre muestra un botón de acción). Aquí el pedido ya está cerrado —
// se muestran los montos guardados tal cual, sin botón.
function DetallePedido() {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);
  useEffect(() => { (async () => { try { setPedido(await pedidoService.obtenerPedido(id)); } catch { setPedido(null); } finally { setCargando(false); } })(); }, [id]);
  if (cargando) return <main className="detalle-pedido"><Loader texto="Cargando pedido..." /></main>;

  if (!pedido) {
    return (
      <main className="detalle-pedido detalle-pedido--vacio">
        <h1>Pedido no encontrado</h1>
        <Link to="/mis-pedidos">Volver a mis pedidos</Link>
      </main>
    );
  }

  const estado = obtenerEstadoPedido(pedido.estadoPedido);

  return (
    <main className="detalle-pedido">
      <div className="detalle-pedido__contenedor">
        <Link to="/mis-pedidos" className="detalle-pedido__volver">
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Volver a mis pedidos</span>
        </Link>

        <div className="detalle-pedido__encabezado">
          <div>
            <span className="detalle-pedido__id">Pedido #{pedido._id.slice(-6).toUpperCase()}</span>
            <h1>
              {new Date(pedido.fechaPedido).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h1>
          </div>
          {estado && (
            <span className={`detalle-pedido__badge detalle-pedido__badge--${estado.valor}`}>
              <span className="material-symbols-outlined">{estado.icono}</span>
              {estado.etiqueta}
            </span>
          )}
        </div>

        <div className="detalle-pedido__layout">
          <section className="detalle-pedido__principal">
            <div className="detalle-pedido__tarjeta">
              <h2>Productos</h2>
              <ul className="detalle-pedido__productos">
                {pedido.productos.map((item, indice) => (
                  <li key={indice}>
                    <span>
                      {item.cantidad}× {item.nombreProducto}
                    </span>
                    <span>{formatearPrecio(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="detalle-pedido__tarjeta">
              <h2>Dirección de entrega</h2>
              <p>
                {pedido.direccionEntrega.linea1}
                {pedido.direccionEntrega.linea2 ? `, ${pedido.direccionEntrega.linea2}` : ""}
              </p>
              <p>{pedido.direccionEntrega.ciudad}</p>
              {pedido.direccionEntrega.referencia && (
                <p className="detalle-pedido__referencia">{pedido.direccionEntrega.referencia}</p>
              )}
            </div>

            {pedido.historialEstados && pedido.historialEstados.length > 0 && (
              <div className="detalle-pedido__tarjeta">
                <h2>Historial</h2>
                <ul className="detalle-pedido__historial">
                  {pedido.historialEstados.map((evento, indice) => {
                    const estadoEvento = obtenerEstadoPedido(evento.estado);
                    return (
                      <li key={indice}>
                        <span className="material-symbols-outlined">
                          {estadoEvento?.icono || "circle"}
                        </span>
                        <div>
                          <p>{estadoEvento?.etiqueta || evento.estado}</p>
                          <span>{new Date(evento.fecha).toLocaleString("es-ES")}</span>
                          {evento.comentario && (
                            <p className="detalle-pedido__comentario">{evento.comentario}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          <section className="detalle-pedido__resumen">
            <div className="detalle-pedido__tarjeta">
              <h2>Resumen</h2>
              <div className="detalle-pedido__resumen-fila">
                <span>Subtotal</span>
                <span>{formatearPrecio(pedido.subtotal)}</span>
              </div>
              {pedido.descuento > 0 && (
                <div className="detalle-pedido__resumen-fila">
                  <span>Descuento</span>
                  <span>-{formatearPrecio(pedido.descuento)}</span>
                </div>
              )}
              <div className="detalle-pedido__resumen-fila">
                <span>Impuesto</span>
                <span>{formatearPrecio(pedido.impuesto)}</span>
              </div>
              <div className="detalle-pedido__resumen-total">
                <span>Total</span>
                <span>{formatearPrecio(pedido.total)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default DetallePedido;
