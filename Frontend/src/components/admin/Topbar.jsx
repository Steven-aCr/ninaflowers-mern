import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

// El título de la página vive aquí (y no en cada vista) para que todas las
// pantallas del panel tengan el mismo encabezado.
const TITULOS = {
  "/admin": "Dashboard",
  "/admin/productos": "Productos",
  "/admin/categorias": "Categorías",
  "/admin/proveedores": "Proveedores",
  "/admin/inventario": "Inventario",
  "/admin/movimientos": "Movimientos de inventario",
  "/admin/pedidos": "Pedidos",
  "/admin/pagos": "Pagos",
  "/admin/envios": "Envíos",
  "/admin/usuarios": "Usuarios",
  "/admin/ajustes": "Ajustes",
};

function Topbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const ruta = pathname.replace(/\/+$/, "") || "/";
  const titulo = TITULOS[ruta] || "Panel";
  const inicial = (usuario?.nombre || "A").charAt(0).toUpperCase();

  const manejarLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="admin-topbar">
      <div>
        <p className="admin-topbar__eyebrow">Administración / NinaFlowers</p>
        <h1 className="admin-topbar__titulo">{titulo}</h1>
      </div>

      <div className="admin-topbar__usuario">
        <span className="admin-topbar__nombre">
          {usuario?.nombre} {usuario?.apellido}
        </span>
        <span className="admin-topbar__avatar" aria-hidden="true">{inicial}</span>
        <button
          type="button"
          className="admin-btn admin-btn--borde admin-topbar__logout"
          onClick={manejarLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Topbar;
