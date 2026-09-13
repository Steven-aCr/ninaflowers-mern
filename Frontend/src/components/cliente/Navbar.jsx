import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Navbar.css";

// cantidadCarrito llegará más adelante desde CarritoContext (useCarrito).
// Por ahora se recibe como prop para no acoplar el componente al contexto
// antes de que exista.
function Navbar({ cantidadCarrito = 0 }) {
  // Función que arma el className según si NavLink está "activo" o no.
  // isActive lo calcula react-router comparando la ruta actual con el "to".
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
            {cantidadCarrito > 0 && (
              <span className="navbar__badge">{cantidadCarrito}</span>
            )}
          </Link>

          <Link to="/perfil" className="navbar__perfil" aria-label="Mi perfil">
            <span className="material-symbols-outlined">account_circle</span>
            <span className="navbar__perfil-texto">Perfil</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;