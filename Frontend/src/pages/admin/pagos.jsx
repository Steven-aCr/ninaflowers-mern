import { useCallback, useEffect, useState } from "react";
import * as pagoService from "../../services/pagoService.js";
import TablaPagos from "../../components/admin/TablaPagos.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Pedidos.css";

const ESTADOS = ["pendiente", "completado", "fallido", "reembolsado"];

function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(1);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [confirmando, setConfirmando] = useState(null);
  const [reembolsando, setReembolsando] = useState(null);
  const [referencia, setReferencia] = useState("");
  const [toast, setToast] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await pagoService.listarPagos({
        page: pagina,
        limite: 10,
        estado: estado || undefined
      });

      setPagos(resultado.datos || []);
      setTotal(Math.max(1, resultado.totalPag || 1));
    } catch {
      setToast("No se pudieron cargar los pagos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, estado]);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirConfirmacion = (pago) => {
    setConfirmando(pago);
    setReferencia(pago.referenciaTransaccion || "");
  };

  const confirmarPago = async () => {
    if (!confirmando) return;
    try {
      setProcesando(true);
      await pagoService.confirmarPago(confirmando._id, referencia);
      setConfirmando(null);
      setReferencia("");
      setToast("Pago confirmado. La venta y el movimiento de inventario fueron procesados.");
      await cargar();
    } catch (error) {
      setToast(error.response?.data?.error || "No se pudo confirmar el pago.");
    } finally {
      setProcesando(false);
    }
  };

  const abrirReembolso = (pago) => setReembolsando(pago);

  const confirmarReembolso = async () => {
    if (!reembolsando) return;
    try {
      setProcesando(true);
      await pagoService.reembolsarPago(reembolsando._id);
      setReembolsando(null);
      setToast("Reembolso procesado correctamente.");
      await cargar();
    } catch (error) {
      setToast(error.response?.data?.error || "No se pudo procesar el reembolso.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="gestion-page">
      <header className="gestion-header">
        <div>
          <p className="gestion-eyebrow">Finanzas</p>
          <h1>Pagos</h1>
          <p>Consulta el historial de transacciones y administra únicamente las acciones permitidas.</p>
        </div>
      </header>

      <div className="gestion-filtros">
        <label>
          Estado
          <select
            value={estado}
            onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
          >
            <option value="">Todos</option>
            {ESTADOS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>

        <button type="button" onClick={cargar}>Actualizar</button>
      </div>

      {cargando ? (
        <Loader texto="Cargando pagos..." />
      ) : (
        <>
          <TablaPagos pagos={pagos} onConfirmar={abrirConfirmacion} onReembolsar={abrirReembolso} />
          <Paginacion paginaActual={pagina} totalPaginas={total} onCambiarPagina={setPagina} />
        </>
      )}

      {confirmando && (
        <div
          className="gestion-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && !procesando && setConfirmando(null)}
        >
          <section className="gestion-modal">
            <div className="gestion-modal__head">
              <div>
                <p className="gestion-eyebrow">Pago #{confirmando._id.slice(-6).toUpperCase()}</p>
                <h2>Confirmar recepción</h2>
              </div>
              <button className="gestion-cerrar" disabled={procesando} onClick={() => setConfirmando(null)}>×</button>
            </div>

            <div className="gestion-card">
              <p>Vas a confirmar que el pago por <strong>{confirmando.metodo}</strong> fue recibido.</p>
              <p>
                Al confirmar, el sistema marcará el pago como completado, confirmará el pedido,
                descontará las existencias y registrará las salidas por venta.
              </p>

              {confirmando.metodo === "transferencia" && (
                <div className="gestion-form-row">
                  <input
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Referencia de transferencia"
                  />
                </div>
              )}

              <div className="gestion-form-row">
                <button type="button" disabled={procesando} onClick={confirmarPago}>
                  {procesando ? "Procesando..." : "Confirmar pago recibido"}
                </button>
                <button type="button" disabled={procesando} onClick={() => setConfirmando(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {reembolsando && (
        <div
          className="gestion-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && !procesando && setReembolsando(null)}
        >
          <section className="gestion-modal">
            <div className="gestion-modal__head">
              <div>
                <p className="gestion-eyebrow">Pago #{reembolsando._id.slice(-6).toUpperCase()}</p>
                <h2>Reembolsar pago</h2>
              </div>
              <button className="gestion-cerrar" disabled={procesando} onClick={() => setReembolsando(null)}>×</button>
            </div>

            <div className="gestion-card">
              <p>¿Deseas procesar el reembolso de esta transacción?</p>

              {reembolsando.metodo === "tarjeta" && (
                <p>El reembolso se solicitará a Stripe.</p>
              )}

              <p>El reembolso financiero no devolverá automáticamente productos al inventario.</p>

              <div className="gestion-form-row">
                <button type="button" disabled={procesando} onClick={confirmarReembolso}>
                  {procesando ? "Procesando..." : "Confirmar reembolso"}
                </button>
                <button type="button" disabled={procesando} onClick={() => setReembolsando(null)}>
                  Cancelar
                </button>
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