import { useState } from "react";
import { Link } from "react-router-dom";
import Toast from "../../components/common/Toast.jsx";
import "./DetalleProducto.css";

// "producto" llega tal como lo devuelve tu API de Producto (con "imagenes"
// como arreglo). "categoriaNombre" se resuelve afuera (igual que en
// Catalogo.jsx: buscando categoriaId en la lista de categorías) y se pasa
// ya resuelto para no acoplar esta página a categoriaService.
//
// Si el producto es "compuesto", se espera que "componentes" venga desde
// el backend con cada item ya poblado como
// { productoId, nombreProducto, cantidad } — no solo el id crudo — para
// poder mostrar el nombre legible en la lista de composición.
function DetalleProducto({ producto, categoriaNombre, onAgregarCarrito }) {
  const [imagenActiva, setImagenActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [mensajeToast, setMensajeToast] = useState("");

  if (!producto) return null;

  const { nombre, descripcion, precio, imagenes = [], componentes = [] } = producto;
  const imagenPrincipal = imagenes[imagenActiva] || null;

  const disminuirCantidad = () => setCantidad((actual) => Math.max(actual - 1, 1));
  const aumentarCantidad = () => setCantidad((actual) => Math.min(actual + 1, 12));

  const manejarAgregarCarrito = () => {
    onAgregarCarrito(producto, cantidad);
    setMensajeToast(`"${nombre}" agregado al carrito`);
  };

  return (
    <main className="detalle-producto">
      <div className="detalle-producto__contenedor">
        {/* --- Volver + ruta de navegación --- */}
        <div className="detalle-producto__encabezado-nav">
          <Link to="/catalogo" className="detalle-producto__volver">
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Regresar al catálogo</span>
          </Link>

          <div className="detalle-producto__ruta">
            <span>Catálogo</span>
            {categoriaNombre && (
              <>
                <span className="detalle-producto__ruta-separador">/</span>
                <span>{categoriaNombre}</span>
              </>
            )}
            <span className="detalle-producto__ruta-separador">/</span>
            <span className="detalle-producto__ruta-actual">{nombre}</span>
          </div>
        </div>

        <div className="detalle-producto__grid">
          {/* --- Columna izquierda: galería --- */}
          <div className="detalle-producto__galeria">
            <div className="detalle-producto__imagen-principal">
              {imagenPrincipal ? (
                <img src={imagenPrincipal} alt={nombre} />
              ) : (
                <div className="detalle-producto__imagen-placeholder">
                  <span className="material-symbols-outlined">local_florist</span>
                </div>
              )}

              <span className="detalle-producto__etiqueta-frescura">
                <span className="material-symbols-outlined">spa</span>
                Corte Fresco de Taller
              </span>
            </div>

            {imagenes.length > 1 && (
              <div className="detalle-producto__miniaturas">
                {imagenes.map((imagen, indice) => (
                  <button
                    key={imagen}
                    type="button"
                    className={
                      indice === imagenActiva
                        ? "detalle-producto__miniatura detalle-producto__miniatura--activa"
                        : "detalle-producto__miniatura"
                    }
                    onClick={() => setImagenActiva(indice)}
                    aria-label={`Ver imagen ${indice + 1} de ${nombre}`}
                  >
                    <img src={imagen} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- Columna derecha: info y acciones --- */}
          <div className="detalle-producto__info">
            {categoriaNombre && (
              <span className="detalle-producto__categoria">{categoriaNombre}</span>
            )}

            <h1 className="detalle-producto__titulo">{nombre}</h1>

            <div className="detalle-producto__precio-fila">
              <span className="detalle-producto__precio">${Number(precio).toFixed(2)}</span>
              <span className="detalle-producto__precio-nota">
                IVA e insumos de conservación incluidos
              </span>
            </div>

            {descripcion && <p className="detalle-producto__descripcion">{descripcion}</p>}

            {componentes.length > 0 && (
              <div className="detalle-producto__composicion">
                <div className="detalle-producto__composicion-encabezado">
                  <h2>
                    <span className="material-symbols-outlined">psychiatry</span>
                    Composición Botánica
                  </h2>
                  <span>{componentes.length} elementos</span>
                </div>

                <ul className="detalle-producto__lista-componentes">
                  {componentes.map((componente) => (
                    <li key={componente.productoId}>
                      <span className="detalle-producto__componente-cantidad">
                        {componente.cantidad}
                      </span>
                      <span>{componente.nombreProducto}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="detalle-producto__acciones">
              <div className="detalle-producto__stepper">
                <button type="button" aria-label="Disminuir cantidad" onClick={disminuirCantidad}>
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span>{cantidad}</span>
                <button type="button" aria-label="Aumentar cantidad" onClick={aumentarCantidad}>
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

            <div className="detalle-producto__cuidado">
              <div className="detalle-producto__cuidado-titulo">
                <span className="material-symbols-outlined">water_drop</span>
                <span>Frescura y Cuidado Artesanal</span>
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
          </div>
        </div>

        {/* --- Promesa del taller --- */}
        <div className="detalle-producto__promesas">
          <div className="detalle-producto__promesa">
            <span className="material-symbols-outlined">palette</span>
            <h3>Diseño Floral Exclusivo</h3>
            <p>
              Cada tallo es seleccionado a mano por nuestros floristas maestros para
              equilibrar color, textura y volumen natural.
            </p>
          </div>
          <div className="detalle-producto__promesa">
            <span className="material-symbols-outlined">compost</span>
            <h3>Cerámica Sostenible</h3>
            <p>
              El jarrón artesanal incluido está concebido para ser un objeto decorativo
              perdurable en tu hogar tras el ciclo floral.
            </p>
          </div>
          <div className="detalle-producto__promesa">
            <span className="material-symbols-outlined">mark_email_read</span>
            <h3>Dedicatoria en Papel Algodón</h3>
            <p>
              Escribimos a pluma tu mensaje con tinta botánica, sellada en sobre lacrado
              con el emblema de NinaFlowers.
            </p>
          </div>
        </div>
      </div>

      <Toast mensaje={mensajeToast} onCerrar={() => setMensajeToast("")} />
    </main>
  );
}

export default DetalleProducto;