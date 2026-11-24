import { Outlet } from "react-router-dom";
import Navbar from "../components/cliente/Navbar.jsx";
import Footer from "../components/cliente/Footer.jsx";
import "../styles/cliente.css";

// <Outlet /> es donde React Router "inyecta" la página que corresponda
// según la URL. Navbar y Footer quedan fijos porque están fuera del Outlet.
// La clase "cliente-layout" activa la identidad visual de la tienda
// (colores, tipografía y componentes base) sin afectar al panel admin.
function ClienteLayout() {
  return (
    <div className="cliente-layout">
      <Navbar />
      <div className="cliente-layout__contenido">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default ClienteLayout;