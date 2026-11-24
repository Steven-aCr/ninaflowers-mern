import { formatearPrecio } from "../../utils/formatearPrecio.js";
import { etiquetaEstado, formatearFechaCorta, idCorto, iniciales, nombreCompleto } from "../../utils/formatosAdmin.js";

// Tarjeta lateral "Detalle del usuario": contacto, direcciones guardadas y pedidos recientes.
// - "pedidos" es null mientras carga, [] si no hay, o un arreglo con los últimos pedidos.
function DetalleUsuario({ usuario, pedidos, esPropio, onCambiarEstado }) {
  if (!usuario) {
    return (
      <aside className="admin-panel usuario-detalle">
        <h2 className="admin-panel__titulo">Detalle del usuario</h2>
        <p className="admin-vacio">Selecciona un usuario de la tabla para ver su información.</p>
      </aside>
    );
  }

  return (
    <aside className="admin-panel usuario-detalle">
      <h2 className="admin-panel__titulo">Detalle del usuario</h2>

      <div className="usuario-detalle__cabecera">
        <span className="usuario-detalle__avatar" aria-hidden="true">{iniciales(usuario)}</span>
        <h3 className="usuario-detalle__nombre">{nombreCompleto(usuario)}</h3>
        <div className="usuario-detalle__etiquetas">
          <span
            className={`admin-pill admin-pill--${
              usuario.activo ? "activo" : "inactivo"
            }`}>
            {usuario.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      <section className="usuario-detalle__bloque">
        <h3>Datos de contacto</h3>
        <p>{usuario.correo}</p>
        <p>{usuario.telefono}</p>
        <p className="usuario-detalle__nota">Registrado el {formatearFechaCorta(usuario.createdAt)}</p>
      </section>

      <section className="usuario-detalle__bloque">
        <h3>Direcciones guardadas</h3>
        {!usuario.direcciones?.length ? (
          <p className="usuario-detalle__vacio">Sin direcciones guardadas.</p>
        ) : (
          usuario.direcciones.map((d, indice) => (
            <div className="usuario-detalle__direccion" key={indice}>
              <span className="admin-pill admin-pill--verde">{d.etiqueta}</span>
              <p>
                {d.linea1}
                {d.linea2 ? `, ${d.linea2}` : ""} — {d.ciudad}
              </p>
              {d.referencia && <p className="usuario-detalle__nota">{d.referencia}</p>}
            </div>
          ))
        )}
      </section>

      <section className="usuario-detalle__bloque">
        <h3>Pedidos recientes</h3>
        {pedidos === null ? (
          <p className="usuario-detalle__vacio">Cargando pedidos...</p>
        ) : pedidos.length === 0 ? (
          <p className="usuario-detalle__vacio">Este usuario aún no tiene pedidos.</p>
        ) : (
          pedidos.map((p) => (
            <div className="usuario-detalle__linea" key={p._id}>
              <span>
                <strong className="admin-tabla__id">{idCorto(p._id)}</strong>{" "}
                <span className="usuario-detalle__nota">{formatearFechaCorta(p.fechaPedido || p.createdAt)}</span>
              </span>
              <span className="usuario-detalle__fin">
                {formatearPrecio(p.total)}
                <span className={`admin-pill admin-pill--${p.estadoPedido}`}>{etiquetaEstado(p.estadoPedido)}</span>
              </span>
            </div>
          ))
        )}
      </section>

      <button
        type="button"
        className="admin-btn admin-btn--claro admin-btn--full"
        disabled={esPropio}
        onClick={() => onCambiarEstado(usuario)}
      >
        {usuario.activo ? "Desactivar usuario" : "Activar usuario"}
      </button>
      {esPropio && <p className="usuario-detalle__nota">Es tu propia cuenta: no puedes desactivarla.</p>}
    </aside>
  );
}

export default DetalleUsuario;
