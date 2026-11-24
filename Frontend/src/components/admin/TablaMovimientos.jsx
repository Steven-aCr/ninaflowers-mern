import { idCorto, nombreCompleto } from "../../utils/formatosAdmin.js";

const MOTIVOS = {
  compra: "Compra",
  venta: "Venta",
  produccion: "Producción",
  merma: "Merma",
  ajuste: "Ajuste",
  devolucion: "Devolución",
};

function TablaMovimientos({ movimientos }) {
  if (movimientos.length === 0) {
    return <p className="admin-vacio">No hay movimientos con estos filtros.</p>;
  }

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Motivo</th>
            <th className="admin-tabla__num">Cantidad</th>
            <th className="admin-tabla__num">Stock resultante</th>
            <th>Pedido</th>
            <th>Proveedor</th>
            <th>Registrado por</th>
          </tr>
        </thead>

        <tbody>
          {movimientos.map((m) => {
            const fecha = new Date(m.fecha);
            const signo = m.tipo === "entrada" ? "+" : "−";

            return (
              <tr key={m._id}>
                <td>
                  <span className="admin-tabla__principal">{fecha.toLocaleDateString("es-SV")}</span>
                  <span className="admin-tabla__secundario">
                    {fecha.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </td>

                <td>
                  <span className="admin-tabla__principal">{m.productoId?.nombre || "Producto"}</span>
                  {m.productoId?.sku && <span className="admin-tabla__secundario">{m.productoId.sku}</span>}
                </td>

                <td>
                  <span className={`admin-pill admin-pill--${m.tipo}`}>{m.tipo}</span>
                </td>

                <td>{MOTIVOS[m.motivo] || m.motivo}</td>

                <td className="admin-tabla__num">
                  <span className={`admin-tabla__cantidad--${m.tipo}`}>
                    {signo}{m.cantidad}
                  </span>
                </td>

                <td className="admin-tabla__num">{m.stockResultante}</td>

                <td className="admin-tabla__id">{m.pedidoId ? idCorto(m.pedidoId._id || m.pedidoId) : "—"}</td>

                <td>{m.proveedorId?.nombre ?? "—"}</td>

                <td>{nombreCompleto(m.usuarioId)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TablaMovimientos;
