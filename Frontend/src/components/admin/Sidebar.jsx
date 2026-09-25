import { NavLink } from "react-router-dom";
import logo from "../../assets/NinaFlowersBanner.jpeg";

import "./Sidebar.css";

// Íconos minimalistas para cada sección del panel administrativo.
const ICONOS = {
  "/admin": (
    <svg viewBox="0 0 20 20">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="12" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="12" width="7" height="7" rx="1.5" />
      <rect x="12" y="12" width="7" height="7" rx="1.5" />
    </svg>
  ),

  "/admin/productos": (
    <svg viewBox="0 0 20 20">
      <path d="M3 11 11 3h6a1 1 0 0 1 1 1v6l-8 8a1 1 0 0 1-1.4 0L3 12.4a1 1 0 0 1 0-1.4Z" />
      <circle cx="14.5" cy="6.5" r="1.1" />
    </svg>
  ),

  "/admin/categorias": (
    <svg viewBox="0 0 20 20">
      <path d="M3 6a1 1 0 0 1 1-1h4l2 2h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
    </svg>
  ),

  "/admin/proveedores": (
    <svg viewBox="0 0 20 20">
      <rect x="2" y="7" width="10" height="8" rx="1" />
      <path d="M12 10h4l3 3v2h-7z" />
      <circle cx="6" cy="17" r="1.5" />
      <circle cx="16" cy="17" r="1.5" />
    </svg>
  ),

  "/admin/inventario": (
    <svg viewBox="0 0 20 20">
      <path d="M3 7 10 3l7 4v8l-7 4-7-4Z" />
      <path d="M3 7l7 4 7-4M10 11v8" />
    </svg>
  ),

  "/admin/movimientos": (
    <svg viewBox="0 0 20 20">
      <path d="M4 7h13M14 3l3 4-3 4M16 13H3M6 17l-3-4 3-4" />
    </svg>
  ),

  "/admin/pedidos": (
    <svg viewBox="0 0 20 20">
      <circle cx="8" cy="17" r="1.3" />
      <circle cx="15" cy="17" r="1.3" />
      <path d="M2 3h2l2 11h10l2-7H6" />
    </svg>
  ),

  "/admin/pagos": (
    <svg viewBox="0 0 20 20">
      <rect x="2" y="5" width="16" height="11" rx="1.5" />
      <path d="M2 9h16" />
    </svg>
  ),

  "/admin/envios": (
    <svg viewBox="0 0 20 20">
      <path d="M2 10 17 3l-6 15-3-6-6-2Z" />
    </svg>
  ),

  "/admin/usuarios": (
    <svg viewBox="0 0 20 20">
      <circle cx="7" cy="7" r="3" />
      <path d="M2 17c0-3 2-5 5-5s5 2 5 5" />
      <circle cx="15" cy="8" r="2.3" />
      <path d="M13.5 12c2.5.3 4 2 4 5" />
    </svg>
  ),
};

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
      {/* LOGO */}
      <div className="admin-sidebar__logo">
        <img
          src={logo}
          alt="NinaFlowers - Flores que hacen sonreír"
          className="admin-sidebar__logo-imagen"
        />
      </div>

      {/* NAVEGACIÓN */}
      <nav className="admin-sidebar__nav">
        <ul className="admin-sidebar__lista">
          {ENLACES.map((enlace) => (
            <li key={enlace.to}>
              <NavLink
                to={enlace.to}
                end={enlace.end}
                className={({ isActive }) =>
                  isActive
                    ? "admin-sidebar__link admin-sidebar__link--activo"
                    : "admin-sidebar__link"
                }
              >
                <span className="admin-sidebar__icono">
                  {ICONOS[enlace.to]}
                </span>

                <span className="admin-sidebar__texto">
                  {enlace.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;