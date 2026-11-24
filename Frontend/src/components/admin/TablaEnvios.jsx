import { formatearPrecio } from "../../utils/formatearPrecio.js";
import { TIPOS_ENVIO } from "../../utils/constantes.js";
import { etiquetaEstado, idCorto } from "../../utils/formatosAdmin.js";

// Colores de pill por tipo de envío (clases de color de admin.css).
const COLOR_TIPO = {
  retiro_tienda: "verde",
  zona_cubierta: "lila",
  fuera_zona: "rosa",
};

const etiquetaTipo = (valor) => TIPOS_ENVIO.find((t) => t.valor === valor)?.etiqueta || etiquetaEstado(valor);

export default function TablaEnvios({ envios, onEditar }) {
  // OJO: antes este "return" iba solo en una línea y el JSX en la siguiente; JavaScript
  // insertaba un ";" automático y la función devolvía undefined cuando no había envíos.
  if (!envios.length) {
    return <p className="admin-vacio">No hay envíos que coincidan con el filtro.</p>;
  }

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Envío</th>
            <th>Pedido</th>
            <th>Tipo</th>
            <th className="admin-tabla__num">Costo</th>
            <th className="admin-tabla__num">Total del pedido</th>
            <th>Estado del pedido</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {envios.map((envio) => (
            <tr key={envio._id}>
              <td className="admin-tabla__id">{idCorto(envio._id)}</td>
              <td className="admin-tabla__id">{idCorto(envio.pedidoId?._id)}</td>

              <td>
                <span className={`admin-pill admin-pill--${COLOR_TIPO[envio.tipo] || "gris"}`}>
                  {etiquetaTipo(envio.tipo)}
                </span>
              </td>

              <td className="admin-tabla__num">{formatearPrecio(envio.costoEnvio)}</td>
              <td className="admin-tabla__num">
                {envio.pedidoId ? formatearPrecio(envio.pedidoId.total) : "—"}
              </td>

              <td>
                {envio.pedidoId?.estadoPedido ? (
                  <span className={`admin-pill admin-pill--${envio.pedidoId.estadoPedido}`}>
                    {etiquetaEstado(envio.pedidoId.estadoPedido)}
                  </span>
                ) : (
                  "—"
                )}
              </td>

              <td>
                <button type="button" className="admin-btn admin-btn--borde admin-btn--sm" onClick={() => onEditar(envio)}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}