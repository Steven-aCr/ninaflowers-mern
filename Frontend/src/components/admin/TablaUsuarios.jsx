import "./TablaUsuarios.css";

function TablaUsuarios({ usuarios, onCambiarEstado }) {
  if (usuarios.length === 0) {
    return <p className="tabla-usuarios__vacio">No hay usuarios registrados.</p>;
  }

  return (
    <table className="tabla-usuarios">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Teléfono</th>
          <th>Rol</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <tr key={u._id}>
            <td>{u.nombre} {u.apellido}</td>
            <td>{u.correo}</td>
            <td>{u.telefono}</td>
            <td>
              <span className={`tabla-usuarios__rol tabla-usuarios__rol--${u.rol}`}>
                {u.rol}
              </span>
            </td>
            <td>
              <span className={`tabla-usuarios__badge ${u.activo ? "" : "tabla-usuarios__badge--inactivo"}`}>
                {u.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td>
              <button type="button" onClick={() => onCambiarEstado(u)}>
                {u.activo ? "Desactivar" : "Activar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TablaUsuarios;