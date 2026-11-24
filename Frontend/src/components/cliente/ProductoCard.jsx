import { Link } from "react-router-dom";
import { obtenerUrlImagen } from "../../utils/obtenerImagen.js";
import "./ProductoCard.css";

// Misma firma de siempre: producto, etiqueta (opcional) y onAgregarCarrito (opcional).
// - Sin onAgregarCarrito (uso en Home): un solo botón "Ver detalles".
// - Con onAgregarCarrito (uso en Catalogo): dos botones con texto lado a lado
//   ("Detalles" y "Agregar").
//
// CAMBIO (solo visual): el marcado ahora coincide con ProductoCard.css nuevo:
//   - nombre, descripción y precio van juntos en el primer <div> del contenido.
//   - los botones viven en "producto-card__acciones" y usan "producto-card__boton".
// Antes se usaban "producto-card__pie" y "producto-card__icobtn", que ya no existen.
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
          <h3 className="producto-card__nombre">{nombre}</h3>
          {descripcion && <p className="producto-card__descripcion">{descripcion}</p>}
          <span className="producto-card__precio">${Number(precio).toFixed(2)}</span>
        </div>

        {mostrarAccionesDobles ? (
          <div className="producto-card__acciones">
            <Link
              to={`/producto/${_id}`}
              className="producto-card__boton producto-card__boton--secundario"
              aria-label={`Ver detalles de ${nombre}`}
            >
              <span className="material-symbols-outlined">visibility</span>
              <span>Detalles</span>
            </Link>
            <button
              type="button"
              className="producto-card__boton producto-card__boton--primario"
              aria-label={`Agregar ${nombre} al carrito`}
              onClick={() => onAgregarCarrito(producto)}
            >
              <span className="material-symbols-outlined">add_shopping_cart</span>
              <span>Agregar</span>
            </button>
          </div>
        ) : (
          <div className="producto-card__acciones producto-card__acciones--una">
            <Link
              to={`/producto/${_id}`}
              className="producto-card__boton producto-card__boton--secundario"
            >
              <span className="material-symbols-outlined">visibility</span>
              <span>Ver detalles</span>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductoCard;