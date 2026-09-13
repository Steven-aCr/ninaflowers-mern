import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__contenedor">
        <div className="footer__columna footer__columna--marca">
          <div className="footer__marca">
            <img src={logo} alt="Logo NinaFlowers" className="footer__logo" />
            <span className="footer__nombre">NinaFlowers</span>
          </div>
          <p className="footer__descripcion">
            Flores frescas y arreglos florales diseñados con delicadeza, arte y dedicación.
          </p>
          <div className="footer__horario">
            <span className="material-symbols-outlined">schedule</span>
            <span>Lunes a Sábado de 09:00 a 19:00 hrs.</span>
          </div>
        </div>

        <div className="footer__columna">
          <h3 className="footer__titulo">Navegación y Servicios</h3>
          <ul className="footer__lista">
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/catalogo">Catálogo de Flores</Link>
            </li>
            <li>
              <Link to="/mis-pedidos">Mis Pedidos</Link>
            </li>
          </ul>
        </div>

        <div className="footer__columna">
          <h3 className="footer__titulo">Atelier Floral</h3>
          <p className="footer__texto-secundario">
            Selección botánica de origen consciente, preservada en agua pura y tallada
            artesanalmente para cada ocasión.
          </p>
        </div>
      </div>

      <div className="footer__linea">
        <p>© {new Date().getFullYear()} NinaFlowers. Todos los derechos reservados.</p>
        <span className="footer__etiqueta">Floristería Botánica Fina</span>
      </div>
    </footer>
  );
}

export default Footer;
