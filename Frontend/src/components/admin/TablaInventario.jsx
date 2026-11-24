function estadoStock(inv) {
  if (inv.stock === 0) return { clase: "rojo", texto: "Agotado" };
  if (inv.stock <= inv.stockMinimo) return { clase: "alerta", texto: "Stock bajo" };
  return { clase: "ok", texto: "Suficiente" };
}

function TablaInventario({ inventarios, onEditarMinimo, onProducir }) {
  if (inventarios.length === 0) {
    return <p className="admin-vacio">No hay registros de inventario que coincidan con el filtro.</p>;
  }

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Tipo</th>
            <th className="admin-tabla__num">Stock actual</th>
            <th className="admin-tabla__num">Stock mínimo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {inventarios.map((inv) => {
            const esCompuesto = inv.productoId?.tipoProducto === "compuesto";
            const estado = estadoStock(inv);

            return (
              <tr key={inv._id}>
                <td>
                  <span className="admin-tabla__principal">{inv.productoId?.nombre ?? "—"}</span>
                  <span className="admin-tabla__secundario">{inv.productoId?.sku ?? "—"}</span>
                </td>

                <td>
                  <span className={`admin-pill admin-pill--${esCompuesto ? "lila" : "gris"}`}>
                    {esCompuesto ? "Compuesto" : "Simple"}
                  </span>
                </td>

                <td className="admin-tabla__num">{inv.stock}</td>
                <td className="admin-tabla__num">{inv.stockMinimo}</td>

                <td>
                  <span className={`admin-pill admin-pill--${estado.clase}`}>{estado.texto}</span>
                </td>

                <td>
                  <div className="admin-acciones">
                    {esCompuesto && (
                      <button type="button" className="admin-btn admin-btn--claro admin-btn--sm" onClick={() => onProducir(inv)}>
                        Producir
                      </button>
                    )}
                    <button type="button" className="admin-btn admin-btn--borde admin-btn--sm" onClick={() => onEditarMinimo(inv)}>
                      Editar mínimo
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TablaInventario;
