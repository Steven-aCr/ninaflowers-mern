import { Link } from "react-router-dom";
import { obtenerUrlImagen } from "../../utils/obtenerImagen.js";
import "./ProductoCard.css";

// Recibe un objeto "producto" (tal como lo devuelve tu API de Producto)
// y una "etiqueta" opcional para el badge superior (ej. "Selección Rosa").
// No trae datos de ejemplo quemados: si no hay imagen, usamos un placeholder.
//
// "onAgregarCarrito" es opcional:
// - Sin él (uso en Home): un solo botón "Ver detalles" que navega a /producto/:id.
// - Con él (uso en Catalogo): se muestran dos botones — "Ver detalles" sigue
//   navegando (ya no abre modal) y "Agregar" dispara la función recibida.
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
          <span className="producto-card__precio">${Number(precio).toFixed(2)}</span>
        </div>

        {mostrarAccionesDobles ? (
          <div className="producto-card__acciones">
            <Link
              to={`/producto/${_id}`}
              className="producto-card__boton producto-card__boton--secundario"
            >
              <span className="material-symbols-outlined">visibility</span>
              <span>Ver detalles</span>
            </Link>
            <button
              type="button"
              className="producto-card__boton producto-card__boton--primario"
              onClick={() => onAgregarCarrito(producto)}
            >
              <span className="material-symbols-outlined">local_mall</span>
              <span>Agregar</span>
            </button>
          </div>
        ) : (
          <div className="producto-card__pie">
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
