import { useEffect, useState, useCallback } from "react";
import * as proveedorService from "../../services/proveedorService.js";
import * as movInventarioService from "../../services/movInventarioService.js";
import TablaProveedores from "../../components/admin/TablaProveedores.jsx";
import FormularioProveedor from "../../components/admin/FormularioProveedor.jsx";
import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Buscador from "../../components/common/Buscador.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [conteos, setConteos] = useState(null); // { total, activos, compras }
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState(""); // "" = todos, "true" = activos, "false" = inactivos
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [toast, setToast] = useState("");

  const cargarProveedores = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (busqueda) params.nombre = busqueda;
      if (estado) params.activo = estado;
      const resultado = await proveedorService.listarProveedores(params);
      setProveedores(resultado.datos);
      setTotalPaginas(Math.max(1, resultado.totalPag));
      setTotalFiltrado(resultado.totalDoc);
    } catch {
      setToast("No se pudieron cargar los proveedores.");
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda, estado]);

  // Tarjetas y pestañas. "compras" = movimientos de inventario con motivo "compra"
  // (cada uno es una compra a un proveedor). Si algo falla, quedan en "—".
  const cargarConteos = useCallback(async () => {
    try {
      const [todos, activos, compras] = await Promise.all([
        proveedorService.listarProveedores({ page: 1, limite: 1 }),
        proveedorService.listarProveedores({ page: 1, limite: 1, activo: "true" }),
        movInventarioService.listarMovimientos({ page: 1, limite: 1, motivo: "compra" }),
      ]);
      setConteos({
        total: todos.totalDoc ?? 0,
        activos: activos.totalDoc ?? 0,
        compras: compras.totalDoc ?? 0,
      });
    } catch {
      setConteos(null);
    }
  }, []);

  useEffect(() => { cargarProveedores(); }, [cargarProveedores]);
  useEffect(() => { cargarConteos(); }, [cargarConteos]);

  const abrirCrear = () => { setEditando(null); setMostrarFormulario(true); };
  const abrirEditar = (proveedor) => { setEditando(proveedor); setMostrarFormulario(true); };

  const manejarGuardar = async (datos) => {
    setGuardando(true);
    try {
      if (editando) {
        await proveedorService.modificarProveedor(editando._id, datos);
        setToast("Proveedor actualizado.");
      } else {
        await proveedorService.crearProveedor(datos);
        setToast("Proveedor creado.");
      }
      setMostrarFormulario(false);
      cargarProveedores();
      cargarConteos();
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambiarEstado = async (proveedor) => {
    try {
      if (proveedor.activo) {
        await proveedorService.eliminarProveedor(proveedor._id);
      } else {
        await proveedorService.modificarProveedor(proveedor._id, { activo: true });
      }
      setToast(proveedor.activo ? "Proveedor desactivado." : "Proveedor activado.");
      cargarProveedores();
      cargarConteos();
    } catch {
      setToast("No se pudo cambiar el estado.");
    }
  };

  const mostrar = (numero) => (numero === null || numero === undefined ? "—" : numero);
  const inactivos = conteos ? conteos.total - conteos.activos : null;

  const opciones = [
    { valor: "", etiqueta: "Todos", cantidad: conteos?.total },
    { valor: "true", etiqueta: "Activos", cantidad: conteos?.activos },
    { valor: "false", etiqueta: "Inactivos", cantidad: inactivos },
  ];

  return (
    <>
      <section className="admin-stats" aria-label="Resumen de proveedores">
        <TarjetaMetrica etiqueta="Total proveedores" valor={mostrar(conteos?.total)} nota="Registrados en el sistema" />
        <TarjetaMetrica etiqueta="Proveedores activos" valor={mostrar(conteos?.activos)} nota="Disponibles para compras" />
        <TarjetaMetrica etiqueta="Proveedores inactivos" valor={mostrar(inactivos)} nota="Fuera de operación" />
        <TarjetaMetrica etiqueta="Compras registradas" valor={mostrar(conteos?.compras)} nota="Entradas de inventario por compra" />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__titulo">Proveedores</h2>
            <p className="admin-panel__sub">Lista de proveedores de flores, follaje y accesorios.</p>
          </div>
          <div className="admin-panel__acciones">
            <button type="button" className="admin-btn" onClick={abrirCrear}>
              <span className="material-symbols-outlined">add</span>
              Nuevo proveedor
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <Buscador
            valor={busqueda}
            onChange={(v) => { setPagina(1); setBusqueda(v); }}
            placeholder="Buscar proveedor..."
          />
          <TabsEstado opciones={opciones} activo={estado} onCambiar={(v) => { setPagina(1); setEstado(v); }} />
        </div>

        {cargando ? (
          <Loader texto="Cargando proveedores..." />
        ) : (
          <>
            <TablaProveedores proveedores={proveedores} onEditar={abrirEditar} onCambiarEstado={manejarCambiarEstado} />
            <p className="admin-resumen">
              Mostrando <strong>{proveedores.length}</strong> de <strong>{totalFiltrado}</strong> proveedores
            </p>
            <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
          </>
        )}
      </section>

      {mostrarFormulario && (
        <FormularioProveedor
          proveedor={editando}
          onGuardar={manejarGuardar}
          onCancelar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Proveedores;
