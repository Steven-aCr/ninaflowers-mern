import { useEffect, useState, useCallback } from "react";
import * as productoService from "../../services/productoService.js";
import * as categoriaService from "../../services/categoriaService.js";
import * as inventarioService from "../../services/inventarioService.js";
import TablaProductos from "../../components/admin/TablaProductos.jsx";
import FormularioProducto from "../../components/admin/FormularioProducto.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Buscador from "../../components/common/Buscador.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [stock, setStock] = useState(null); // { [productoId]: stock } o null si falla
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState(""); // pestaña de categoría ("" = todos)
  const [filtroEstado, setFiltroEstado] = useState(""); // "", "true", "false"
  const [filtroTipo, setFiltroTipo] = useState(""); // "", "simple", "compuesto"
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [toast, setToast] = useState("");

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (busqueda) params.nombre = busqueda;
      if (categoriaId) params.categoriaId = categoriaId;
      if (filtroEstado) params.activo = filtroEstado;
      if (filtroTipo) params.tipoProducto = filtroTipo;
      const resultado = await productoService.listarProductos(params);
      setProductos(resultado.datos);
      setTotalPaginas(Math.max(1, resultado.totalPag));
      setTotalFiltrado(resultado.totalDoc);
    } catch {
      setToast("No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda, categoriaId, filtroEstado, filtroTipo]);

  // Stock de cada producto (columna "Stock"). Si falla, la columna muestra "—".
  const cargarStock = useCallback(async () => {
    try {
      const resultado = await inventarioService.listarInventario({ limite: 1000 });
      setStock(
        Object.fromEntries(
          (resultado.datos || [])
            .filter((inv) => inv.productoId)
            .map((inv) => [inv.productoId._id, inv.stock])
        )
      );
    } catch {
      setStock(null);
    }
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);
  useEffect(() => { cargarStock(); }, [cargarStock]);

  useEffect(() => {
    categoriaService.listarCategorias({ activo: "true", limite: 100 })
      .then((res) => setCategorias(res.datos))
      .catch(() => setToast("No se pudieron cargar las categorías."));
  }, []);

  const abrirCrear = async () => {
    setEditando(null);
    await cargarProductosDisponibles();
    setMostrarFormulario(true);
  };

  const abrirEditar = async (producto) => {
    setEditando(producto);
    await cargarProductosDisponibles(producto._id);
    setMostrarFormulario(true);
  };

  // Solo productos "simple" y activos pueden ser componentes; se excluye
  // al propio producto en edición para no permitir que se contenga a sí mismo.
  const cargarProductosDisponibles = async (excluirId) => {
    try {
      const res = await productoService.listarProductos({ tipoProducto: "simple", activo: "true", limite: 200 });
      setProductosDisponibles(res.datos.filter((p) => p._id !== excluirId));
    } catch {
      setToast("No se pudieron cargar los productos para componentes.");
    }
  };

  const manejarGuardar = async (datos, archivos) => {
    setGuardando(true);
    try {
      if (editando) {
        await productoService.modificarProducto(editando._id, datos, archivos);
        setToast("Producto actualizado.");
      } else {
        await productoService.crearProducto(datos, archivos);
        setToast("Producto creado.");
      }
      setMostrarFormulario(false);
      cargarProductos();
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambiarEstado = async (producto) => {
    try {
      await productoService.cambiarEstadoProducto(producto._id, !producto.activo);
      setToast(producto.activo ? "Producto desactivado." : "Producto activado.");
      cargarProductos();
    } catch {
      setToast("No se pudo cambiar el estado.");
    }
  };

  const cambiarFiltro = (setter) => (e) => {
    setPagina(1);
    setter(e.target.value);
  };

  const opcionesCategoria = [
    { valor: "", etiqueta: "Todos" },
    ...categorias.map((c) => ({ valor: c._id, etiqueta: c.nombre })),
  ];

  return (
    <>
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__titulo">Lista de productos</h2>
            <p className="admin-panel__sub">Arreglos florales y plantas disponibles.</p>
          </div>
          <div className="admin-panel__acciones">
            <button type="button" className="admin-btn" onClick={abrirCrear}>
              <span className="material-symbols-outlined">add</span>
              Nuevo producto
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <TabsEstado
            opciones={opcionesCategoria}
            activo={categoriaId}
            onCambiar={(valor) => { setPagina(1); setCategoriaId(valor); }}
          />
        </div>

        <div className="admin-toolbar">
          <Buscador
            valor={busqueda}
            onChange={(v) => { setPagina(1); setBusqueda(v); }}
            placeholder="Buscar producto..."
          />

          <select className="admin-campo" value={filtroTipo} onChange={cambiarFiltro(setFiltroTipo)} aria-label="Filtrar por tipo">
            <option value="">Todos los tipos</option>
            <option value="simple">Simples</option>
            <option value="compuesto">Compuestos</option>
          </select>

          <select className="admin-campo" value={filtroEstado} onChange={cambiarFiltro(setFiltroEstado)} aria-label="Filtrar por estado">
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        {cargando ? (
          <Loader texto="Cargando productos..." />
        ) : (
          <>
            <TablaProductos
              productos={productos}
              stock={stock}
              onEditar={abrirEditar}
              onCambiarEstado={manejarCambiarEstado}
            />
            <p className="admin-resumen">
              Mostrando <strong>{productos.length}</strong> de <strong>{totalFiltrado}</strong> productos
            </p>
            <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
          </>
        )}
      </section>

      {mostrarFormulario && (
        <FormularioProducto
          producto={editando}
          categorias={categorias}
          productosDisponibles={productosDisponibles}
          onGuardar={manejarGuardar}
          onCancelar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Productos;
