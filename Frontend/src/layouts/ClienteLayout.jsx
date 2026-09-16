import { Outlet } from "react-router-dom";
import Navbar from "../components/cliente/Navbar.jsx";
import Footer from "../components/cliente/Footer.jsx";

// <Outlet /> es donde React Router "inyecta" la página que corresponda
// según la URL (Home, Catalogo, etc). Navbar y Footer quedan fijos porque
// están fuera del Outlet: no se vuelven a montar al cambiar de página.
// Navbar ya lee el carrito y la sesión directo de sus hooks (useCarrito/
// useAuth), así que este layout no necesita pasarle nada por props.
function ClienteLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default ClienteLayout;
