import { useEffect, useState, useCallback } from "react";
import * as productoService from "../../services/productoService.js";
import * as categoriaService from "../../services/categoriaService.js";
import TablaProductos from "../../components/admin/TablaProductos.jsx";
import FormularioProducto from "../../components/admin/FormularioProducto.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Buscador from "../../components/common/Buscador.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editando, setEditando] = useState(null);
  const [toast, setToast] = useState("");

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (busqueda) params.nombre = busqueda;
      const resultado = await productoService.listarProductos(params);
      setProductos(resultado.datos);
      setTotalPaginas(resultado.totalPag);
    } catch {
      setToast("No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda]);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  useEffect(() => {
    categoriaService.listarCategorias({ activo: "true", limite: 100 })
      .then((res) => setCategorias(res.datos))
      .catch(() => setToast("No se pudieron cargar las categorías."));
  }, []);

  const abrirCrear = async () => {
    setEditando(null);
    await cargarProductosDisponibles();
    setMostrarFormulario(true);
  };

  const abrirEditar = async (producto) => {
    setEditando(producto);
    await cargarProductosDisponibles(producto._id);
    setMostrarFormulario(true);
  };

  // Solo productos "simple" y activos pueden ser componentes; se excluye
  // al propio producto en edición para no permitir que se contenga a sí mismo.
  const cargarProductosDisponibles = async (excluirId) => {
    try {
      const res = await productoService.listarProductos({ tipoProducto: "simple", activo: "true", limite: 200 });
      setProductosDisponibles(res.datos.filter((p) => p._id !== excluirId));
    } catch {
      setToast("No se pudieron cargar los productos para componentes.");
    }
  };

  const manejarGuardar = async (datos, archivos) => {
    setGuardando(true);
    try {
      if (editando) {
        await productoService.modificarProducto(editando._id, datos, archivos);
        setToast("Producto actualizado.");
      } else {
        await productoService.crearProducto(datos, archivos);
        setToast("Producto creado.");
      }
      setMostrarFormulario(false);
      cargarProductos();
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambiarEstado = async (producto) => {
    try {
      await productoService.cambiarEstadoProducto(producto._id, !producto.activo);
      setToast(producto.activo ? "Producto desactivado." : "Producto activado.");
      cargarProductos();
    } catch {
      setToast("No se pudo cambiar el estado.");
    }
  };

  return (
    <div className="productos-page">
      <div className="productos-page__encabezado">
        <h1>Productos</h1>
        <button type="button" onClick={abrirCrear}>+ Nuevo producto</button>
      </div>

      <Buscador
        valor={busqueda}
        onChange={(v) => { setPagina(1); setBusqueda(v); }}
        placeholder="Buscar por nombre..."
      />

      {cargando ? (
        <Loader texto="Cargando productos..." />
      ) : (
        <>
          <TablaProductos productos={productos} onEditar={abrirEditar} onCambiarEstado={manejarCambiarEstado} />
          <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
        </>
      )}

      {mostrarFormulario && (
        <FormularioProducto
          producto={editando}
          categorias={categorias}
          productosDisponibles={productosDisponibles}
          onGuardar={manejarGuardar}
          onCancelar={() => setMostrarFormulario(false)}
          guardando={guardando}
        />
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Productos;