import { useEffect, useState, useCallback } from "react";
import * as usuarioService from "../../services/usuarioService.js";
import TablaUsuarios from "../../components/admin/TablaUsuarios.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Buscador from "../../components/common/Buscador.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Usuario.css";

function Usuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [toast, setToast] = useState("");

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (busqueda) params.nombre = busqueda;
      if (filtroRol) params.rol = filtroRol;
      const resultado = await usuarioService.listarUsuarios(params);
      setUsuarios(resultado.datos);
      setTotalPaginas(resultado.totalPag);
    } catch {
      setToast("No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda, filtroRol]);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);

  const manejarCambiarEstado = async (usuario) => {
    try {
      if (usuario.activo) {
        await usuarioService.desactivarUsuario(usuario._id);
      } else {
        await usuarioService.activarUsuario(usuario._id);
      }
      setToast(usuario.activo ? "Usuario desactivado." : "Usuario activado.");
      cargarUsuarios();
    } catch {
      setToast("No se pudo cambiar el estado del usuario.");
    }
  };

  return (
    <div className="usuarios-page">
      <div className="usuarios-page__encabezado">
        <h1>Usuarios</h1>
      </div>

      <div className="usuarios-page__filtros">
        <Buscador
          valor={busqueda}
          onChange={(v) => { setPagina(1); setBusqueda(v); }}
          placeholder="Buscar por nombre..."
        />
        <select value={filtroRol} onChange={(e) => { setPagina(1); setFiltroRol(e.target.value); }}>
          <option value="">Todos los roles</option>
          <option value="cliente">Cliente</option>
          <option value="administrador">Administrador</option>
        </select>
      </div>

      {cargando ? (
        <Loader texto="Cargando usuarios..." />
      ) : (
        <>
          <TablaUsuarios usuarios={usuarios} onCambiarEstado={manejarCambiarEstado} />
          <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
        </>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Usuario;