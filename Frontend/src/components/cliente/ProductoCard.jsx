import { Link } from "react-router-dom";
import "./ProductoCard.css";

// Recibe un objeto "producto" (tal como lo devuelve tu API de Producto)
// y una "etiqueta" opcional para el badge superior (ej. "Selección Rosa").
// No trae datos de ejemplo quemados: si no hay imagen, usamos un placeholder.
function ProductoCard({ producto, etiqueta }) {
  const { _id, nombre, descripcion, precio, imagenes } = producto;
  const imagenPrincipal = imagenes && imagenes.length > 0 ? imagenes[0] : null;

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

        <div className="producto-card__pie">
          <span className="producto-card__precio">${Number(precio).toFixed(2)}</span>
          <Link to={`/producto/${_id}`} className="producto-card__boton">
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductoCard;
