import { useCallback, useEffect, useState } from "react";
import * as pedidoService from "../../services/pedidoService.js";
import TablaPedidos from "../../components/admin/TablaPedidos.jsx";
import PedidoDetalleModal from "../../components/admin/PedidoDetalleModal.jsx";
import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import { ESTADOS_PEDIDO, ESTADOS_EN_CURSO } from "../../utils/constantes.js";

const VALORES_ESTADO = ESTADOS_PEDIDO.map((e) => e.valor);

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalFiltrado, setTotalFiltrado] = useState(0);

  const [estado, setEstado] = useState(""); // "" = todos
  const [conteos, setConteos] = useState(null); // { pendiente: 4, ... } o null mientras carga
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [toast, setToast] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await pedidoService.listarPedidos({
        page: pagina,
        limite: 10,
        estadoPedido: estado || undefined,
      });
      setPedidos(resultado.datos);
      setTotalPaginas(Math.max(1, resultado.totalPag));
      setTotalFiltrado(resultado.totalDoc);
    } catch {
      setToast("No se pudieron cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, estado]);

  // Los contadores de las pestañas y las tarjetas. Si falla, quedan en "—"
  // y la tabla sigue funcionando.
  const cargarConteos = useCallback(async () => {
    try {
      setConteos(await pedidoService.contarPedidosPorEstado(VALORES_ESTADO));
    } catch {
      setConteos(null);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { cargarConteos(); }, [cargarConteos]);

  const guardarEstado = async (nuevoEstado, comentario) => {
    setGuardando(true);
    try {
      const actualizado = await pedidoService.actualizarEstadoPedido(seleccionado._id, nuevoEstado, comentario);
      setSeleccionado(actualizado);
      setToast("Estado del pedido actualizado.");
      await Promise.all([cargar(), cargarConteos()]);
    } catch (error) {
      setToast(error.response?.data?.error || "No se pudo actualizar el pedido.");
    } finally {
      setGuardando(false);
    }
  };

  const actualizarTodo = () => {
    cargar();
    cargarConteos();
  };

  const cambiarPestana = (valor) => {
    setEstado(valor);
    setPagina(1);
  };

  const sumar = (lista) => (conteos ? lista.reduce((total, e) => total + (conteos[e] ?? 0), 0) : null);
  const total = sumar(VALORES_ESTADO);
  const mostrar = (numero) => (numero === null ? "—" : numero);

  const opciones = [
    { valor: "", etiqueta: "Todos", cantidad: total },
    ...ESTADOS_PEDIDO.map((e) => ({ valor: e.valor, etiqueta: e.etiqueta, cantidad: conteos?.[e.valor] })),
  ];

  return (
    <>
      <section className="admin-stats" aria-label="Resumen de pedidos">
        <TarjetaMetrica etiqueta="Total de pedidos" valor={mostrar(total)} nota="Registrados en el sistema" />
        <TarjetaMetrica etiqueta="En curso" valor={mostrar(sumar(ESTADOS_EN_CURSO))} nota="Pendientes, confirmados, en preparación o listos" />
        <TarjetaMetrica etiqueta="Entregados" valor={mostrar(sumar(["entregado"]))} nota="Completados con éxito" />
        <TarjetaMetrica etiqueta="Cancelados" valor={mostrar(sumar(["cancelado"]))} nota="Anulados" />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__titulo">Historial de pedidos</h2>
            <p className="admin-panel__sub">Consulta y administra el ciclo de vida de las órdenes.</p>
          </div>
          <div className="admin-panel__acciones">
            <button type="button" className="admin-btn admin-btn--claro" onClick={actualizarTodo}>
              <span className="material-symbols-outlined">refresh</span>
              Actualizar
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <TabsEstado opciones={opciones} activo={estado} onCambiar={cambiarPestana} />
        </div>

        {cargando ? (
          <Loader texto="Cargando pedidos..." />
        ) : (
          <>
            <TablaPedidos pedidos={pedidos} onVer={setSeleccionado} />
            <p className="admin-resumen">
              Mostrando <strong>{pedidos.length}</strong> de <strong>{totalFiltrado}</strong> pedidos
            </p>
            <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
          </>
        )}
      </section>

      {seleccionado && (
        <PedidoDetalleModal
          key={`${seleccionado._id}-${seleccionado.estadoPedido}`}
          pedido={seleccionado}
          guardando={guardando}
          onGuardar={guardarEstado}
          onCerrar={() => setSeleccionado(null)}
        />
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Pedidos;