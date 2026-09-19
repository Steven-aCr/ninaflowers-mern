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
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevoMinimo, setNuevoMinimo] = useState("");
  const [toast, setToast] = useState("");

  const cargarInventarios = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (soloBajoMinimo) params.bajoMinimo = "true";
      const resultado = await inventarioService.listarInventario(params);
      setInventarios(resultado.datos);
      setTotalPaginas(resultado.totalPag);
    } catch {
      setToast("No se pudo cargar el inventario.");
    } finally {
      setCargando(false);
    }
  }, [pagina, soloBajoMinimo]);

  useEffect(() => { cargarInventarios(); }, [cargarInventarios]);

  const abrirFormulario = async () => {
    try {
      const [resProductos, resProveedores] = await Promise.all([
        productoService.listarProductos({ activo: "true", limite: 1000 }),
        proveedorService.listarProveedores({ activo: "true", limite: 1000 })
      ]);
      const idsConInventario = new Set(inventarios.map((inv) => inv.productoId?._id));
      const disponibles = resProductos.datos.filter((p) => !idsConInventario.has(p._id));
      setProductos(disponibles);
      setProveedores(resProveedores.datos);
      setMostrarFormulario(true);
    } catch {
      setToast("No se pudieron cargar productos/proveedores.");
    }
  };

  const manejarCrear = async (datos) => {
    setGuardando(true);
    try {
      await inventarioService.crearInventario(datos);
      setMostrarFormulario(false);
      setToast("Inventario registrado correctamente.");
      cargarInventarios();
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
      await inventarioService.modificarInventario(editando._id, { stockMinimo: Number(nuevoMinimo) });
      setEditando(null);
      setToast("Stock mínimo actualizado.");
      cargarInventarios();
    } catch {
      setToast("No se pudo actualizar el stock mínimo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="inventario-page">
      <div className="inventario-page__encabezado">
        <h1>Inventario</h1>
        <button type="button" onClick={abrirFormulario}>+ Nuevo registro</button>
      </div>

      <label className="inventario-page__filtro">
        <input
          type="checkbox"
          checked={soloBajoMinimo}
          onChange={(e) => { setPagina(1); setSoloBajoMinimo(e.target.checked); }}
        />
        Mostrar solo productos con stock bajo mínimo
      </label>

      {cargando ? (
        <Loader texto="Cargando inventario..." />
      ) : (
        <>
          <TablaInventario inventarios={inventarios} onEditarMinimo={manejarEditarMinimo} />
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
              <input type="number" min="0" value={nuevoMinimo} onChange={(e) => setNuevoMinimo(e.target.value)} required />
            </label>
            <div className="formulario-inventario__acciones">
              <button type="button" onClick={() => setEditando(null)} disabled={guardando}>Cancelar</button>
              <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Inventario;