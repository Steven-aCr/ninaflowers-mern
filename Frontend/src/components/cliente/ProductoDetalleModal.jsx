import "./ProductoDetalleModal.css";

// "producto" null = modal cerrado. Se controla 100% desde Catalogo.jsx
// (este componente no tiene estado propio de abierto/cerrado).
function ProductoDetalleModal({ producto, categoriaNombre, onCerrar, onAgregarCarrito }) {
  if (!producto) return null;

  const { nombre, descripcion, precio } = producto;

  const manejarClicFondo = (evento) => {
    if (evento.target === evento.currentTarget) onCerrar();
  };

  return (
    <div className="producto-modal__fondo" onClick={manejarClicFondo}>
      <div className="producto-modal">
        <button
          type="button"
          className="producto-modal__cerrar"
          aria-label="Cerrar detalle"
          onClick={onCerrar}
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {categoriaNombre && (
          <div className="producto-modal__categoria">
            <span className="material-symbols-outlined">local_florist</span>
            <span>{categoriaNombre}</span>
          </div>
        )}

        <h2 className="producto-modal__titulo">{nombre}</h2>

        {descripcion && <p className="producto-modal__descripcion">{descripcion}</p>}

        <div className="producto-modal__precio-fila">
          <span className="producto-modal__precio-etiqueta">Inversión botánica</span>
          <span className="producto-modal__precio-valor">${Number(precio).toFixed(2)}</span>
        </div>

        <button
          type="button"
          className="producto-modal__boton-agregar"
          onClick={() => onAgregarCarrito(producto)}
        >
          <span className="material-symbols-outlined">shopping_bag</span>
          <span>Añadir al carrito</span>
        </button>
      </div>
    </div>
  );
}

export default ProductoDetalleModal;
