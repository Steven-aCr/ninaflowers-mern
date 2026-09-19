import { useEffect, useState, useCallback } from "react";
import * as proveedorService from "../../services/proveedorService.js";
import TablaProveedores from "../../components/admin/TablaProveedores.jsx";
import FormularioProveedor from "../../components/admin/FormularioProveedor.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Buscador from "../../components/common/Buscador.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Proveedores.css";

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [toast, setToast] = useState("");

  const cargarProveedores = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (busqueda) params.nombre = busqueda;
      const resultado = await proveedorService.listarProveedores(params);
      setProveedores(resultado.datos);
      setTotalPaginas(resultado.totalPag);
    } catch {
      setToast("No se pudieron cargar los proveedores.");
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda]);

  useEffect(() => { cargarProveedores(); }, [cargarProveedores]);

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
    } catch {
      setToast("No se pudo cambiar el estado.");
    }
  };

  return (
    <div className="proveedores-page">
      <div className="proveedores-page__encabezado">
        <h1>Proveedores</h1>
        <button type="button" onClick={abrirCrear}>+ Nuevo proveedor</button>
      </div>

      <Buscador
        valor={busqueda}
        onChange={(v) => { setPagina(1); setBusqueda(v); }}
        placeholder="Buscar por nombre..."
      />

      {cargando ? (
        <Loader texto="Cargando proveedores..." />
      ) : (
        <>
          <TablaProveedores proveedores={proveedores} onEditar={abrirEditar} onCambiarEstado={manejarCambiarEstado} />
          <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
        </>
      )}

      {mostrarFormulario && (
        <FormularioProveedor
          proveedor={editando}
          onGuardar={manejarGuardar}
          onCancelar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Proveedores;