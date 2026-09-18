import { NavLink } from "react-router-dom";

const ENLACES = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/proveedores", label: "Proveedores" },
  { to: "/admin/inventario", label: "Inventario" },
  { to: "/admin/movimientos", label: "Movimientos de Inventario" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/pagos", label: "Pagos" },
  { to: "/admin/envios", label: "Envíos" },
  { to: "/admin/usuarios", label: "Usuarios" },
];

function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">🌸 NinaFlowers</div>
      <nav>
        <ul className="admin-sidebar__lista">
          {ENLACES.map((enlace) => (
            <li key={enlace.to}>
              <NavLink
                to={enlace.to}
                end={enlace.end}
                className={({ isActive }) =>
                  isActive ? "admin-sidebar__link admin-sidebar__link--activo" : "admin-sidebar__link"
                }
              >
                {enlace.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;