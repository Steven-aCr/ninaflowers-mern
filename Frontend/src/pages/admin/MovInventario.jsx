import { useEffect, useState, useCallback } from "react";
import * as movInventarioService from "../../services/movInventarioService.js";
import * as inventarioService from "../../services/inventarioService.js";
import * as productoService from "../../services/productoService.js";
import * as proveedorService from "../../services/proveedorService.js";
import TablaMovimientos from "../../components/admin/TablaMovimientos.jsx";
import FormularioMovimiento from "../../components/admin/FormularioMovimiento.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./MovInventario.css";

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
      setTotalPaginas(resultado.totalPag || 1);
      setTotalMovimientos(resultado.totalDoc || 0);
    } catch (error) {
      console.error(error);
      setToast("No se pudieron cargar los movimientos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, filtros]);

  useEffect(() => { cargarMovimientos(); }, [cargarMovimientos]);

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

  const limpiarFiltros = () => {
    setPagina(1);
    setFiltros(FILTROS_INICIALES);
  };

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
      await cargarMovimientos();
    } catch (error) {
      console.error(error);
      setToast(error.response?.data?.error || "No se pudo registrar el movimiento.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="movinventario-page">
      <div className="movinventario-page__encabezado">
        <div>
          <h1>Movimientos de Inventario</h1>
          <p className="movinventario-page__descripcion">
            Historial de entradas y salidas de inventario.
            Las ventas y producciones se registran automáticamente.
          </p>
        </div>

        <button type="button" onClick={abrirFormulario}>+ Registrar movimiento</button>
      </div>

      <div className="movinventario-page__resumen">
        <span>Movimientos encontrados: <strong>{totalMovimientos}</strong></span>
      </div>

      <div className="movinventario-page__filtros">
        <select value={filtros.productoId} onChange={manejarFiltro("productoId")}>
          <option value="">Todos los productos</option>
          {productosFiltro.map((p) => (
            <option key={p._id} value={p._id}>{p.nombre} ({p.sku})</option>
          ))}
        </select>

        <select value={filtros.tipo} onChange={manejarFiltro("tipo")}>
          <option value="">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>

        <select value={filtros.motivo} onChange={manejarFiltro("motivo")}>
          <option value="">Todos los motivos</option>
          <option value="compra">Compra</option>
          <option value="venta">Venta</option>
          <option value="produccion">Producción</option>
          <option value="merma">Merma</option>
          <option value="ajuste">Ajuste</option>
          <option value="devolucion">Devolución</option>
        </select>

        <input type="date" value={filtros.fechaInicio} onChange={manejarFiltro("fechaInicio")} title="Fecha inicial" />
        <input type="date" value={filtros.fechaFin} onChange={manejarFiltro("fechaFin")} title="Fecha final" />

        <button type="button" onClick={limpiarFiltros}>Limpiar filtros</button>
      </div>

      {cargando ? (
        <Loader texto="Cargando movimientos..." />
      ) : movimientos.length === 0 ? (
        <div className="movinventario-page__vacio">
          <p>No se encontraron movimientos con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <TablaMovimientos movimientos={movimientos} />
          <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
        </>
      )}

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
    </div>
  );
}

export default MovInventario;