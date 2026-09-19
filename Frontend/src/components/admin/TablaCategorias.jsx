import "./TablaCategorias.css";

function TablaCategorias({ categorias, onEditar, onCambiarEstado }) {
  if (categorias.length === 0) {
    return <p className="tabla-categorias__vacio">No hay categorías registradas.</p>;
  }

  return (
    <table className="tabla-categorias">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {categorias.map((cat) => (
          <tr key={cat._id}>
            <td>{cat.nombre}</td>
            <td>{cat.descripcion || "—"}</td>
            <td>
              <span className={`tabla-categorias__badge ${cat.activo ? "" : "tabla-categorias__badge--inactivo"}`}>
                {cat.activo ? "Activa" : "Inactiva"}
              </span>
            </td>
            <td className="tabla-categorias__acciones">
              <button type="button" onClick={() => onEditar(cat)}>Editar</button>
              <button type="button" onClick={() => onCambiarEstado(cat)}>
                {cat.activo ? "Desactivar" : "Activar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TablaCategorias;