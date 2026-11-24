import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useCarrito } from "../../hooks/useCarrito.js";
import { useAuth } from "../../hooks/useAuth.js";
import "./Navbar.css";

// El menú cambia según si hay sesión iniciada (useAuth -> usuario):
// - Sin sesión: "Inicio" + "Sobre nosotros" y un botón para iniciar sesión.
//   (El catálogo sigue siendo público, solo que ya no está en el menú:
//   se llega a él desde los botones del Home, como "Ver catálogo".)
// - Con sesión: "Inicio", "Catálogo", "Mis pedidos", carrito y perfil.
//
// CAMBIO (solo visual): el botón de la derecha (perfil / iniciar sesión)
// ahora usa la clase "navbar__perfil" de Navbar.css, con un ícono y un texto.
// Antes usaba "navbar__avatar" y "navbar__cta", clases que ya no existen en
// el diseño nuevo. La lógica (usuario ? ... : ...) es exactamente la misma.
function Navbar() {
  const { cantidadTotal } = useCarrito();
  const { usuario } = useAuth();

  const claseEnlace = ({ isActive }) =>
    isActive ? "navbar__enlace navbar__enlace--activo" : "navbar__enlace";

  return (
    <header className="navbar">
      <div className="navbar__contenedor">
        <Link to="/" className="navbar__marca">
          <img src={logo} alt="Logo NinaFlowers" className="navbar__logo" />
          <span className="navbar__nombre">NinaFlowers</span>
        </Link>

        <nav className="navbar__enlaces">
          <NavLink to="/" end className={claseEnlace}>
            Inicio
          </NavLink>

          {usuario ? (
            <>
              <NavLink to="/catalogo" className={claseEnlace}>
                Catálogo
              </NavLink>
              <NavLink to="/mis-pedidos" className={claseEnlace}>
                Mis pedidos
              </NavLink>
            </>
          ) : (
            <Link to="/#sobre-nosotros" className="navbar__enlace">
              Sobre nosotros
            </Link>
          )}
        </nav>

        <div className="navbar__acciones">
          <Link to="/carrito" className="navbar__icono-carrito" aria-label="Carrito de compras">
            <span className="material-symbols-outlined">shopping_bag</span>
            {cantidadTotal > 0 && <span className="navbar__badge">{cantidadTotal}</span>}
          </Link>

          {usuario ? (
            <Link to="/perfil" className="navbar__perfil" aria-label="Mi perfil">
              <span className="material-symbols-outlined">account_circle</span>
              <span className="navbar__perfil-texto">{usuario.nombre}</span>
            </Link>
          ) : (
            <Link to="/login" className="navbar__perfil" aria-label="Iniciar sesión">
              <span className="material-symbols-outlined">login</span>
              <span className="navbar__perfil-texto">Iniciar sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;