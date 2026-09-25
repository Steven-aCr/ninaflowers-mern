import "./TablaInventario.css";

function TablaInventario({ inventarios, onEditarMinimo, onProducir }) {
  if (inventarios.length === 0) {
    return <p className="tabla-inventario__vacio">No hay registros de inventario todavía.</p>;
  }

  return (
    <table className="tabla-inventario">
      <thead>
        <tr>
          <th>Producto</th>
          <th>SKU</th>
          <th>Tipo</th>
          <th>Stock</th>
          <th>Stock mínimo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {inventarios.map((inv) => {
          const bajoMinimo = inv.stock <= inv.stockMinimo;
          const esCompuesto = inv.productoId?.tipoProducto === "compuesto";

          return (
            <tr key={inv._id}>
              <td>{inv.productoId?.nombre ?? "—"}</td>
              <td>{inv.productoId?.sku ?? "—"}</td>

              <td>
                <span className={`tabla-inventario__tipo ${esCompuesto ? "tabla-inventario__tipo--compuesto" : ""}`}>
                  {esCompuesto ? "Compuesto" : "Simple"}
                </span>
              </td>

              <td>{inv.stock}</td>
              <td>{inv.stockMinimo}</td>

              <td>
                <span className={`tabla-inventario__badge ${bajoMinimo ? "tabla-inventario__badge--alerta" : ""}`}>
                  {bajoMinimo ? "Stock bajo" : "OK"}
                </span>
              </td>

              <td>
                <div className="tabla-inventario__acciones">
                  {esCompuesto && (
                    <button
                      type="button"
                      className="tabla-inventario__btn-producir"
                      onClick={() => onProducir(inv)}
                    >
                      Producir
                    </button>
                  )}

                  <button type="button" onClick={() => onEditarMinimo(inv)}>
                    Editar mínimo
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default TablaInventario;