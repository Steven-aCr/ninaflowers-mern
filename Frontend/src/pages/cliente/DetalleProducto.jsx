// CAMBIO: ahora también importamos useEffect (para pedir el producto a la API).
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../../components/common/Toast.jsx";
import Loader from "../../components/common/Loader.jsx"; // NUEVO: spinner mientras carga
import { useCarrito } from "../../hooks/useCarrito.js";
import { buscarProductoId } from "../../services/productoService.js"; // NUEVO: pide UN producto a la API
import { obtenerUrlImagen } from "../../utils/obtenerImagen.js"; // NUEVO: saca la URL de { url, publicId }
import "./DetalleProducto.css";

const CANTIDAD_MAXIMA = 12;

// CAMBIO (el más importante): antes esta página recibía "producto" por props, y AppRoutes le
// pasaba null, por eso siempre se veía vacía. Ahora ella misma lee el :id de la URL,
// le pide el producto al backend y lo guarda en su propio estado.
// Por eso ya no recibe props (ni "categoriaNombre": el nombre de la categoría viene dentro del producto).
function DetalleProducto() {
  const { id } = useParams(); // CAMBIO: antes se leía pero no se usaba; ahora es lo que pedimos a la API.
  const { agregarItem } = useCarrito();

  // NUEVO: el producto ahora es estado local, junto con su estado de carga.
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(""); // texto de error si falló la petición (no es lo mismo que "no existe")
  const [intento, setIntento] = useState(0); // sube cuando el usuario da clic en "Reintentar"

  // (sin cambios) estado de la galería, la cantidad y el aviso.
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [mensajeToast, setMensajeToast] = useState("");

  // NUEVO: pide el producto al abrir la página y otra vez si cambia el :id de la URL
  // (por ejemplo, al pasar de un producto a otro) o si el usuario da "Reintentar".
  useEffect(() => {
    // "cancelado" evita pintar una respuesta vieja si el usuario ya se fue a otro producto.
    let cancelado = false;

    const cargarProducto = async () => {
      setCargando(true);
      setError("");
      setIndiceImagen(0); // al cambiar de producto, la galería y la cantidad vuelven a empezar
      setCantidad(1);
      try {
        const dato = await buscarProductoId(id);
        if (!cancelado) setProducto(dato);
      } catch (err) {
        if (cancelado) return;
        setProducto(null);
        // 404 = el producto no existe o está desactivado -> se muestra "Producto no encontrado".
        // Cualquier otro fallo (servidor apagado, error 500...) -> se muestra el mensaje de error.
        if (err.response?.status !== 404) {
          setError("No pudimos cargar el producto. Intenta de nuevo.");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargarProducto();

    return () => {
      cancelado = true;
    };
  }, [id, intento]);

  // NUEVO: mientras espera la respuesta.
  if (cargando) {
    return (
      <main className="detalle-producto">
        <Loader texto="Cargando producto..." />
      </main>
    );
  }

  // NUEVO: falló la petición (no es lo mismo que "no existe"). Reutiliza las clases de tu bloque "vacío".
  if (error) {
    return (
      <main className="detalle-producto detalle-producto--vacio">
        <div className="detalle-producto__vacio-icono">
          <span className="material-symbols-outlined">error</span>
        </div>
        <h1 className="detalle-producto__vacio-titulo">Algo salió mal</h1>
        <p className="detalle-producto__vacio-texto">{error}</p>
        <button
          type="button"
          className="detalle-producto__vacio-boton"
          onClick={() => setIntento((n) => n + 1)}
        >
          Reintentar
        </button>
      </main>
    );
  }

  // (sin cambios) tu bloque original de "Producto no encontrado".
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

  // NUEVO: el backend manda la categoría ya incluida como { _id, nombre }.
  const categoriaNombre = producto.categoriaId?.nombre || null;

  // CAMBIO: las imágenes llegan como objetos { url, publicId }. Aquí las convertimos a una lista
  // de URLs (textos), así el resto del componente (imagen principal y miniaturas) queda igual.
  // ANTES: const galeria = imagenes && imagenes.length > 0 ? imagenes : [];
  const galeria = (imagenes || []).map(obtenerUrlImagen).filter(Boolean);
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

  // (sin cambios) desde aquí todo el diseño es el tuyo.
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