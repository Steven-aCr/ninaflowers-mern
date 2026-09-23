import { formatearPrecio } from "../../utils/formatearPrecio.js";

const etiqueta = (v) => v?.replaceAll("_", " ") ?? "—";
function TablaPedidos({ pedidos, onVer }) {
  if (!pedidos.length) return <div className="gestion-vacio">No hay pedidos que coincidan con los filtros.</div>;
  return <div className="gestion-tabla-wrap"><table className="gestion-tabla"><thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Entrega</th><th>Total</th><th>Estado</th><th></th></tr></thead><tbody>
    {pedidos.map(p => <tr key={p._id}><td className="gestion-id">#{p._id.slice(-6).toUpperCase()}</td><td><strong>{p.usuarioId ? `${p.usuarioId.nombre ?? ""} ${p.usuarioId.apellido ?? ""}`.trim() : "—"}</strong><small>{p.usuarioId?.correo}</small></td><td>{new Date(p.fechaPedido || p.createdAt).toLocaleDateString("es-SV")}</td><td>{new Date(p.fechaEntregaEstimada).toLocaleDateString("es-SV")}</td><td>{formatearPrecio(p.total)}</td><td><span className={`gestion-badge gestion-badge--${p.estadoPedido}`}>{etiqueta(p.estadoPedido)}</span></td><td><button className="gestion-link" onClick={() => onVer(p)}>Gestionar</button></td></tr>)}
  </tbody></table></div>;
}
export default TablaPedidos;
