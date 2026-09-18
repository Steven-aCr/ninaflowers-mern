import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

function Topbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const manejarLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="admin-topbar">
      <span className="admin-topbar__saludo">
        Hola, {usuario?.nombre} {usuario?.apellido}
      </span>
      <button className="admin-topbar__logout" onClick={manejarLogout}>
        Cerrar sesión
      </button>
    </header>
  );
}

export default Topbar;