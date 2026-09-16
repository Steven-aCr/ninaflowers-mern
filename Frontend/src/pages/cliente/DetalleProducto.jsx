import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../../components/common/Toast.jsx";
import { useCarrito } from "../../hooks/useCarrito.js";
import "./DetalleProducto.css";

const CANTIDAD_MAXIMA = 12;

// NOTA IMPORTANTE (leer antes de conectar la API real):
// Esta página recibe "producto" por props (null = no encontrado / aún sin
// cargar). El :id de la URL ya se lee con useParams más abajo pero todavía
// no se usa — cuando conectemos productoService, aquí mismo se hará
// productoService.buscarProductoId(id) en un useEffect, y "producto" pasa
// de ser prop a ser estado local de esta página.
//
// "producto.componentes" es un arreglo { productoId, cantidad } según tu
// modelo — cuando el backend haga populate('componentes.productoId'),
// cada item traerá el objeto Producto completo (con nombre) en vez del
// solo ObjectId. Este componente ya está preparado para ambos casos: si
// productoId viene poblado (es un objeto), muestra su nombre; si no,
// muestra un texto genérico.
function DetalleProducto({ producto = null, categoriaNombre = null }) {
  const { id } = useParams(); // eslint-disable-line no-unused-vars
  const { agregarItem } = useCarrito();
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [mensajeToast, setMensajeToast] = useState("");

  if (!producto) {
    return (
      <main className="detalle-producto detalle-producto--vacio">
        <div className="detalle-producto__vacio-icono">
          <span className="material-symbols-outlined">filter_vintage</span>
        </div>
        <h1 className="detalle-producto__vacio-titulo">Producto no encontrado</h1>
        <p className="detalle-producto__vacio-texto">
          Puede que el arreglo ya no esté disponible o el enlace esté incompleto.
        </p>
        <Link to="/catalogo" className="detalle-producto__vacio-boton">
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const { nombre, descripcion, precio, imagenes, componentes } = producto;
  const galeria = imagenes && imagenes.length > 0 ? imagenes : [];
  const imagenActiva = galeria[indiceImagen] || null;

  const aumentarCantidad = () => {
    setCantidad((actual) => Math.min(CANTIDAD_MAXIMA, actual + 1));
  };

  const disminuirCantidad = () => {
    setCantidad((actual) => Math.max(1, actual - 1));
  };

  const manejarAgregarCarrito = () => {
    agregarItem(producto, cantidad);
    setMensajeToast(`"${nombre}" agregado al carrito (x${cantidad})`);
  };

  return (
    <main className="detalle-producto">
      <div className="detalle-producto__contenedor">
        {/* --- Volver + breadcrumb --- */}
        <div className="detalle-producto__nav">
          <Link to="/catalogo" className="detalle-producto__volver">
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Regresar al catálogo</span>
          </Link>

          <nav className="detalle-producto__breadcrumb" aria-label="Ruta de navegación">
            <span>Catálogo</span>
            {categoriaNombre && (
              <>
                <span aria-hidden="true">/</span>
                <span>{categoriaNombre}</span>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span className="detalle-producto__breadcrumb-actual">{nombre}</span>
          </nav>
        </div>

        <div className="detalle-producto__layout">
          {/* --- Galería --- */}
          <section className="detalle-producto__galeria">
            <div className="detalle-producto__imagen-principal">
              {imagenActiva ? (
                <img src={imagenActiva} alt={nombre} />
              ) : (
                <div className="detalle-producto__imagen-placeholder">
                  <span className="material-symbols-outlined">local_florist</span>
                </div>
              )}
              <div className="detalle-producto__insignia">
                <span className="material-symbols-outlined">spa</span>
                <span>Corte fresco de taller</span>
              </div>
            </div>

            {galeria.length > 1 && (
              <div className="detalle-producto__miniaturas">
                {galeria.map((imagen, indice) => (
                  <button
                    key={imagen}
                    type="button"
                    className={
                      indice === indiceImagen
                        ? "detalle-producto__miniatura detalle-producto__miniatura--activa"
                        : "detalle-producto__miniatura"
                    }
                    aria-label={`Ver imagen ${indice + 1} de ${nombre}`}
                    onClick={() => setIndiceImagen(indice)}
                  >
                    <img src={imagen} alt="" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* --- Info y acciones --- */}
          <section className="detalle-producto__info">
            {categoriaNombre && (
              <span className="detalle-producto__categoria">{categoriaNombre}</span>
            )}

            <h1 className="detalle-producto__titulo">{nombre}</h1>

            <div className="detalle-producto__precio-fila">
              <span className="detalle-producto__precio">${Number(precio).toFixed(2)}</span>
              <span className="detalle-producto__precio-nota">
                USD • IVA e insumos de conservación incluidos
              </span>
            </div>

            {descripcion && <p className="detalle-producto__descripcion">{descripcion}</p>}

            {componentes && componentes.length > 0 && (
              <div className="detalle-producto__composicion">
                <div className="detalle-producto__composicion-encabezado">
                  <h2>
                    <span className="material-symbols-outlined">eco</span>
                    Composición botánica
                  </h2>
                  <span>{componentes.length} elementos</span>
                </div>
                <ul>
                  {componentes.map((item, indice) => {
                    const nombreComponente =
                      typeof item.productoId === "object" && item.productoId !== null
                        ? item.productoId.nombre
                        : "Componente floral";
                    return (
                      <li key={indice}>
                        <span className="detalle-producto__composicion-cantidad">
                          {item.cantidad}
                        </span>
                        <span>{nombreComponente}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* --- Cantidad + agregar --- */}
            <div className="detalle-producto__acciones">
              <div className="detalle-producto__cantidad">
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  onClick={disminuirCantidad}
                  disabled={cantidad === 1}
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span>{cantidad}</span>
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  onClick={aumentarCantidad}
                  disabled={cantidad === CANTIDAD_MAXIMA}
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <button
                type="button"
                className="detalle-producto__boton-agregar"
                onClick={manejarAgregarCarrito}
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                <span>Agregar al carrito</span>
              </button>
            </div>

            {/* --- Frescura y cuidado --- */}
            <div className="detalle-producto__cuidado">
              <div className="detalle-producto__cuidado-titulo">
                <span className="material-symbols-outlined">water_drop</span>
                <span>Frescura y cuidado artesanal</span>
              </div>
              <p>
                Flores hidratadas al momento de envío. Duración estimada de 7 a 10 días
                siguiendo las recomendaciones de cuidado.
              </p>
              <div className="detalle-producto__cuidado-grid">
                <div>
                  <span className="material-symbols-outlined">local_shipping</span>
                  <span>Entrega protegida con reserva de agua</span>
                </div>
                <div>
                  <span className="material-symbols-outlined">schedule</span>
                  <span>Ensamblado el mismo día</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --- Promesas del taller --- */}
        <section className="detalle-producto__promesas">
          <div className="detalle-producto__promesa">
            <span className="material-symbols-outlined">palette</span>
            <h3>Diseño floral exclusivo</h3>
            <p>
              Cada tallo es seleccionado a mano por nuestros floristas para equilibrar
              color, textura y volumen natural.
            </p>
          </div>
          <div className="detalle-producto__promesa">
            <span className="material-symbols-outlined">compost</span>
            <h3>Empaque consciente</h3>
            <p>
              Materiales biodegradables pensados para proteger cada tallo sin dejar huella
              innecesaria.
            </p>
          </div>
          <div className="detalle-producto__promesa">
            <span className="material-symbols-outlined">mark_email_read</span>
            <h3>Dedicatoria en papel algodón</h3>
            <p>
              Escribimos a mano tu mensaje, sellado en sobre con el emblema de NinaFlowers.
            </p>
          </div>
        </section>
      </div>

      <Toast mensaje={mensajeToast} onCerrar={() => setMensajeToast("")} />
    </main>
  );
}

export default DetalleProducto;
