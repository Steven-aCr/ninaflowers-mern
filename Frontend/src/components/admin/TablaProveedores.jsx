import "./TablaProveedores.css";

function TablaProveedores({ proveedores, onEditar, onCambiarEstado }) {
  if (proveedores.length === 0) {
    return <p className="tabla-proveedores__vacio">No hay proveedores registrados.</p>;
  }

  return (
    <table className="tabla-proveedores">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>Correo</th>
          <th>Dirección</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {proveedores.map((prov) => (
          <tr key={prov._id}>
            <td>{prov.nombre}</td>
            <td>{prov.telefono}</td>
            <td>{prov.correo}</td>
            <td>{prov.direccion}</td>
            <td>
              <span className={`tabla-proveedores__badge ${prov.activo ? "" : "tabla-proveedores__badge--inactivo"}`}>
                {prov.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="tabla-proveedores__acciones">
              <button type="button" onClick={() => onEditar(prov)}>Editar</button>
              <button type="button" onClick={() => onCambiarEstado(prov)}>
                {prov.activo ? "Desactivar" : "Activar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TablaProveedores;