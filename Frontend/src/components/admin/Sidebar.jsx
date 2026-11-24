import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import logo from "../../assets/NinaFlowersBanner.jpeg";

import "./Sidebar.css";

// Íconos Material Symbols (la misma familia que usa el resto de la app).
const ENLACES = [
  { to: "/admin", label: "Dashboard", icono: "dashboard", end: true },
  { to: "/admin/productos", label: "Productos", icono: "local_florist" },
  { to: "/admin/categorias", label: "Categorías", icono: "category" },
  { to: "/admin/proveedores", label: "Proveedores", icono: "storefront" },
  { to: "/admin/inventario", label: "Inventario", icono: "inventory_2" },
  { to: "/admin/movimientos", label: "Movimientos", icono: "swap_horiz" },
  { to: "/admin/pedidos", label: "Pedidos", icono: "receipt_long" },
  { to: "/admin/pagos", label: "Pagos", icono: "credit_card" },
  { to: "/admin/envios", label: "Envíos", icono: "local_shipping" },
  { to: "/admin/usuarios", label: "Usuarios", icono: "group" },
//  { to: "/admin/ajustes", label: "Ajustes", icono: "settings" },
];

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const manejarLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <img
          src={logo}
          alt="NinaFlowers - Flores que hacen sonreír"
          className="admin-sidebar__logo-imagen"
        />
      </div>

      <nav className="admin-sidebar__nav" aria-label="Menú del panel">
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
                <span className="material-symbols-outlined admin-sidebar__icono" aria-hidden="true">
                  {enlace.icono}
                </span>
                <span className="admin-sidebar__texto">{enlace.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button type="button" className="admin-sidebar__logout" onClick={manejarLogout}>
        <span className="material-symbols-outlined">logout</span>
        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
}

export default Sidebar;
