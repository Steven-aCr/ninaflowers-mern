import { useEffect, useMemo, useState } from "react";
import Buscador from "../../components/common/Buscador.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Toast from "../../components/common/Toast.jsx";
import CategoriaFiltro from "../../components/cliente/CategoriaFiltro.jsx";
import ProductoCard from "../../components/cliente/ProductoCard.jsx";
import ProductoDetalleModal from "../../components/cliente/ProductoDetalleModal.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import "./Catalogo.css";

const PRODUCTOS_POR_PAGINA = 6;

// NOTA IMPORTANTE (leer antes de conectar la API real):
// Todo el filtrado/orden/paginación de esta página ocurre en el cliente,
// sobre los arreglos "productos" y "categorias" recibidos por props.
// Cuando conectemos productoService/categoriaService de verdad, este
// filtrado se reemplaza por query params al backend (page, limite, nombre,
// categoriaId, etc. — ya definidos en tu listarProducto del backend) y
// la paginación deja de cortar el arreglo local para usar la respuesta
// { totalDoc, pagActual, totalPag, datos } tal cual la devuelve tu API.
function Catalogo({ productos = [], categorias = [] }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [orden, setOrden] = useState("nombre-asc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mensajeToast, setMensajeToast] = useState("");

  const busquedaDebounced = useDebounce(busqueda, 400);

  // Cada vez que cambia un filtro, se vuelve a la página 1
  // (si no, podrías quedar "varada" en una página que ya no existe).
  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaDebounced, categoriaActiva, orden]);

  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    if (categoriaActiva !== "todos") {
      resultado = resultado.filter((p) => p.categoriaId === categoriaActiva);
    }

    if (busquedaDebounced.trim() !== "") {
      const termino = busquedaDebounced.trim().toLowerCase();
      resultado = resultado.filter((p) => p.nombre.toLowerCase().includes(termino));
    }

    const resultadoOrdenado = [...resultado].sort((a, b) => {
      if (orden === "precio-asc") return a.precio - b.precio;
      if (orden === "precio-desc") return b.precio - a.precio;
      return a.nombre.localeCompare(b.nombre);
    });

    return resultadoOrdenado;
  }, [productos, categoriaActiva, busquedaDebounced, orden]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA)
  );

  const productosPagina = useMemo(() => {
    const desde = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    return productosFiltrados.slice(desde, desde + PRODUCTOS_POR_PAGINA);
  }, [productosFiltrados, paginaActual]);

  const obtenerNombreCategoria = (categoriaId) => {
    const categoria = categorias.find((c) => c._id === categoriaId);
    return categoria ? categoria.nombre : null;
  };

  const manejarAgregarCarrito = (producto) => {
    setMensajeToast(`"${producto.nombre}" agregado al carrito ($${Number(producto.precio).toFixed(2)})`);
    setProductoSeleccionado(null);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaActiva("todos");
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
              <Buscador
                valor={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar flores, arreglos o bouquets..."
              />
            </div>

            <div className="catalogo__orden">
              <span className="material-symbols-outlined">swap_vert</span>
              <label className="catalogo__orden-label" htmlFor="catalogo-orden">
                Ordenar por
              </label>
              <select
                id="catalogo-orden"
                className="catalogo__orden-select"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                <option value="nombre-asc">Nombre (A-Z)</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>

          <CategoriaFiltro
            categorias={categorias}
            categoriaActiva={categoriaActiva}
            onSeleccionar={setCategoriaActiva}
          />
        </section>

        {/* --- Grid de productos --- */}
        {productosPagina.length > 0 ? (
          <div className="catalogo__grid">
            {productosPagina.map((producto) => (
              <ProductoCard
                key={producto._id}
                producto={producto}
                etiqueta={obtenerNombreCategoria(producto.categoriaId)}
                onVerDetalles={setProductoSeleccionado}
                onAgregarCarrito={manejarAgregarCarrito}
              />
            ))}
          </div>
        ) : (
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
        )}

        {/* --- Contador + paginación --- */}
        <footer className="catalogo__pie">
          <div className="catalogo__pie-contador">
            <span className="material-symbols-outlined">spa</span>
            <span>
              Mostrando {productosPagina.length} de {productosFiltrados.length} arreglos
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

      <ProductoDetalleModal
        producto={productoSeleccionado}
        categoriaNombre={
          productoSeleccionado ? obtenerNombreCategoria(productoSeleccionado.categoriaId) : null
        }
        onCerrar={() => setProductoSeleccionado(null)}
        onAgregarCarrito={manejarAgregarCarrito}
      />

      <Toast mensaje={mensajeToast} onCerrar={() => setMensajeToast("")} />
    </main>
  );
}

export default Catalogo;
