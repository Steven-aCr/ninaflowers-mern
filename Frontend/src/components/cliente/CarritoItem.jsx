import "./CarritoItem.css";

// "item" tiene la forma que guarda CarritoContext: { productoId, nombre,
// precio, cantidad, imagen }. Este componente es "tonto": no toca el
// contexto directamente, recibe las funciones por props — así se puede
// probar o reusar sin depender de que exista un <CarritoProvider>.
function CarritoItem({ item, onCambiarCantidad, onEliminar }) {
  const { productoId, nombre, precio, cantidad, imagen } = item;
  const subtotal = precio * cantidad;

  return (
    <article className="carrito-item">
      <div className="carrito-item__imagen">
        {imagen ? (
          <img src={imagen} alt={nombre} />
        ) : (
          <span className="material-symbols-outlined">local_florist</span>
        )}
      </div>

      <div className="carrito-item__info">
        <div className="carrito-item__encabezado">
          <h3>{nombre}</h3>
          <button
            type="button"
            className="carrito-item__eliminar"
            aria-label={`Eliminar ${nombre} del carrito`}
            onClick={() => onEliminar(productoId)}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>

        <div className="carrito-item__pie">
          <div className="carrito-item__cantidad">
            <button
              type="button"
              aria-label="Disminuir cantidad"
              onClick={() => onCambiarCantidad(productoId, cantidad - 1)}
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span>{cantidad}</span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              onClick={() => onCambiarCantidad(productoId, cantidad + 1)}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          <div className="carrito-item__precios">
            <span className="carrito-item__unitario">Unitario: ${precio.toFixed(2)}</span>
            <span className="carrito-item__subtotal">${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default CarritoItem;
