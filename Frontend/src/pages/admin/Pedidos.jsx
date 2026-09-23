import { useCallback, useEffect, useState } from "react";
import * as pedidoService from "../../services/pedidoService.js";
import TablaPedidos from "../../components/admin/TablaPedidos.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import { formatearPrecio } from "../../utils/formatearPrecio.js";
import "./Pedidos.css";

const ESTADOS = [
  "pendiente",
  "pendiente_cotizacion",
  "confirmado",
  "en_preparacion",
  "listo_entrega",
  "entregado",
  "cancelado",
];

const texto = (v) => v.replaceAll("_", " ");

function Pedidos() {
  const [pedidos, setPedidos] = useState([]),
    [pagina, setPagina] = useState(1),
    [totalPaginas, setTotalPaginas] = useState(1);

  const [estado, setEstado] = useState(""),
    [cargando, setCargando] = useState(true),
    [seleccionado, setSeleccionado] = useState(null),
    [nuevoEstado, setNuevoEstado] = useState(""),
    [comentario, setComentario] = useState(""),
    [guardando, setGuardando] = useState(false),
    [toast, setToast] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await pedidoService.listarPedidos({
        page: pagina,
        limite: 10,
        estadoPedido: estado || undefined,
      });
      setPedidos(r.datos);
      setTotalPaginas(Math.max(1, r.totalPag));
    } catch {
      setToast("No se pudieron cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, estado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrir = (p) => {
    setSeleccionado(p);
    setNuevoEstado(p.estadoPedido);
    setComentario("");
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      const actualizado = await pedidoService.actualizarEstadoPedido(
        seleccionado._id,
        nuevoEstado,
        comentario
      );
      setSeleccionado(actualizado);
      setToast("Estado del pedido actualizado.");
      await cargar();
    } catch (e) {
      setToast(e.response?.data?.error || "No se pudo actualizar el pedido.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="gestion-page">
      <header className="gestion-header">
        <div>
          <p className="gestion-eyebrow">Operaciones</p>
          <h1>Pedidos</h1>
          <p>Consulta y administra el ciclo de vida de las órdenes.</p>
        </div>
        <div className="gestion-kpi">
          <strong>{pedidos.length}</strong>
          <span>en esta página</span>
        </div>
      </header>

      <div className="gestion-filtros">
        <label>
          Estado
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            {ESTADOS.map((x) => (
              <option key={x} value={x}>
                {texto(x)}
              </option>
            ))}
          </select>
        </label>
        <button onClick={cargar}>Actualizar</button>
      </div>

      {cargando ? (
        <Loader texto="Cargando pedidos..." />
      ) : (
        <>
          <TablaPedidos pedidos={pedidos} onVer={abrir} />
          <Paginacion
            paginaActual={pagina}
            totalPaginas={totalPaginas}
            onCambiarPagina={setPagina}
          />
        </>
      )}

      {seleccionado && (
        <div
          className="gestion-overlay"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setSeleccionado(null)
          }
        >
          <section className="gestion-modal">
            <div className="gestion-modal__head">
              <div>
                <p className="gestion-eyebrow">
                  Pedido #{seleccionado._id.slice(-6).toUpperCase()}
                </p>
                <h2>Detalle y seguimiento</h2>
              </div>
              <button
                className="gestion-cerrar"
                onClick={() => setSeleccionado(null)}
              >
                ×
              </button>
            </div>

            <div className="gestion-grid">
              <div className="gestion-card">
                <h3>Cliente</h3>
                <p>
                  <strong>
                    {seleccionado.usuarioId?.nombre}{" "}
                    {seleccionado.usuarioId?.apellido}
                  </strong>
                </p>
                <p>{seleccionado.usuarioId?.correo}</p>
              </div>
              <div className="gestion-card">
                <h3>Entrega</h3>
                <p>{seleccionado.direccionEntrega?.linea1}</p>
                <p>{seleccionado.direccionEntrega?.ciudad}</p>
                <small>{seleccionado.direccionEntrega?.referencia}</small>
              </div>
            </div>

            <div className="gestion-card">
              <h3>Productos</h3>
              {seleccionado.productos?.map((i, n) => (
                <div className="gestion-producto" key={n}>
                  <span>
                    {i.cantidad}× {i.nombreProducto}
                  </span>
                  <strong>{formatearPrecio(i.subtotal)}</strong>
                </div>
              ))}
              <div className="gestion-total">
                <span>Total</span>
                <strong>{formatearPrecio(seleccionado.total)}</strong>
              </div>
            </div>

            <div className="gestion-card">
              <h3>Cambiar estado</h3>
              <div className="gestion-form-row">
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  {ESTADOS.map((x) => (
                    <option key={x} value={x}>
                      {texto(x)}
                    </option>
                  ))}
                </select>
                <input
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Comentario opcional"
                />
                <button
                  onClick={guardar}
                  disabled={guardando || nuevoEstado === seleccionado.estadoPedido}
                >
                  {guardando ? "Guardando..." : "Guardar estado"}
                </button>
              </div>
            </div>

            <div className="gestion-card">
              <h3>Historial</h3>
              <div className="gestion-timeline">
                {[...(seleccionado.historialEstados || [])]
                  .reverse()
                  .map((h, n) => (
                    <div key={n}>
                      <span></span>
                      <p>
                        <strong>{texto(h.estado)}</strong>
                        <small>
                          {new Date(h.fecha).toLocaleString("es-SV")}
                          {h.comentario ? ` · ${h.comentario}` : ""}
                        </small>
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </div>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Pedidos;