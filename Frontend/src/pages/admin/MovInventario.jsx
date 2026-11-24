import { useEffect, useState, useCallback } from "react";
import * as movInventarioService from "../../services/movInventarioService.js";
import * as inventarioService from "../../services/inventarioService.js";
import * as productoService from "../../services/productoService.js";
import * as proveedorService from "../../services/proveedorService.js";
import TablaMovimientos from "../../components/admin/TablaMovimientos.jsx";
import FormularioMovimiento from "../../components/admin/FormularioMovimiento.jsx";
import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";

const FILTROS_INICIALES = {
  productoId: "",
  tipo: "",
  motivo: "",
  fechaInicio: "",
  fechaFin: ""
};

function MovInventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [productosFiltro, setProductosFiltro] = useState([]);
  const [productosConInventario, setProductosConInventario] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [conteos, setConteos] = useState(null); // { total, entradas, salidas, mermas }
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalMovimientos, setTotalMovimientos] = useState(0);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [toast, setToast] = useState("");

  const cargarMovimientos = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      Object.entries(filtros).forEach(([clave, valor]) => {
        if (valor) params[clave] = valor;
      });

      const resultado = await movInventarioService.listarMovimientos(params);
      setMovimientos(resultado.datos || []);
      setTotalPaginas(Math.max(1, resultado.totalPag || 1));
      setTotalMovimientos(resultado.totalDoc || 0);
    } catch (error) {
      console.error(error);
      setToast("No se pudieron cargar los movimientos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, filtros]);

  // Tarjetas y pestañas: totales sin filtros. Si falla, quedan en "—".
  const cargarConteos = useCallback(async () => {
    const contar = (params) => movInventarioService.listarMovimientos({ page: 1, limite: 1, ...params });
    try {
      const [total, entradas, salidas, mermas] = await Promise.all([
        contar({}),
        contar({ tipo: "entrada" }),
        contar({ tipo: "salida" }),
        contar({ motivo: "merma" }),
      ]);
      setConteos({
        total: total.totalDoc ?? 0,
        entradas: entradas.totalDoc ?? 0,
        salidas: salidas.totalDoc ?? 0,
        mermas: mermas.totalDoc ?? 0,
      });
    } catch {
      setConteos(null);
    }
  }, []);

  useEffect(() => { cargarMovimientos(); }, [cargarMovimientos]);
  useEffect(() => { cargarConteos(); }, [cargarConteos]);

  // Catálogo para el selector de filtro por producto; independiente
  // de la paginación de movimientos.
  useEffect(() => {
    productoService
      .listarProductos({ activo: "true", limite: 500 })
      .then((res) => setProductosFiltro(res.datos || []))
      .catch(() => setToast("No se pudieron cargar los productos."));
  }, []);

  const manejarFiltro = (campo) => (e) => {
    setPagina(1);
    setFiltros((actual) => ({ ...actual, [campo]: e.target.value }));
  };

  const cambiarTipo = (valor) => {
    setPagina(1);
    setFiltros((actual) => ({ ...actual, tipo: valor }));
  };

  const limpiarFiltros = () => {
    setPagina(1);
    setFiltros(FILTROS_INICIALES);
  };

  const hayFiltros = Object.values(filtros).some(Boolean);

  // Solo se ofrecen productos con inventario ya registrado: un movimiento
  // manual requiere un stock existente sobre el cual operar.
  const abrirFormulario = async () => {
    try {
      const [resInventario, resProveedores] = await Promise.all([
        inventarioService.listarInventario({ limite: 500 }),
        proveedorService.listarProveedores({ activo: "true", limite: 500 })
      ]);

      const productos = (resInventario.datos || [])
        .filter((inv) => inv.productoId)
        .map((inv) => ({
          _id: inv.productoId._id,
          nombre: inv.productoId.nombre,
          sku: inv.productoId.sku,
          tipoProducto: inv.productoId.tipoProducto,
          stock: inv.stock
        }));

      setProductosConInventario(productos);
      setProveedores(resProveedores.datos || []);
      setMostrarFormulario(true);
    } catch (error) {
      console.error(error);
      setToast("No se pudo preparar el formulario.");
    }
  };

  const manejarGuardar = async (datos) => {
    setGuardando(true);
    try {
      await movInventarioService.crearMovimiento(datos);
      setMostrarFormulario(false);
      setToast("Movimiento registrado correctamente.");
      await Promise.all([cargarMovimientos(), cargarConteos()]);
    } catch (error) {
      console.error(error);
      setToast(error.response?.data?.error || "No se pudo registrar el movimiento.");
    } finally {
      setGuardando(false);
    }
  };

  const mostrar = (numero) => (numero === null || numero === undefined ? "—" : numero);

  const opciones = [
    { valor: "", etiqueta: "Todos", cantidad: conteos?.total },
    { valor: "entrada", etiqueta: "Entradas", cantidad: conteos?.entradas },
    { valor: "salida", etiqueta: "Salidas", cantidad: conteos?.salidas },
  ];

  return (
    <>
      <section className="admin-stats" aria-label="Resumen de movimientos">
        <TarjetaMetrica etiqueta="Total de movimientos" valor={mostrar(conteos?.total)} nota="Historial completo" />
        <TarjetaMetrica etiqueta="Entradas" valor={mostrar(conteos?.entradas)} nota="Compras, devoluciones y ajustes" />
        <TarjetaMetrica etiqueta="Salidas" valor={mostrar(conteos?.salidas)} nota="Ventas, producción y mermas" />
        <TarjetaMetrica etiqueta="Mermas" valor={mostrar(conteos?.mermas)} nota="Pérdidas o daños registrados" />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__titulo">Movimientos de inventario</h2>
            <p className="admin-panel__sub">
              Historial de entradas y salidas. Las ventas y producciones se registran automáticamente.
            </p>
          </div>
          <div className="admin-panel__acciones">
            <button type="button" className="admin-btn" onClick={abrirFormulario}>
              <span className="material-symbols-outlined">add</span>
              Registrar movimiento
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <TabsEstado opciones={opciones} activo={filtros.tipo} onCambiar={cambiarTipo} />
        </div>

        <div className="admin-toolbar">
          <select className="admin-campo" value={filtros.productoId} onChange={manejarFiltro("productoId")} aria-label="Filtrar por producto">
            <option value="">Todos los productos</option>
            {productosFiltro.map((p) => (
              <option key={p._id} value={p._id}>{p.nombre} ({p.sku})</option>
            ))}
          </select>

          <select className="admin-campo" value={filtros.motivo} onChange={manejarFiltro("motivo")} aria-label="Filtrar por motivo">
            <option value="">Todos los motivos</option>
            <option value="compra">Compra</option>
            <option value="venta">Venta</option>
            <option value="produccion">Producción</option>
            <option value="merma">Merma</option>
            <option value="ajuste">Ajuste</option>
            <option value="devolucion">Devolución</option>
          </select>

          <input className="admin-campo" type="date" value={filtros.fechaInicio} onChange={manejarFiltro("fechaInicio")} title="Fecha inicial" aria-label="Fecha inicial" />
          <input className="admin-campo" type="date" value={filtros.fechaFin} onChange={manejarFiltro("fechaFin")} title="Fecha final" aria-label="Fecha final" />

          <button
            type="button"
            className="admin-btn admin-btn--borde admin-btn--sm admin-toolbar__fin"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        {cargando ? (
          <Loader texto="Cargando movimientos..." />
        ) : (
          <>
            <TablaMovimientos movimientos={movimientos} />
            <p className="admin-resumen">
              Movimientos encontrados: <strong>{totalMovimientos}</strong>
            </p>
            <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
          </>
        )}
      </section>

      {mostrarFormulario && (
        <FormularioMovimiento
          productos={productosConInventario}
          proveedores={proveedores}
          onGuardar={manejarGuardar}
          onCancelar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default MovInventario;
