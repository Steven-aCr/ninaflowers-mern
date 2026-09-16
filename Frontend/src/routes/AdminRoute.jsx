import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Loader from "../components/common/Loader.jsx";
import { ROLES } from "../utils/constantes.js";

function AdminRoute() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <Loader mensaje="Verificando sesión..." />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.rol !== ROLES.ADMINISTRADOR) return <Navigate to="/" replace />;

  return <Outlet />;
}

export default AdminRoute;