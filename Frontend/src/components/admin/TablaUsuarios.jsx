
import { iniciales, nombreCompleto } from "../../utils/formatosAdmin.js";

function TablaUsuarios({ usuarios, seleccionadoId, onVer }) {
  if (usuarios.length === 0) {
    return (
      <p className="admin-vacio">
        No hay usuarios que coincidan con el filtro.
      </p>
    );
  }

  return (
    <div className="admin-tabla-wrap">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo / Teléfono</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => {
            const seleccionado = u._id === seleccionadoId;

            return (
              <tr
                key={u._id}
                className={
                  seleccionado ? "usuarios-fila--activa" : ""
                }
                onClick={() => onVer(u)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onVer(u);
                  }
                }}
                tabIndex={0}
                aria-selected={seleccionado}
                aria-label={`Seleccionar usuario ${nombreCompleto(u)}`}
              >
                <td>
                  <div className="admin-tabla__celda-persona">
                    <span
                      className="admin-avatar-mini"
                      aria-hidden="true"
                    >
                      {iniciales(u)}
                    </span>

                    <span className="admin-tabla__principal">
                      {nombreCompleto(u)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="admin-tabla__principal">
                    {u.correo}
                  </span>

                  <span className="admin-tabla__secundario">
                    {u.telefono || "Sin teléfono"}
                  </span>
                </td>

                <td>
                  <span
                    className={`admin-pill admin-pill--${
                      u.activo ? "activo" : "inactivo"
                    }`}
                  >
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TablaUsuarios;
