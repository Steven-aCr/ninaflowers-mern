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

const FILTROS_INICIALES = { productoId: "", tipo: "", motivo: "", fechaInicio: "", fechaFin: "" };

function MovInventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [productosFiltro, setProductosFiltro] = useState([]);
  const [productosConInventario, setProductosConInventario] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
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
      setMovimientos(resultado.datos);
      setTotalPaginas(resultado.totalPag);
    } catch {
      setToast("No se pudieron cargar los movimientos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, filtros]);

  useEffect(() => { cargarMovimientos(); }, [cargarMovimientos]);

  useEffect(() => {
    productoService.listarProductos({ activo: "true", limite: 500 })
      .then((res) => setProductosFiltro(res.datos))
      .catch(() => setToast("No se pudieron cargar los productos."));
  }, []);

  const manejarFiltro = (campo) => (e) => {
    setPagina(1);
    setFiltros((actual) => ({ ...actual, [campo]: e.target.value }));
  };

  const abrirFormulario = async () => {
    try {
      const [resInventario, resProveedores] = await Promise.all([
        inventarioService.listarInventario({ limite: 500 }),
        proveedorService.listarProveedores({ activo: "true", limite: 500 })
      ]);
      // Solo productos que ya tienen inventario registrado pueden recibir movimientos.
      const productos = resInventario.datos.map((inv) => ({
        _id: inv.productoId._id,
        nombre: inv.productoId.nombre,
        sku: inv.productoId.sku,
        stock: inv.stock
      }));
      setProductosConInventario(productos);
      setProveedores(resProveedores.datos);
      setMostrarFormulario(true);
    } catch {
      setToast("No se pudo preparar el formulario.");
    }
  };

  const manejarGuardar = async (datos) => {
    setGuardando(true);
    try {
      await movInventarioService.crearMovimiento(datos);
      setMostrarFormulario(false);
      setToast("Movimiento registrado correctamente.");
      cargarMovimientos();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="movinventario-page">
      <div className="movinventario-page__encabezado">
        <h1>Movimientos de Inventario</h1>
        <button type="button" onClick={abrirFormulario}>+ Registrar movimiento</button>
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
          <option value="merma">Merma</option>
          <option value="ajuste">Ajuste</option>
          <option value="devolucion">Devolución</option>
        </select>

        <input type="date" value={filtros.fechaInicio} onChange={manejarFiltro("fechaInicio")} />
        <input type="date" value={filtros.fechaFin} onChange={manejarFiltro("fechaFin")} />

        <button type="button" onClick={() => { setPagina(1); setFiltros(FILTROS_INICIALES); }}>
          Limpiar filtros
        </button>
      </div>

      {cargando ? (
        <Loader texto="Cargando movimientos..." />
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