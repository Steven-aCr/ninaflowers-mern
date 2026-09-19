import { useEffect, useState, useCallback } from "react";
import * as categoriaService from "../../services/categoriaService.js";
import TablaCategorias from "../../components/admin/TablaCategorias.jsx";
import FormularioCategoria from "../../components/admin/FormularioCategoria.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Buscador from "../../components/common/Buscador.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Categorias.css";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [toast, setToast] = useState("");

  const cargarCategorias = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (busqueda) params.nombre = busqueda;
      const resultado = await categoriaService.listarCategorias(params);
      setCategorias(resultado.datos);
      setTotalPaginas(resultado.totalPag);
    } catch {
      setToast("No se pudieron cargar las categorías.");
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda]);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);

  const abrirCrear = () => { setEditando(null); setMostrarFormulario(true); };
  const abrirEditar = (categoria) => { setEditando(categoria); setMostrarFormulario(true); };

  const manejarGuardar = async (datos) => {
    setGuardando(true);
    try {
      if (editando) {
        await categoriaService.modificarCategoria(editando._id, datos);
        setToast("Categoría actualizada.");
      } else {
        await categoriaService.crearCategoria(datos);
        setToast("Categoría creada.");
      }
      setMostrarFormulario(false);
      cargarCategorias();
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambiarEstado = async (categoria) => {
    try {
      if (categoria.activo) {
        await categoriaService.eliminarCategoria(categoria._id);
      } else {
        await categoriaService.modificarCategoria(categoria._id, { activo: true });
      }
      setToast(categoria.activo ? "Categoría desactivada." : "Categoría activada.");
      cargarCategorias();
    } catch {
      setToast("No se pudo cambiar el estado.");
    }
  };

  return (
    <div className="categorias-page">
      <div className="categorias-page__encabezado">
        <h1>Categorías</h1>
        <button type="button" onClick={abrirCrear}>+ Nueva categoría</button>
      </div>

      <Buscador
        valor={busqueda}
        onChange={(v) => { setPagina(1); setBusqueda(v); }}
        placeholder="Buscar por nombre..."
      />

      {cargando ? (
        <Loader texto="Cargando categorías..." />
      ) : (
        <>
          <TablaCategorias categorias={categorias} onEditar={abrirEditar} onCambiarEstado={manejarCambiarEstado} />
          <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
        </>
      )}

      {mostrarFormulario && (
        <FormularioCategoria
          categoria={editando}
          onGuardar={manejarGuardar}
          onCancelar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Categorias;