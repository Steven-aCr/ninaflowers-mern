import "./TablaInventario.css";

function TablaInventario({ inventarios, onEditarMinimo }) {
  if (inventarios.length === 0) {
    return <p className="tabla-inventario__vacio">No hay registros de inventario todavía.</p>;
  }

  return (
    <table className="tabla-inventario">
      <thead>
        <tr>
          <th>Producto</th>
          <th>SKU</th>
          <th>Stock</th>
          <th>Stock mínimo</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {inventarios.map((inv) => {
          const bajoMinimo = inv.stock <= inv.stockMinimo;
          return (
            <tr key={inv._id}>
              <td>{inv.productoId?.nombre ?? "—"}</td>
              <td>{inv.productoId?.sku ?? "—"}</td>
              <td>{inv.stock}</td>
              <td>{inv.stockMinimo}</td>
              <td>
                <span className={`tabla-inventario__badge ${bajoMinimo ? "tabla-inventario__badge--alerta" : ""}`}>
                  {bajoMinimo ? "Stock bajo" : "OK"}
                </span>
              </td>
              <td>
                <button type="button" onClick={() => onEditarMinimo(inv)}>Editar mínimo</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TablaInventario;