import { Link } from "react-router-dom";
import { tiempoRelativo } from "../../utils/formatosAdmin.js";

const MOTIVOS = {
  compra: "Compra",
  venta: "Venta",
  produccion: "Producción",
  merma: "Merma",
  ajuste: "Ajuste",
  devolucion: "Devolución",
};

// Panel lateral de Inventario: los últimos movimientos (como "Movimientos recientes" del diseño).
// "movimientos" es null mientras carga / si falla, o un arreglo.
function MovimientosRecientes({ movimientos }) {
  return (
    <aside className="admin-panel inventario-recientes">
      <div className="admin-panel__head">
        <h2 className="admin-panel__titulo">Movimientos recientes</h2>
        <Link to="/admin/movimientos" className="inventario-recientes__ver">Ver todos</Link>
      </div>

      {movimientos === null ? (
        <p className="admin-vacio">No se pudieron cargar los movimientos.</p>
      ) : movimientos.length === 0 ? (
        <p className="admin-vacio">Todavía no hay movimientos.</p>
      ) : (
        <ul className="inventario-recientes__lista">
          {movimientos.map((m) => (
            <li className="inventario-recientes__item" key={m._id}>
              <div className="inventario-recientes__linea">
                <span className={`admin-pill admin-pill--${m.tipo}`}>{m.tipo}</span>
                <span>
                  {m.tipo === "entrada" ? "+" : "−"}{m.cantidad} {m.productoId?.nombre || "Producto"}
                </span>
              </div>
              <span className="inventario-recientes__nota">
                {MOTIVOS[m.motivo] || m.motivo}
                {m.proveedorId?.nombre ? ` · ${m.proveedorId.nombre}` : ""} · {tiempoRelativo(m.fecha)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default MovimientosRecientes;
