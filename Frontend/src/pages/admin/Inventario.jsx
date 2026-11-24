import { useEffect, useState, useCallback } from "react";
import * as inventarioService from "../../services/inventarioService.js";
import * as movInventarioService from "../../services/movInventarioService.js";
import * as productoService from "../../services/productoService.js";
import * as proveedorService from "../../services/proveedorService.js";
import TablaInventario from "../../components/admin/TablaInventario.jsx";
import FormularioInventario from "../../components/admin/FormularioInventario.jsx";
import MovimientosRecientes from "../../components/admin/MovimientosRecientes.jsx";
import ModalAdmin from "../../components/admin/ModalAdmin.jsx";
import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import { inicioDeMes } from "../../utils/formatosAdmin.js";
import "./Inventario.css";

function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [resumen, setResumen] = useState(null); // contadores de tarjetas y pestañas
  const [recientes, setRecientes] = useState([]); // null = falló la carga
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
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
      setTotalPaginas(Math.max(1, resultado.totalPag || 1));
      setTotalFiltrado(resultado.totalDoc || 0);
    } catch (error) {
      console.error(error);
      setToast("No se pudo cargar el inventario.");
    } finally {
      setCargando(false);
    }
  }, [pagina, soloBajoMinimo, tipoProducto]);

  // Tarjetas, contadores de pestañas y movimientos recientes. Cada bloque falla por
  // separado: si uno no carga, queda en "—" y el resto de la vista sigue funcionando.
  const cargarResumen = useCallback(async () => {
    const contar = (params) => inventarioService.listarInventario({ page: 1, limite: 1, ...params });
    const contarMov = (params) => movInventarioService.listarMovimientos({ page: 1, limite: 1, ...params });
    const desde = inicioDeMes();

    const [inv, mov, ultimos] = await Promise.all([
      Promise.all([
        contar({}),
        contar({ bajoMinimo: "true" }),
        contar({ tipoProducto: "simple" }),
        contar({ tipoProducto: "compuesto" }),
      ]).catch(() => null),
      Promise.all([
        contarMov({ tipo: "entrada", fechaInicio: desde }),
        contarMov({ tipo: "salida", fechaInicio: desde }),
      ]).catch(() => null),
      movInventarioService.listarMovimientos({ page: 1, limite: 5 }).catch(() => null),
    ]);

    setResumen({
      total: inv?.[0].totalDoc ?? null,
      bajo: inv?.[1].totalDoc ?? null,
      simples: inv?.[2].totalDoc ?? null,
      compuestos: inv?.[3].totalDoc ?? null,
      entradasMes: mov?.[0].totalDoc ?? null,
      salidasMes: mov?.[1].totalDoc ?? null,
    });
    setRecientes(ultimos ? ultimos.datos || [] : null);
  }, []);

  useEffect(() => { cargarInventarios(); }, [cargarInventarios]);
  useEffect(() => { cargarResumen(); }, [cargarResumen]);

  const actualizarTodo = async () => {
    await Promise.all([cargarInventarios(), cargarResumen()]);
  };

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
      await actualizarTodo();
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
      await actualizarTodo();
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
      await actualizarTodo();
    } catch (error) {
      console.error(error);
      setToast(error.response?.data?.error || "No se pudo realizar la producción.");
    } finally {
      setProduciendo(false);
    }
  };

  const mostrar = (numero) => (numero === null || numero === undefined ? "—" : numero);

  const opciones = [
    { valor: "", etiqueta: "Todos", cantidad: resumen?.total },
    { valor: "simple", etiqueta: "Simples", cantidad: resumen?.simples },
    { valor: "compuesto", etiqueta: "Compuestos", cantidad: resumen?.compuestos },
  ];

  return (
    <>
      <section className="admin-stats" aria-label="Resumen de inventario">
        <TarjetaMetrica etiqueta="Productos con inventario" valor={mostrar(resumen?.total)} nota="Registros de stock" />
        <TarjetaMetrica
          etiqueta="Stock bajo"
          valor={
            <>
              {mostrar(resumen?.bajo)}
              {resumen?.bajo > 0 && <span className="admin-pill admin-pill--alerta">Atención</span>}
            </>
          }
          nota="En o por debajo del mínimo"
        />
        <TarjetaMetrica etiqueta="Entradas del mes" valor={mostrar(resumen?.entradasMes)} nota="Movimientos de entrada" />
        <TarjetaMetrica etiqueta="Salidas del mes" valor={mostrar(resumen?.salidasMes)} nota="Movimientos de salida" />
      </section>

      <div className="inventario-layout">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <h2 className="admin-panel__titulo">Inventario de productos</h2>
              <p className="admin-panel__sub">Existencias, mínimos y producción de arreglos compuestos.</p>
            </div>
            <div className="admin-panel__acciones">
              <button type="button" className="admin-btn admin-btn--claro" onClick={actualizarTodo}>
                <span className="material-symbols-outlined">refresh</span>
                Actualizar
              </button>
              <button type="button" className="admin-btn" onClick={abrirFormulario}>
                <span className="material-symbols-outlined">add</span>
                Nuevo registro
              </button>
            </div>
          </div>

          <div className="admin-toolbar">
            <TabsEstado
              opciones={opciones}
              activo={tipoProducto}
              onCambiar={(valor) => { setPagina(1); setTipoProducto(valor); }}
            />
            <label className="admin-check admin-toolbar__fin">
              <input
                type="checkbox"
                checked={soloBajoMinimo}
                onChange={(e) => { setPagina(1); setSoloBajoMinimo(e.target.checked); }}
              />
              Solo stock bajo mínimo
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
              <p className="admin-resumen">
                Mostrando <strong>{inventarios.length}</strong> de <strong>{totalFiltrado}</strong> registros
              </p>
              <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
            </>
          )}
        </section>

        <MovimientosRecientes movimientos={recientes} />
      </div>

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
        <ModalAdmin
          titulo="Editar stock mínimo"
          onCerrar={() => setEditando(null)}
          cerrarBloqueado={guardando}
          onSubmit={guardarMinimo}
        >
          <div className="admin-modal__resumen">
            <strong>{editando.productoId?.nombre}</strong>
            <span>SKU: {editando.productoId?.sku} · Stock actual: {editando.stock}</span>
          </div>

          <label className="admin-modal__campo">
            Nuevo stock mínimo
            <input
              type="number"
              min="0"
              value={nuevoMinimo}
              onChange={(e) => setNuevoMinimo(e.target.value)}
              required
            />
          </label>

          <div className="admin-modal__acciones">
            <button type="button" className="admin-btn admin-btn--borde" onClick={() => setEditando(null)} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="admin-btn" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </ModalAdmin>
      )}

      {productoProduccion && (
        <ModalAdmin
          titulo="Producir producto"
          onCerrar={cerrarProduccion}
          cerrarBloqueado={produciendo}
          onSubmit={manejarProduccion}
        >
          <div className="admin-modal__resumen">
            <strong>{productoProduccion.productoId?.nombre}</strong>
            <span>SKU: {productoProduccion.productoId?.sku}</span>
            <span>Stock actual: {productoProduccion.stock}</span>
          </div>

          <label className="admin-modal__campo">
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

          <p className="admin-modal__aviso">
            Al producir este artículo se descontarán automáticamente los componentes
            necesarios y se registrarán los movimientos de inventario.
          </p>

          <div className="admin-modal__acciones">
            <button type="button" className="admin-btn admin-btn--borde" onClick={cerrarProduccion} disabled={produciendo}>
              Cancelar
            </button>
            <button type="submit" className="admin-btn" disabled={produciendo}>
              {produciendo ? "Produciendo..." : "Producir"}
            </button>
          </div>
        </ModalAdmin>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Inventario;
