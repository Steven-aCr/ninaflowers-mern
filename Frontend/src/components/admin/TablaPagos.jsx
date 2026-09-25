import { formatearPrecio } from "../../utils/formatearPrecio.js";

const txt = (valor) => valor?.replaceAll("_", " ") || "—";

function TablaPagos({ pagos, onConfirmar, onReembolsar }) {
  if (!pagos.length) {
    return <div className="gestion-vacio">No hay pagos registrados.</div>;
  }

  return (
    <div className="gestion-tabla-wrap">
      <table className="gestion-tabla">
        <thead>
          <tr>
            <th>Pago</th>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Método</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Referencia</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {pagos.map((pago) => {
            const puedeConfirmar =
              pago.estado === "pendiente" &&
              (pago.metodo === "efectivo" || pago.metodo === "transferencia");

            const puedeReembolsar = pago.estado === "completado";

            return (
              <tr key={pago._id}>
                <td className="gestion-id">#{pago._id.slice(-6).toUpperCase()}</td>

                <td>
                  {pago.pedidoId?._id ? `#${pago.pedidoId._id.slice(-6).toUpperCase()}` : "—"}
                </td>

                <td>
                  {pago.usuarioId
                    ? `${pago.usuarioId.nombre || ""} ${pago.usuarioId.apellido || ""}`.trim()
                    : "—"}
                </td>

                <td>{txt(pago.metodo)}</td>
                <td>{formatearPrecio(pago.monto)}</td>

                <td>
                  <span className={`gestion-badge gestion-badge--${pago.estado}`}>
                    {txt(pago.estado)}
                  </span>
                </td>

                <td>{pago.referenciaTransaccion || "—"}</td>

                <td>
                  {puedeConfirmar && (
                    <button className="gestion-link" onClick={() => onConfirmar(pago)}>
                      Confirmar recepción
                    </button>
                  )}

                  {puedeReembolsar && (
                    <button className="gestion-link" onClick={() => onReembolsar(pago)}>
                      Reembolsar
                    </button>
                  )}

                  {!puedeConfirmar && !puedeReembolsar && <span>—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TablaPagos;