import { useCallback, useEffect, useState } from "react";
import * as pagoService from "../../services/pagoService.js";
import TablaPagos from "../../components/admin/TablaPagos.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Pedidos.css";

const ESTADOS = ["pendiente", "completado", "fallido", "reembolsado"];

function Pagos() {
  const [pagos, setPagos] = useState([]),
    [pagina, setPagina] = useState(1),
    [total, setTotal] = useState(1),
    [estado, setEstado] = useState(""),
    [cargando, setCargando] = useState(true),
    [editando, setEditando] = useState(null),
    [nuevoEstado, setNuevoEstado] = useState(""),
    [referencia, setReferencia] = useState(""),
    [toast, setToast] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await pagoService.listarPagos({
        page: pagina,
        limite: 10,
        estado: estado || undefined,
      });
      setPagos(r.datos);
      setTotal(Math.max(1, r.totalPag));
    } catch {
      setToast("No se pudieron cargar los pagos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, estado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrir = (p) => {
    setEditando(p);
    setNuevoEstado(p.estado);
    setReferencia(p.referenciaTransaccion || "");
  };

  const guardar = async () => {
    try {
      await pagoService.actualizarEstadoPago(editando._id, nuevoEstado, referencia);
      setEditando(null);
      setToast("Pago actualizado.");
      cargar();
    } catch (e) {
      setToast(e.response?.data?.error || "No se pudo actualizar el pago.");
    }
  };

  return (
    <div className="gestion-page">
      <header className="gestion-header">
        <div>
          <p className="gestion-eyebrow">Finanzas</p>
          <h1>Pagos</h1>
          <p>Supervisa transacciones y su estado.</p>
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
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <button onClick={cargar}>Actualizar</button>
      </div>

      {cargando ? (
        <Loader texto="Cargando pagos..." />
      ) : (
        <>
          <TablaPagos pagos={pagos} onEditar={abrir} />
          <Paginacion
            paginaActual={pagina}
            totalPaginas={total}
            onCambiarPagina={setPagina}
          />
        </>
      )}

      {editando && (
        <div
          className="gestion-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setEditando(null)}
        >
          <section className="gestion-modal">
            <div className="gestion-modal__head">
              <div>
                <p className="gestion-eyebrow">
                  Pago #{editando._id.slice(-6).toUpperCase()}
                </p>
                <h2>Actualizar transacción</h2>
              </div>
              <button
                className="gestion-cerrar"
                onClick={() => setEditando(null)}
              >
                ×
              </button>
            </div>
            <div className="gestion-card">
              <div className="gestion-form-row">
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  {ESTADOS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <input
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Referencia de transacción"
                />
                <button onClick={guardar}>Guardar</button>
              </div>
            </div>
          </section>
        </div>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Pagos;