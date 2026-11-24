import { useEffect, useState, useCallback } from "react";
import * as categoriaService from "../../services/categoriaService.js";
import * as productoService from "../../services/productoService.js";
import TablaCategorias from "../../components/admin/TablaCategorias.jsx";
import FormularioCategoria from "../../components/admin/FormularioCategoria.jsx";
import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Buscador from "../../components/common/Buscador.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [conteoProductos, setConteoProductos] = useState(null); // { [categoriaId]: n }
  const [conteos, setConteos] = useState(null); // { total, activas }
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState(""); // "" = todas, "true" = activas, "false" = inactivas
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [toast, setToast] = useState("");

  const cargarCategorias = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (busqueda) params.nombre = busqueda;
      if (estado) params.activo = estado;
      const resultado = await categoriaService.listarCategorias(params);
      setCategorias(resultado.datos);
      setTotalPaginas(Math.max(1, resultado.totalPag));
      setTotalFiltrado(resultado.totalDoc);

      // Cantidad de productos por categoría (solo de las filas visibles).
      // Si falla, la columna muestra "—" y la tabla sigue funcionando.
      try {
        const respuestas = await Promise.all(
          resultado.datos.map((cat) => productoService.listarProductos({ categoriaId: cat._id, limite: 1 }))
        );
        setConteoProductos(
          Object.fromEntries(resultado.datos.map((cat, i) => [cat._id, respuestas[i].totalDoc ?? 0]))
        );
      } catch {
        setConteoProductos(null);
      }
    } catch {
      setToast("No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda, estado]);

  // Contadores de tarjetas y pestañas (independientes de la búsqueda).
  const cargarConteos = useCallback(async () => {
    try {
      const [todas, activas] = await Promise.all([
        categoriaService.listarCategorias({ page: 1, limite: 1 }),
        categoriaService.listarCategorias({ page: 1, limite: 1, activo: "true" }),
      ]);
      setConteos({ total: todas.totalDoc ?? 0, activas: activas.totalDoc ?? 0 });
    } catch {
      setConteos(null);
    }
  }, []);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);
  useEffect(() => { cargarConteos(); }, [cargarConteos]);

  const abrirCrear = () => { setEditando(null); setMostrarFormulario(true); };
  const abrirEditar = (categoria) => { setEditando(categoria); setMostrarFormulario(true); };

  const manejarGuardar = async (datos) => {
    setGuardando(true);
    try {
      if (editando) {
        await categoriaService.modificarCategoria(editando._id, datos);
        setToast("Categoría actualizada.");
      } else {
        await categoriaService.crearCategoria(datos);
        setToast("Categoría creada.");
      }
      setMostrarFormulario(false);
      cargarCategorias();
      cargarConteos();
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambiarEstado = async (categoria) => {
    try {
      if (categoria.activo) {
        await categoriaService.eliminarCategoria(categoria._id);
      } else {
        await categoriaService.modificarCategoria(categoria._id, { activo: true });
      }
      setToast(categoria.activo ? "Categoría desactivada." : "Categoría activada.");
      cargarCategorias();
      cargarConteos();
    } catch {
      setToast("No se pudo cambiar el estado.");
    }
  };

  const mostrar = (numero) => (numero === null || numero === undefined ? "—" : numero);
  const inactivas = conteos ? conteos.total - conteos.activas : null;

  const opciones = [
    { valor: "", etiqueta: "Todas", cantidad: conteos?.total },
    { valor: "true", etiqueta: "Activas", cantidad: conteos?.activas },
    { valor: "false", etiqueta: "Inactivas", cantidad: inactivas },
  ];

  return (
    <>
      <section className="admin-stats" aria-label="Resumen de categorías">
        <TarjetaMetrica etiqueta="Total categorías" valor={mostrar(conteos?.total)} nota="Registradas en el sistema" />
        <TarjetaMetrica etiqueta="Categorías activas" valor={mostrar(conteos?.activas)} nota="Visibles en el catálogo" />
        <TarjetaMetrica etiqueta="Categorías inactivas" valor={mostrar(inactivas)} nota="Ocultas para los clientes" />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__titulo">Lista de categorías</h2>
            <p className="admin-panel__sub">Organiza el catálogo de arreglos y plantas.</p>
          </div>
          <div className="admin-panel__acciones">
            <button type="button" className="admin-btn" onClick={abrirCrear}>
              <span className="material-symbols-outlined">add</span>
              Nueva categoría
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <Buscador
            valor={busqueda}
            onChange={(v) => { setPagina(1); setBusqueda(v); }}
            placeholder="Buscar por nombre..."
          />
          <TabsEstado opciones={opciones} activo={estado} onCambiar={(v) => { setPagina(1); setEstado(v); }} />
        </div>

        {cargando ? (
          <Loader texto="Cargando categorías..." />
        ) : (
          <>
            <TablaCategorias
              categorias={categorias}
              conteos={conteoProductos}
              onEditar={abrirEditar}
              onCambiarEstado={manejarCambiarEstado}
            />
            <p className="admin-resumen">
              Mostrando <strong>{categorias.length}</strong> de <strong>{totalFiltrado}</strong> categorías
            </p>
            <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
          </>
        )}
      </section>

      {mostrarFormulario && (
        <FormularioCategoria
          categoria={editando}
          onGuardar={manejarGuardar}
          onCancelar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Categorias;
