function TablaProveedores({ proveedores, onEditar, onCambiarEstado }) {
  if (proveedores.length === 0) {
    return <p className="admin-vacio">No hay proveedores que coincidan con el filtro.</p>;
  }

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Proveedor</th>
            <th>Teléfono / Correo</th>
            <th>Dirección</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {proveedores.map((prov) => (
            <tr key={prov._id}>
              <td>
                <div className="admin-tabla__celda-persona">
                  <span className="admin-avatar-mini" aria-hidden="true">
                    {(prov.nombre || "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="admin-tabla__principal">{prov.nombre}</span>
                </div>
              </td>

              <td>
                <span className="admin-tabla__principal">{prov.telefono}</span>
                <span className="admin-tabla__secundario">{prov.correo}</span>
              </td>

              <td>{prov.direccion}</td>

              <td>
                <span className={`admin-pill admin-pill--${prov.activo ? "activo" : "inactivo"}`}>
                  {prov.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              <td>
                <div className="admin-acciones">
                  <button type="button" className="admin-btn admin-btn--borde admin-btn--sm" onClick={() => onEditar(prov)}>
                    Editar
                  </button>
                  <button type="button" className="admin-btn admin-btn--claro admin-btn--sm" onClick={() => onCambiarEstado(prov)}>
                    {prov.activo ? "Desactivar" : "Activar"}
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

export default TablaProveedores;
