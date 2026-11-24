import { formatearPrecio } from "../../utils/formatearPrecio.js";
import { etiquetaEstado, formatearFechaCorta, idCorto, iniciales, nombreCompleto } from "../../utils/formatosAdmin.js";

function TablaPedidos({ pedidos, onVer }) {
  if (!pedidos.length) {
    return <p className="admin-vacio">No hay pedidos que coincidan con el filtro.</p>;
  }

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Entrega</th>
            <th className="admin-tabla__num">Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido._id}>
              <td className="admin-tabla__id">{idCorto(pedido._id)}</td>

              <td>
                <div className="admin-tabla__celda-persona">
                  <span className="admin-avatar-mini" aria-hidden="true">{iniciales(pedido.usuarioId)}</span>
                  <div>
                    <span className="admin-tabla__principal">{nombreCompleto(pedido.usuarioId)}</span>
                    {pedido.usuarioId?.correo && (
                      <span className="admin-tabla__secundario">{pedido.usuarioId.correo}</span>
                    )}
                  </div>
                </div>
              </td>

              <td>{formatearFechaCorta(pedido.fechaPedido || pedido.createdAt)}</td>
              <td>{formatearFechaCorta(pedido.fechaEntregaEstimada)}</td>
              <td className="admin-tabla__num">{formatearPrecio(pedido.total)}</td>

              <td>
                <span className={`admin-pill admin-pill--${pedido.estadoPedido}`}>
                  {etiquetaEstado(pedido.estadoPedido)}
                </span>
              </td>

              <td>
                <button type="button" className="admin-btn admin-btn--borde admin-btn--sm" onClick={() => onVer(pedido)}>
                  Gestionar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaPedidos;