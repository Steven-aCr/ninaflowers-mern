import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useCarrito } from "../../hooks/useCarrito.js";
import { useAuth } from "../../hooks/useAuth.js";
import "./Navbar.css";

function Navbar() {
  const { cantidadTotal } = useCarrito();
  const { usuario } = useAuth();

  // NavLink (a diferencia de Link) sabe si SU propia ruta coincide con la
  // URL actual y nos deja armar la clase CSS según eso — así "Inicio" solo
  // se marca activo cuando estás en "/", y "Catálogo" cuando estás en
  // "/catalogo", sin que tengamos que calcularlo nosotros a mano.
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
          <NavLink to="/catalogo" className={claseEnlace}>
            Catálogo
          </NavLink>
          <NavLink to="/mis-pedidos" className={claseEnlace}>
            Mis pedidos
          </NavLink>
        </nav>

        <div className="navbar__acciones">
          <Link to="/carrito" className="navbar__icono-carrito" aria-label="Carrito de compras">
            <span className="material-symbols-outlined">shopping_bag</span>
            {cantidadTotal > 0 && <span className="navbar__badge">{cantidadTotal}</span>}
          </Link>

          {/* Si no hay sesión, "Perfil" manda a /login en vez de /perfil —
              evita un salto en falso por PrivateRoute (Navbar ya sabe la
              respuesta sin tener que esperar la redirección). */}
          <Link
            to={usuario ? "/perfil" : "/login"}
            className="navbar__perfil"
            aria-label={usuario ? "Mi perfil" : "Iniciar sesión"}
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="navbar__perfil-texto">{usuario ? usuario.nombre : "Iniciar sesión"}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
