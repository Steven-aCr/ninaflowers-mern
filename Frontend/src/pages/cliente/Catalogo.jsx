// CAMBIO: ya no importamos "useMemo". Antes se usaba para filtrar y ordenar los productos
// en el navegador; ahora eso lo hace el backend, así que no hace falta.
import { useEffect, useState } from "react";
import Buscador from "../../components/common/Buscador.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Toast from "../../components/common/Toast.jsx";
import Loader from "../../components/common/Loader.jsx"; // NUEVO: para el estado "cargando"
import CategoriaFiltro from "../../components/cliente/CategoriaFiltro.jsx";
import ProductoCard from "../../components/cliente/ProductoCard.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { useCarrito } from "../../hooks/useCarrito.js";
import { listarProductos } from "../../services/productoService.js"; // NUEVO: pide productos a la API
import { listarCategorias } from "../../services/categoriaService.js"; // NUEVO: pide categorías a la API
import "./Catalogo.css";

const PRODUCTOS_POR_PAGINA = 6;

// CAMBIO (el más importante): antes esta página recibía "productos" y "categorias" por props
// y filtraba / ordenaba / paginaba todo en el navegador. Con la base de datos real eso no
// sirve: el backend entrega solo 6 productos por página, así que filtrar en React solo
// buscaría dentro de esos 6. Ahora la página le PIDE al backend cada cosa (página, búsqueda,
// categoría y orden) y solo pinta lo que responde.
// Por eso ya no recibe props: ella misma carga sus datos.
function Catalogo() {
  const { agregarItem } = useCarrito();

  // NUEVO: datos que vienen de la API.
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [totalProductos, setTotalProductos] = useState(0); // total en la base (para "Mostrando X de Y")
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true); // true mientras esperamos la respuesta
  const [error, setError] = useState(""); // mensaje si falla la petición
  const [intento, setIntento] = useState(0); // sube cuando el usuario da clic en "Reintentar"

  // (sin cambios) filtros que elige el usuario.
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [orden, setOrden] = useState("nombre-asc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mensajeToast, setMensajeToast] = useState("");

  const busquedaDebounced = useDebounce(busqueda, 400);

  // NUEVO: carga las categorías UNA sola vez, al abrir la página (el [] final lo indica).
  // Si falla, solo lo dejamos en consola: el catálogo puede funcionar sin los botones de categoría.
useEffect(() => {
  const cargarCategorias = async () => {
    try {
      const respuesta = await listarCategorias({ activo: true, limite: 100 });
      // Acepta las dos formas: un arreglo directo o la respuesta paginada { datos: [...] }.
      setCategorias(Array.isArray(respuesta) ? respuesta : respuesta?.datos ?? []);
    } catch (err) {
      console.error("No se pudieron cargar las categorías:", err.message);
    }
  };
  cargarCategorias();
}, []);

  // NUEVO: carga los productos. Se ejecuta al abrir la página y OTRA VEZ cada vez que
  // cambia algo de la lista de abajo (página, búsqueda, categoría, orden o "Reintentar").
  // ELIMINADO: los dos useMemo (productosFiltrados y productosPagina) y el useEffect que
  // volvía a la página 1. Su trabajo ahora lo hace el backend y los manejadores de más abajo.
  useEffect(() => {
    // "cancelado" evita pintar una respuesta vieja que llegó tarde.
    // Ejemplo: escribes rápido, la petición 1 tarda más que la 2 y pisaría el resultado bueno.
    let cancelado = false;

    const cargarProductos = async () => {
      setCargando(true);
      setError("");
      try {
        const respuesta = await listarProductos({
          page: paginaActual,
          limite: PRODUCTOS_POR_PAGINA,
          // "undefined" hace que axios NO mande ese parámetro en la URL.
          nombre: busquedaDebounced.trim() || undefined,
          categoriaId: categoriaActiva === "todos" ? undefined : categoriaActiva,
          orden,
        });
        if (cancelado) return;
        // La API responde { totalDoc, pagActual, totalPag, datos }.
        setProductos(respuesta.datos);
        setTotalProductos(respuesta.totalDoc);
        setTotalPaginas(Math.max(1, respuesta.totalPag));
      } catch (err) {
        if (!cancelado) setError("No pudimos cargar el catálogo. Intenta de nuevo.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargarProductos();

    // Se ejecuta antes de la siguiente carga: marca la petición anterior como "vieja".
    return () => {
      cancelado = true;
    };
  }, [paginaActual, busquedaDebounced, categoriaActiva, orden, intento]);

  // CAMBIO: antes un useEffect regresaba a la página 1 cuando cambiaba un filtro.
  // Ahora lo hace cada manejador directamente: es más simple y evita que, estando en la
  // página 3, cambiar un filtro dispare dos peticiones seguidas.
  const manejarBusqueda = (valor) => {
    setBusqueda(valor);
    setPaginaActual(1);
  };

  const manejarCategoria = (categoriaId) => {
    setCategoriaActiva(categoriaId);
    setPaginaActual(1);
  };

  const manejarOrden = (evento) => {
    setOrden(evento.target.value);
    setPaginaActual(1);
  };

  // CAMBIO: además de limpiar, vuelve a la página 1.
  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaActiva("todos");
    setPaginaActual(1);
  };

  // ELIMINADO: la función "obtenerNombreCategoria". El backend ahora manda cada producto con
  // su categoría ya incluida (categoriaId llega como { _id, nombre }), así que el nombre se
  // lee directo en el ProductoCard de abajo: producto.categoriaId?.nombre

  // (sin cambios) agregar al carrito.
  const manejarAgregarCarrito = (producto) => {
    agregarItem(producto, 1);
    setMensajeToast(`"${producto.nombre}" agregado al carrito ($${Number(producto.precio).toFixed(2)})`);
  };

  // NUEVO: decide qué se muestra en la zona de productos según el estado:
  // cargando -> error -> sin resultados -> lista de productos.
  // Toda página que pide datos a una API debe contemplar estos casos.
  const renderContenido = () => {
    if (cargando) return <Loader texto="Cargando arreglos..." />;

    if (error) {
      // Reutiliza las clases CSS de tu bloque "vacío", así no hay que tocar el CSS.
      return (
        <div className="catalogo__vacio">
          <div className="catalogo__vacio-icono">
            <span className="material-symbols-outlined">error</span>
          </div>
          <h3 className="catalogo__vacio-titulo">Algo salió mal</h3>
          <p className="catalogo__vacio-texto">{error}</p>
          <button
            type="button"
            className="catalogo__vacio-boton"
            onClick={() => setIntento((n) => n + 1)}
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (productos.length === 0) {
      // (sin cambios) tu bloque original de "Sin arreglos florales encontrados".
      return (
        <div className="catalogo__vacio">
          <div className="catalogo__vacio-icono">
            <span className="material-symbols-outlined">filter_vintage</span>
          </div>
          <h3 className="catalogo__vacio-titulo">Sin arreglos florales encontrados</h3>
          <p className="catalogo__vacio-texto">
            No encontramos tallos o ramos que coincidan con tu criterio. Prueba
            seleccionando otra categoría o limpiando la búsqueda.
          </p>
          <button type="button" className="catalogo__vacio-boton" onClick={limpiarFiltros}>
            Restablecer catálogo
          </button>
        </div>
      );
    }

    return (
      <div className="catalogo__grid">
        {productos.map((producto) => (
          <ProductoCard
            key={producto._id}
            producto={producto}
            // CAMBIO: antes buscaba el nombre en el arreglo "categorias"; ahora viene en el producto.
            etiqueta={producto.categoriaId?.nombre}
            onAgregarCarrito={manejarAgregarCarrito}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="catalogo">
      <div className="catalogo__contenedor">
        {/* --- Encabezado --- */}
        <header className="catalogo__encabezado">
          <div className="catalogo__encabezado-texto">
            <div className="catalogo__eyebrow">
              <span className="material-symbols-outlined">nature</span>
              <span>Colección Botánica Permanente</span>
            </div>
            <h1 className="catalogo__titulo">Catálogo de Flores y Arreglos</h1>
            <p className="catalogo__subtitulo">
              Explora nuestra colección floral artesanal disponible para entrega
            </p>
          </div>
        </header>

        {/* --- Búsqueda + orden --- */}
        <section className="catalogo__controles">
          <div className="catalogo__fila-controles">
            <div className="catalogo__buscador">
              {/* CAMBIO: onChange ahora usa manejarBusqueda (además de guardar el texto, vuelve a la página 1). */}
              <Buscador
                valor={busqueda}
                onChange={manejarBusqueda}
                placeholder="Buscar flores, arreglos o bouquets..."
              />
            </div>

            <div className="catalogo__orden">
              <span className="material-symbols-outlined">swap_vert</span>
              <label className="catalogo__orden-label" htmlFor="catalogo-orden">
                Ordenar por
              </label>
              {/* CAMBIO: onChange ahora usa manejarOrden. Los valores de las opciones coinciden
                  con la lista blanca ORDENES del backend (nombre-asc, precio-asc, precio-desc). */}
              <select
                id="catalogo-orden"
                className="catalogo__orden-select"
                value={orden}
                onChange={manejarOrden}
              >
                <option value="nombre-asc">Nombre (A-Z)</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>

          {/* CAMBIO: onSeleccionar ahora usa manejarCategoria. */}
          <CategoriaFiltro
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            onSeleccionar={manejarCategoria}
          />
        </section>

        {/* --- Productos --- */}
        {/* CAMBIO: en lugar del bloque "productosPagina.length > 0 ? grid : vacío" que había aquí,
            ahora se llama a renderContenido(), que también cubre "cargando" y "error". */}
        {renderContenido()}

        {/* --- Contador + paginación --- */}
        <footer className="catalogo__pie">
          <div className="catalogo__pie-contador">
            <span className="material-symbols-outlined">spa</span>
            <span>
              {/* CAMBIO: los números vienen de la API (totalProductos es el total de la base de datos,
                  no solo los de esta página). */}
              Mostrando {productos.length} de {totalProductos} arreglos
            </span>
          </div>

          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            onCambiarPagina={setPaginaActual}
          />
        </footer>

        {/* --- Banner de compromiso --- */}
        <section className="catalogo__banner">
          <div className="catalogo__banner-info">
            <div className="catalogo__banner-icono">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div>
              <h4 className="catalogo__banner-titulo">Compromiso Floral de NinaFlowers</h4>
              <p className="catalogo__banner-texto">
                Cada tallo se corta y acondiciona a temperatura controlada el mismo día del
                envío. Cero químicos agresivos, empaques 100% biodegradables y garantía de
                frescura botánica de 7 días.
              </p>
            </div>
          </div>
          <span className="catalogo__banner-etiqueta">Taller Botánico Artesanal</span>
        </section>
      </div>

      <Toast mensaje={mensajeToast} onCerrar={() => setMensajeToast("")} />
    </main>
  );
}

export default Catalogo;