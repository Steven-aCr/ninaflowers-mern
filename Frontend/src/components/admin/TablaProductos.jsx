import { formatearPrecio } from "../../utils/formatearPrecio.js";

// "stock" es { [productoId]: número } (viene de Inventario) o null si no se pudo cargar.
// Un producto sin registro de inventario muestra "—"; con stock 0 se marca como Agotado.
function TablaProductos({ productos, stock, onEditar, onCambiarEstado }) {
  if (productos.length === 0) {
    return <p className="admin-vacio">No hay productos que coincidan con el filtro.</p>;
  }

  const celdaStock = (id) => {
    const cantidad = stock?.[id];
    if (cantidad === undefined || cantidad === null) return "—";
    if (cantidad === 0) return <span className="admin-pill admin-pill--rojo">Agotado</span>;
    return cantidad;
  };

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Nombre del arreglo</th>
            <th>Categoría</th>
            <th>Tipo</th>
            <th className="admin-tabla__num">Precio</th>
            <th className="admin-tabla__num">Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((p) => (
            <tr key={p._id}>
              <td>
                {p.imagenes?.[0]?.url ? (
                  <img className="admin-miniatura" src={p.imagenes[0].url} alt={p.nombre} />
                ) : (
                  <div className="admin-miniatura admin-miniatura--vacia" aria-hidden="true">
                    <span className="material-symbols-outlined">local_florist</span>
                  </div>
                )}
              </td>

              <td>
                <span className="admin-tabla__principal">{p.nombre}</span>
                <span className="admin-tabla__secundario">{p.sku}</span>
              </td>

              <td>{p.categoriaId?.nombre ?? "—"}</td>

              <td>
                <span className={`admin-pill admin-pill--${p.tipoProducto === "compuesto" ? "lila" : "gris"}`}>
                  {p.tipoProducto}
                </span>
              </td>

              <td className="admin-tabla__num">{formatearPrecio(p.precio)}</td>
              <td className="admin-tabla__num">{celdaStock(p._id)}</td>

              <td>
                <span className={`admin-pill admin-pill--${p.activo ? "activo" : "inactivo"}`}>
                  {p.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <div className="admin-acciones">
                  <button type="button" className="admin-btn admin-btn--borde admin-btn--sm" onClick={() => onEditar(p)}>
                    Editar
                  </button>
                  <button type="button" className="admin-btn admin-btn--claro admin-btn--sm" onClick={() => onCambiarEstado(p)}>
                    {p.activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaProductos;
