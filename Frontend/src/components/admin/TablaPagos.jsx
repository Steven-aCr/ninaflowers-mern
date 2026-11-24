import { formatearPrecio } from "../../utils/formatearPrecio.js";
import { METODOS_PAGO } from "../../utils/constantes.js";
import { etiquetaEstado, formatearFechaCorta, idCorto, iniciales, nombreCompleto } from "../../utils/formatosAdmin.js";

const etiquetaMetodo = (valor) => METODOS_PAGO.find((m) => m.valor === valor)?.etiqueta || etiquetaEstado(valor);

// Las referencias de Stripe son larguísimas (cs_test_a1B2...): se muestran los últimos
// 8 caracteres y el valor completo queda en el "title" al pasar el mouse.
const referenciaCorta = (referencia) =>
  referencia.length > 12 ? `…${referencia.slice(-8)}` : referencia;

function TablaPagos({ pagos, onConfirmar, onReembolsar }) {
  if (!pagos.length) {
    return <p className="admin-vacio">No hay pagos que coincidan con el filtro.</p>;
  }

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Pago</th>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Método</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Referencia</th>
            <th className="admin-tabla__num">Monto</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {pagos.map((pago) => {
            // Solo efectivo y transferencia se confirman a mano; la tarjeta la confirma Stripe.
            const puedeConfirmar =
              pago.estado === "pendiente" && (pago.metodo === "efectivo" || pago.metodo === "transferencia");
            const puedeReembolsar = pago.estado === "completado";

            return (
              <tr key={pago._id}>
                <td className="admin-tabla__id">{idCorto(pago._id)}</td>
                <td className="admin-tabla__id">{idCorto(pago.pedidoId?._id)}</td>

                <td>
                  <div className="admin-tabla__celda-persona">
                    <span className="admin-avatar-mini" aria-hidden="true">{iniciales(pago.usuarioId)}</span>
                    <span className="admin-tabla__principal">{nombreCompleto(pago.usuarioId)}</span>
                  </div>
                </td>

                <td>{etiquetaMetodo(pago.metodo)}</td>
                <td>{formatearFechaCorta(pago.createdAt)}</td>

                <td>
                  <span className={`admin-pill admin-pill--${pago.estado}`}>{etiquetaEstado(pago.estado)}</span>
                </td>

                <td title={pago.referenciaTransaccion || undefined}>
                  {pago.referenciaTransaccion ? referenciaCorta(pago.referenciaTransaccion) : "—"}
                </td>

                <td className="admin-tabla__num">{formatearPrecio(pago.monto)}</td>

                <td>
                  {puedeConfirmar && (
                    <button type="button" className="admin-btn admin-btn--claro admin-btn--sm" onClick={() => onConfirmar(pago)}>
                      Confirmar recepción
                    </button>
                  )}

                  {puedeReembolsar && (
                    <button type="button" className="admin-btn admin-btn--borde admin-btn--sm" onClick={() => onReembolsar(pago)}>
                      Reembolsar
                    </button>
                  )}

                  {!puedeConfirmar && !puedeReembolsar && "—"}
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