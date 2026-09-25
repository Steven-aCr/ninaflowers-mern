import { useEffect, useState, useCallback } from "react";
import * as inventarioService from "../../services/inventarioService.js";
import * as productoService from "../../services/productoService.js";
import * as proveedorService from "../../services/proveedorService.js";
import TablaInventario from "../../components/admin/TablaInventario.jsx";
import FormularioInventario from "../../components/admin/FormularioInventario.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Inventario.css";

function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [soloBajoMinimo, setSoloBajoMinimo] = useState(false);
  const [tipoProducto, setTipoProducto] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevoMinimo, setNuevoMinimo] = useState("");
  const [productoProduccion, setProductoProduccion] = useState(null);
  const [cantidadProduccion, setCantidadProduccion] = useState(1);
  const [produciendo, setProduciendo] = useState(false);
  const [toast, setToast] = useState("");

  const cargarInventarios = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (soloBajoMinimo) params.bajoMinimo = "true";
      if (tipoProducto) params.tipoProducto = tipoProducto;

      const resultado = await inventarioService.listarInventario(params);
      setInventarios(resultado.datos || []);
      setTotalPaginas(resultado.totalPag || 1);
    } catch (error) {
      console.error(error);
      setToast("No se pudo cargar el inventario.");
    } finally {
      setCargando(false);
    }
  }, [pagina, soloBajoMinimo, tipoProducto]);

  useEffect(() => { cargarInventarios(); }, [cargarInventarios]);

  // Trae productos, proveedores e inventario actual en paralelo para armar
  // el formulario solo con productos que todavía no tienen stock registrado.
  const abrirFormulario = async () => {
    try {
      const [resProductos, resProveedores, resInventarios] = await Promise.all([
        productoService.listarProductos({ activo: "true", limite: 1000 }),
        proveedorService.listarProveedores({ activo: "true", limite: 1000 }),
        inventarioService.listarInventario({ limite: 1000 })
      ]);

      const idsConInventario = new Set(
        (resInventarios.datos || [])
          .filter((inventario) => inventario.productoId)
          .map((inventario) => inventario.productoId._id)
      );

      const productosSinInventario = (resProductos.datos || [])
        .filter((producto) => !idsConInventario.has(producto._id));

      setProductos(productosSinInventario);
      setProveedores(resProveedores.datos || []);

      if (productosSinInventario.length === 0) {
        setToast("Todos los productos activos ya tienen inventario registrado.");
        return;
      }

      setMostrarFormulario(true);
    } catch (error) {
      console.error(error);
      setToast("No se pudieron cargar los productos disponibles.");
    }
  };

  const manejarCrear = async (datos) => {
    setGuardando(true);
    try {
      await inventarioService.crearInventario(datos);
      setMostrarFormulario(false);
      setToast("Inventario registrado correctamente.");
      await cargarInventarios();
    } catch (error) {
      console.error(error);
      setToast(error.response?.data?.error || "No se pudo registrar el inventario.");
    } finally {
      setGuardando(false);
    }
  };

  const manejarEditarMinimo = (inventario) => {
    setEditando(inventario);
    setNuevoMinimo(inventario.stockMinimo);
  };

  const guardarMinimo = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await inventarioService.modificarInventario(editando._id, {
        stockMinimo: Number(nuevoMinimo)
      });
      setEditando(null);
      setToast("Stock mínimo actualizado.");
      await cargarInventarios();
    } catch (error) {
      console.error(error);
      setToast(error.response?.data?.error || "No se pudo actualizar el stock mínimo.");
    } finally {
      setGuardando(false);
    }
  };

  const abrirProduccion = (inventario) => {
    setProductoProduccion(inventario);
    setCantidadProduccion(1);
  };

  const cerrarProduccion = () => {
    if (produciendo) return;
    setProductoProduccion(null);
    setCantidadProduccion(1);
  };

  const manejarProduccion = async (e) => {
    e.preventDefault();

    const productoId = productoProduccion?.productoId?._id;
    if (!productoId) {
      setToast("Producto no válido.");
      return;
    }

    const cantidad = Number(cantidadProduccion);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      setToast("La cantidad a producir debe ser un entero mayor que cero.");
      return;
    }

    setProduciendo(true);
    try {
      const resultado = await inventarioService.producirProducto(productoId, cantidad);
      setProductoProduccion(null);
      setCantidadProduccion(1);
      setToast(resultado?.mensaje || "Producto producido correctamente.");
      await cargarInventarios();
    } catch (error) {
      console.error(error);
      setToast(error.response?.data?.error || "No se pudo realizar la producción.");
    } finally {
      setProduciendo(false);
    }
  };

  return (
    <div className="inventario-page">
      <div className="inventario-page__encabezado">
        <h1>Inventario</h1>
        <button type="button" onClick={abrirFormulario}>+ Nuevo registro</button>
      </div>

      <div className="inventario-page__filtros">
        <select
          value={tipoProducto}
          onChange={(e) => { setPagina(1); setTipoProducto(e.target.value); }}
        >
          <option value="">Todos los productos</option>
          <option value="simple">Productos simples</option>
          <option value="compuesto">Productos compuestos</option>
        </select>

        <label className="inventario-page__filtro">
          <input
            type="checkbox"
            checked={soloBajoMinimo}
            onChange={(e) => { setPagina(1); setSoloBajoMinimo(e.target.checked); }}
          />
          Mostrar solo productos con stock bajo mínimo
        </label>
      </div>

      {cargando ? (
        <Loader texto="Cargando inventario..." />
      ) : (
        <>
          <TablaInventario
            inventarios={inventarios}
            onEditarMinimo={manejarEditarMinimo}
            onProducir={abrirProduccion}
          />
          <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
        </>
      )}

      {mostrarFormulario && (
        <FormularioInventario
          productos={productos}
          proveedores={proveedores}
          onGuardar={manejarCrear}
          onCancelar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}

      {editando && (
        <div className="formulario-inventario__overlay">
          <form className="formulario-inventario" onSubmit={guardarMinimo}>
            <h2>Editar stock mínimo — {editando.productoId?.nombre}</h2>

            <label className="formulario-inventario__campo">
              Nuevo stock mínimo
              <input
                type="number"
                min="0"
                value={nuevoMinimo}
                onChange={(e) => setNuevoMinimo(e.target.value)}
                required
              />
            </label>

            <div className="formulario-inventario__acciones">
              <button type="button" onClick={() => setEditando(null)} disabled={guardando}>
                Cancelar
              </button>
              <button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {productoProduccion && (
        <div className="formulario-inventario__overlay">
          <form className="formulario-inventario inventario-produccion" onSubmit={manejarProduccion}>
            <h2>Producir producto</h2>

            <div className="inventario-produccion__producto">
              <strong>{productoProduccion.productoId?.nombre}</strong>
              <span>SKU: {productoProduccion.productoId?.sku}</span>
              <span>Stock actual: {productoProduccion.stock}</span>
            </div>

            <label className="formulario-inventario__campo">
              Cantidad a producir
              <input
                type="number"
                min="1"
                step="1"
                value={cantidadProduccion}
                onChange={(e) => setCantidadProduccion(e.target.value)}
                required
              />
            </label>

            <p className="inventario-produccion__aviso">
              Al producir este artículo se descontarán automáticamente los componentes
              necesarios y se registrarán los movimientos de inventario.
            </p>

            <div className="formulario-inventario__acciones">
              <button type="button" onClick={cerrarProduccion} disabled={produciendo}>
                Cancelar
              </button>
              <button type="submit" disabled={produciendo}>
                {produciendo ? "Produciendo..." : "Producir"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Inventario;