import "./TablaMovimientos.css";

function TablaMovimientos({ movimientos }) {
  if (movimientos.length === 0) {
    return <p className="tabla-movimientos__vacio">No hay movimientos con estos filtros.</p>;
  }

  return (
    <table className="tabla-movimientos">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Producto</th>
          <th>Tipo</th>
          <th>Motivo</th>
          <th>Cantidad</th>
          <th>Stock resultante</th>
          <th>Pedido</th>
          <th>Proveedor</th>
          <th>Registrado por</th>
        </tr>
      </thead>

      <tbody>
        {movimientos.map((m) => (
          <tr key={m._id}>
            <td>{new Date(m.fecha).toLocaleString()}</td>

            <td>
              {m.productoId?.nombre || "Producto"} {m.productoId?.sku ? `(${m.productoId.sku})` : ""}
            </td>

            <td>
              <span className={`tabla-movimientos__badge tabla-movimientos__badge--${m.tipo}`}>
                {m.tipo}
              </span>
            </td>

            <td>{m.motivo}</td>
            <td>{m.cantidad}</td>
            <td>{m.stockResultante}</td>

            <td>
              {m.pedidoId
                ? `#${(m.pedidoId._id || m.pedidoId).toString().slice(-6).toUpperCase()}`
                : "—"}
            </td>

            <td>{m.proveedorId?.nombre ?? "—"}</td>

            <td>
              {m.usuarioId
                ? `${m.usuarioId.nombre || ""} ${m.usuarioId.apellido || ""}`.trim()
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TablaMovimientos;