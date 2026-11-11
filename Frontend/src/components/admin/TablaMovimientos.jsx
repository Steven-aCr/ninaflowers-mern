import "./TablaMovimientos.css";

const MOTIVOS = {
  compra: "Compra",
  venta: "Venta",
  produccion: "Producción",
  merma: "Merma",
  ajuste: "Ajuste",
  devolucion: "Devolución",
};

const nombreCompleto = (usuario) =>
  usuario ? `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || "—" : "—";

function TablaMovimientos({ movimientos }) {
  if (movimientos.length === 0) {
    return <p className="tabla-movimientos__vacio">No hay movimientos con estos filtros.</p>;
  }

  return (
    <div className="tabla-scroll">
      <table className="tabla-movimientos">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Motivo</th>
            <th className="tabla-movimientos__num">Cantidad</th>
            <th className="tabla-movimientos__num">Stock resultante</th>
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
                  <span className="tabla-movimientos__principal">
                    {fecha.toLocaleDateString("es-SV")}
                  </span>
                  <span className="tabla-movimientos__secundario">
                    {fecha.toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </td>

                <td>
                  <span className="tabla-movimientos__principal">
                    {m.productoId?.nombre || "Producto"}
                  </span>
                  {m.productoId?.sku && (
                    <span className="tabla-movimientos__secundario">{m.productoId.sku}</span>
                  )}
                </td>

                <td>
                  <span className={`tabla-movimientos__badge tabla-movimientos__badge--${m.tipo}`}>
                    {m.tipo}
                  </span>
                </td>

                <td>{MOTIVOS[m.motivo] || m.motivo}</td>

                <td className="tabla-movimientos__num">
                  <span className={`tabla-movimientos__cantidad tabla-movimientos__cantidad--${m.tipo}`}>
                    {signo}{m.cantidad}
                  </span>
                </td>

                <td className="tabla-movimientos__num">{m.stockResultante}</td>

                <td>
                  {m.pedidoId ? (
                    <span className="tabla-movimientos__codigo">
                      #{(m.pedidoId._id || m.pedidoId).toString().slice(-6).toUpperCase()}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

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