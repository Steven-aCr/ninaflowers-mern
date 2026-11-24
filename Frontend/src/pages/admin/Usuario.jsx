import { useEffect, useState, useCallback, useRef } from "react";
import * as usuarioService from "../../services/usuarioService.js";
import * as pedidoService from "../../services/pedidoService.js";
import { useAuth } from "../../hooks/useAuth.js";
import TablaUsuarios from "../../components/admin/TablaUsuarios.jsx";
import DetalleUsuario from "../../components/admin/DetalleUsuario.jsx";
import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Buscador from "../../components/common/Buscador.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Usuario.css";

function Usuario() {
  const { usuario: sesion } = useAuth();
  const sesionId = sesion?._id || sesion?.id;

  const [usuarios, setUsuarios] = useState([]);
  const [conteos, setConteos] = useState(null); // { total, clientes, administradores, inactivos }
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalFiltrado, setTotalFiltrado] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState(""); // "", "cliente", "administrador"
  const [filtroEstado, setFiltroEstado] = useState(""); // "", "true", "false"
  const [seleccionado, setSeleccionado] = useState(null);
  const [pedidos, setPedidos] = useState(null); // null = cargando
  const [toast, setToast] = useState("");
  const seleccionActual = useRef(null); // evita que llegue tarde la respuesta de otro usuario

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    try {
      const params = { page: pagina, limite: 10 };
      if (busqueda) params.nombre = busqueda;
      if (filtroRol) params.rol = filtroRol;
      if (filtroEstado) params.activo = filtroEstado;
      const resultado = await usuarioService.listarUsuarios(params);
      setUsuarios(resultado.datos);
      setTotalPaginas(Math.max(1, resultado.totalPag));
      setTotalFiltrado(resultado.totalDoc);
    } catch {
      setToast("No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda, filtroRol, filtroEstado]);

  // Tarjetas y pestañas. Si falla, quedan en "—" y la tabla sigue funcionando.
  const cargarConteos = useCallback(async () => {
    const contar = (params) => usuarioService.listarUsuarios({ page: 1, limite: 1, ...params });
    try {
      const [total, clientes, administradores, inactivos] = await Promise.all([
        contar({}),
        contar({ rol: "cliente" }),
        contar({ rol: "administrador" }),
        contar({ activo: "false" }),
      ]);
      setConteos({
        total: total.totalDoc ?? 0,
        clientes: clientes.totalDoc ?? 0,
        administradores: administradores.totalDoc ?? 0,
        inactivos: inactivos.totalDoc ?? 0,
      });
    } catch {
      setConteos(null);
    }
  }, []);

  useEffect(() => { cargarUsuarios(); }, [cargarUsuarios]);
  useEffect(() => { cargarConteos(); }, [cargarConteos]);

  const verDetalle = async (usuario) => {
    seleccionActual.current = usuario._id;
    setSeleccionado(usuario);
    setPedidos(null);
    try {
      const resultado = await pedidoService.listarPedidos({ page: 1, limite: 3, usuarioId: usuario._id });
      if (seleccionActual.current === usuario._id) setPedidos(resultado.datos || []);
    } catch {
      if (seleccionActual.current === usuario._id) setPedidos([]);
    }
  };

  const manejarCambiarEstado = async (usuario) => {
    try {
      if (usuario.activo) {
        await usuarioService.desactivarUsuario(usuario._id);
      } else {
        await usuarioService.activarUsuario(usuario._id);
      }
      setToast(usuario.activo ? "Usuario desactivado." : "Usuario activado.");
      setSeleccionado((actual) =>
        actual && actual._id === usuario._id ? { ...actual, activo: !usuario.activo } : actual
      );
      cargarUsuarios();
      cargarConteos();
    } catch {
      setToast("No se pudo cambiar el estado del usuario.");
    }
  };

  const mostrar = (numero) => (numero === null || numero === undefined ? "—" : numero);

  const opciones = [
    { valor: "", etiqueta: "Todos", cantidad: conteos?.total },
    { valor: "cliente", etiqueta: "Clientes", cantidad: conteos?.clientes },
    { valor: "administrador", etiqueta: "Administradores", cantidad: conteos?.administradores },
  ];

  return (
    <>
      <section className="admin-stats" aria-label="Resumen de usuarios">
        <TarjetaMetrica etiqueta="Total usuarios" valor={mostrar(conteos?.total)} nota="Cuentas registradas" />
        <TarjetaMetrica etiqueta="Clientes" valor={mostrar(conteos?.clientes)} nota="Compran en la tienda" />
        <TarjetaMetrica etiqueta="Administradores" valor={mostrar(conteos?.administradores)} nota="Acceso al panel" />
        <TarjetaMetrica etiqueta="Cuentas inactivas" valor={mostrar(conteos?.inactivos)} nota="Sin acceso al sistema" />
      </section>

      <div className="usuarios-layout">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <h2 className="admin-panel__titulo">Usuarios</h2>
              <p className="admin-panel__sub">Clientes y administradores del sistema.</p>
            </div>
          </div>

          <div className="admin-toolbar">
            <TabsEstado
              opciones={opciones}
              activo={filtroRol}
              onCambiar={(valor) => { setPagina(1); setFiltroRol(valor); }}
            />
          </div>

          <div className="admin-toolbar">
            <Buscador
              valor={busqueda}
              onChange={(v) => { setPagina(1); setBusqueda(v); }}
              placeholder="Buscar por nombre..."
            />
            <select
              className="admin-campo"
              value={filtroEstado}
              onChange={(e) => { setPagina(1); setFiltroEstado(e.target.value); }}
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          {cargando ? (
            <Loader texto="Cargando usuarios..." />
          ) : (
            <>
              <TablaUsuarios
                usuarios={usuarios}
                seleccionadoId={seleccionado?._id}
                onVer={verDetalle}
              />
              <p className="admin-resumen">
                Mostrando <strong>{usuarios.length}</strong> de <strong>{totalFiltrado}</strong> usuarios
              </p>
              <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
            </>
          )}
        </section>

        <DetalleUsuario
          usuario={seleccionado}
          pedidos={pedidos}
          esPropio={Boolean(seleccionado) && Boolean(sesionId) && seleccionado._id === sesionId}
          onCambiarEstado={manejarCambiarEstado}
        />
      </div>

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Usuario;
