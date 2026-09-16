import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Loader from "../components/common/Loader.jsx";

function PrivateRoute() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <Loader mensaje="Verificando sesión..." />;
  if (!usuario) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default PrivateRoute;