import { Link, useNavigate } from "react-router-dom";
import CarritoItem from "../../components/cliente/CarritoItem.jsx";
import ResumenPedido from "../../components/cliente/ResumenPedido.jsx";
import { useCarrito } from "../../hooks/useCarrito.js";
import "./Carrito.css";

const COSTO_ENVIO_REFERENCIAL = 8;
const TASA_IMPUESTO = 0.1;

// A diferencia de Home/Catalogo, esta página NO recibe datos por props:
// lee directo de CarritoContext con useCarrito(), porque el carrito es
// estado compartido de verdad (Navbar también lo lee para el contador).
//
// El costo de envío y el impuesto que se ven aquí son SOLO referenciales
// para que el resumen no se vea vacío — cuando conectemos envioService/
// pedidoService, el envío real depende de la dirección (retiro_tienda,
// zona_cubierta, fuera_zona, según tu envioModel), así que este cálculo
// se reemplaza por completo en Checkout.
function Carrito() {
  const { items, actualizarCantidad, eliminarItem, vaciarCarrito, subtotal } = useCarrito();
  const navigate = useNavigate();

  const envio = items.length > 0 ? COSTO_ENVIO_REFERENCIAL : 0;
  const impuesto = subtotal * TASA_IMPUESTO;

  if (items.length === 0) {
    return (
      <main className="carrito carrito--vacio">
        <span className="material-symbols-outlined">shopping_bag</span>
        <h1>Tu bolsa está vacía</h1>
        <p>Explora nuestras creaciones botánicas de temporada para empezar tu pedido.</p>
        <Link to="/catalogo" className="carrito__boton-vacio">
          <span className="material-symbols-outlined">local_florist</span>
          <span>Ver catálogo</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="carrito">
      <div className="carrito__contenedor">
        <header className="carrito__encabezado">
          <h1>Bolsa de compra</h1>
          <p>Selección cuidada de botánica fresca preservada en agua mineral artesanal.</p>
        </header>

        <div className="carrito__layout">
          <section className="carrito__items">
            <div className="carrito__items-barra">
              <span>{items.length} {items.length === 1 ? "pieza" : "piezas"} seleccionadas</span>
              <button type="button" className="carrito__vaciar" onClick={vaciarCarrito}>
                <span className="material-symbols-outlined">delete_sweep</span>
                <span>Vaciar bolsa</span>
              </button>
            </div>

            <div className="carrito__lista">
              {items.map((item) => (
                <CarritoItem
                  key={item.productoId}
                  item={item}
                  onCambiarCantidad={actualizarCantidad}
                  onEliminar={eliminarItem}
                />
              ))}
            </div>

            <Link to="/catalogo" className="carrito__seguir">
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Seguir explorando el catálogo</span>
            </Link>
          </section>

          <section className="carrito__resumen">
            <ResumenPedido
              subtotal={subtotal}
              envio={envio}
              impuesto={impuesto}
              textoBoton="Continuar con el pedido"
              onContinuar={() => navigate("/checkout")}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

export default Carrito;
