// "conteos" es { [categoriaId]: cantidad de productos } o null mientras carga / si falla.
function TablaCategorias({ categorias, conteos, onEditar, onCambiarEstado }) {
  if (categorias.length === 0) {
    return <p className="admin-vacio">No hay categorías que coincidan con el filtro.</p>;
  }

  const textoProductos = (id) => {
    const cantidad = conteos?.[id];
    if (cantidad === undefined || cantidad === null) return "—";
    return `${cantidad} ${cantidad === 1 ? "producto" : "productos"}`;
  };

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Cantidad de productos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {categorias.map((cat) => (
            <tr key={cat._id}>
              <td><span className="admin-tabla__principal">{cat.nombre}</span></td>
              <td>{cat.descripcion || "—"}</td>
              <td>{textoProductos(cat._id)}</td>
              <td>
                <span className={`admin-pill admin-pill--${cat.activo ? "activo" : "inactivo"}`}>
                  {cat.activo ? "Activa" : "Inactiva"}
                </span>
              </td>
              <td>
                <div className="admin-acciones">
                  <button type="button" className="admin-btn admin-btn--borde admin-btn--sm" onClick={() => onEditar(cat)}>
                    Editar
                  </button>
                  <button type="button" className="admin-btn admin-btn--claro admin-btn--sm" onClick={() => onCambiarEstado(cat)}>
                    {cat.activo ? "Desactivar" : "Activar"}
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

export default TablaCategorias;
