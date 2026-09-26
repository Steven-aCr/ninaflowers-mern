import { Link } from "react-router-dom";
import { obtenerUrlImagen } from "../../utils/obtenerImagen.js";
import "./ProductoCard.css";

// Misma firma de siempre: producto, etiqueta (opcional) y onAgregarCarrito (opcional).
// - Sin onAgregarCarrito (uso en Home): un solo botón "Ver detalles".
// - Con onAgregarCarrito (uso en Catalogo): botones circulares de ícono
//   (ver detalles / agregar) en vez de dos botones de texto lado a lado.
function ProductoCard({ producto, etiqueta, onAgregarCarrito }) {
  const { _id, nombre, descripcion, precio, imagenes } = producto;
  const imagenPrincipal = obtenerUrlImagen(imagenes?.[0]);
  const mostrarAccionesDobles = Boolean(onAgregarCarrito);

  return (
    <article className="producto-card">
      <div className="producto-card__imagen-contenedor">
        {imagenPrincipal ? (
          <img src={imagenPrincipal} alt={nombre} className="producto-card__imagen" />
        ) : (
          <div className="producto-card__imagen-placeholder">
            <span className="material-symbols-outlined">local_florist</span>
          </div>
        )}

        {etiqueta && <span className="producto-card__badge">{etiqueta}</span>}
      </div>

      <div className="producto-card__contenido">
        <div>
          {descripcion && <p className="producto-card__descripcion">{descripcion}</p>}
          <h3 className="producto-card__nombre">{nombre}</h3>
        </div>

        {mostrarAccionesDobles ? (
          <div className="producto-card__pie">
            <span className="producto-card__precio">${Number(precio).toFixed(2)}</span>
            <div className="producto-card__acciones">
              <Link
                to={`/producto/${_id}`}
                className="producto-card__icobtn producto-card__icobtn--secundario"
                aria-label={`Ver detalles de ${nombre}`}
              >
                <span className="material-symbols-outlined">visibility</span>
              </Link>
              <button
                type="button"
                className="producto-card__icobtn producto-card__icobtn--primario"
                aria-label={`Agregar ${nombre} al carrito`}
                onClick={() => onAgregarCarrito(producto)}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="producto-card__pie">
            <span className="producto-card__precio">${Number(precio).toFixed(2)}</span>
            <Link to={`/producto/${_id}`} className="producto-card__boton producto-card__boton--secundario">
              Ver detalles
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductoCard;