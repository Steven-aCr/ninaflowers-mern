import { useCallback, useEffect, useState } from "react";
import * as pagoService from "../../services/pagoService.js";
import TablaPagos from "../../components/admin/TablaPagos.jsx";
import ModalAdmin from "../../components/admin/ModalAdmin.jsx";
import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import { formatearPrecio } from "../../utils/formatearPrecio.js";
import { idCorto } from "../../utils/formatosAdmin.js";

const ESTADOS = [
  { valor: "completado", etiqueta: "Completados" },
  { valor: "pendiente", etiqueta: "Pendientes" },
  { valor: "fallido", etiqueta: "Fallidos" },
  { valor: "reembolsado", etiqueta: "Reembolsados" },
];

function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(1);
  const [estado, setEstado] = useState("");
  const [reporte, setReporte] = useState(null); // resumen de /pago/reporte (alimenta tarjetas y pestañas)
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
        estado: estado || undefined,
      });

      setPagos(resultado.datos || []);
      setTotal(Math.max(1, resultado.totalPag || 1));
    } catch {
      setToast("No se pudieron cargar los pagos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, estado]);

  // Si el reporte falla, las tarjetas muestran "—" y la tabla sigue funcionando.
  const cargarReporte = useCallback(async () => {
    try {
      setReporte(await pagoService.obtenerReportePagos());
    } catch {
      setReporte(null);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { cargarReporte(); }, [cargarReporte]);

  const actualizarTodo = () => {
    cargar();
    cargarReporte();
  };

  const abrirConfirmacion = (pago) => {
    setConfirmando(pago);
    setReferencia(pago.referenciaTransaccion || "");
  };

  const cerrarConfirmacion = () => {
    setConfirmando(null);
    setReferencia("");
  };

  const confirmarPago = async () => {
    if (!confirmando) return;
    try {
      setProcesando(true);
      await pagoService.confirmarPago(confirmando._id, referencia);
      cerrarConfirmacion();
      setToast("Pago confirmado. La venta y el movimiento de inventario fueron procesados.");
      await Promise.all([cargar(), cargarReporte()]);
    } catch (error) {
      setToast(error.response?.data?.error || "No se pudo confirmar el pago.");
    } finally {
      setProcesando(false);
    }
  };

  const confirmarReembolso = async () => {
    if (!reembolsando) return;
    try {
      setProcesando(true);
      await pagoService.reembolsarPago(reembolsando._id);
      setReembolsando(null);
      setToast("Reembolso procesado correctamente.");
      await Promise.all([cargar(), cargarReporte()]);
    } catch (error) {
      setToast(error.response?.data?.error || "No se pudo procesar el reembolso.");
    } finally {
      setProcesando(false);
    }
  };

  const cambiarPestana = (valor) => {
    setEstado(valor);
    setPagina(1);
  };

  // ---- Datos del reporte para tarjetas y pestañas ----
  const porEstado = Object.fromEntries((reporte?.porEstado || []).map((e) => [e.estado, e]));
  const cantidadEstado = (valor) => (reporte ? porEstado[valor]?.cantidad ?? 0 : undefined);
  const montoEstado = (valor) => (reporte ? formatearPrecio(porEstado[valor]?.monto ?? 0) : "—");
  const tarjeta = reporte?.porMetodo?.find((m) => m.metodo === "tarjeta");
  const totalPagos = reporte ? reporte.porEstado.reduce((suma, e) => suma + e.cantidad, 0) : undefined;

  const opciones = [
    { valor: "", etiqueta: "Todos", cantidad: totalPagos },
    ...ESTADOS.map((e) => ({ ...e, cantidad: cantidadEstado(e.valor) })),
  ];

  return (
    <>
      <section className="admin-stats" aria-label="Resumen de pagos">
        <TarjetaMetrica
          etiqueta="Total cobrado"
          valor={reporte ? formatearPrecio(reporte.totalRecaudado) : "—"}
          nota={reporte ? `${reporte.pagosCompletados} pagos completados` : undefined}
        />
        <TarjetaMetrica etiqueta="Pagos pendientes" valor={montoEstado("pendiente")} nota="Por confirmar o cobrar" />
        <TarjetaMetrica etiqueta="Reembolsos" valor={montoEstado("reembolsado")} nota="Devueltos a clientes" />
        <TarjetaMetrica
          etiqueta="Pagos con tarjeta"
          valor={reporte ? formatearPrecio(tarjeta?.monto ?? 0) : "—"}
          nota={<span className="admin-pill admin-pill--lila">Stripe</span>}
        />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__titulo">Historial de pagos</h2>
            <p className="admin-panel__sub">Consulta las transacciones y administra solo las acciones permitidas.</p>
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
          <Loader texto="Cargando pagos..." />
        ) : (
          <>
            <TablaPagos pagos={pagos} onConfirmar={abrirConfirmacion} onReembolsar={setReembolsando} />
            <Paginacion paginaActual={pagina} totalPaginas={total} onCambiarPagina={setPagina} />
          </>
        )}
      </section>

      {confirmando && (
        <ModalAdmin titulo="Confirmar recepción" onCerrar={cerrarConfirmacion} cerrarBloqueado={procesando}>
          <div className="admin-modal__resumen">
            <strong>Pago {idCorto(confirmando._id)}</strong>
            <span>
              {confirmando.metodo} · {formatearPrecio(confirmando.monto)}
            </span>
          </div>

          <p className="admin-modal__aviso">
            Al confirmar, el sistema marcará el pago como completado, confirmará el pedido,
            descontará las existencias y registrará las salidas por venta.
          </p>

          {confirmando.metodo === "transferencia" && (
            <label className="admin-modal__campo">
              Referencia de transferencia
              <input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Número de comprobante" />
            </label>
          )}

          <div className="admin-modal__acciones">
            <button type="button" className="admin-btn admin-btn--borde" disabled={procesando} onClick={cerrarConfirmacion}>
              Cancelar
            </button>
            <button type="button" className="admin-btn" disabled={procesando} onClick={confirmarPago}>
              {procesando ? "Procesando..." : "Confirmar pago recibido"}
            </button>
          </div>
        </ModalAdmin>
      )}

      {reembolsando && (
        <ModalAdmin titulo="Reembolsar pago" onCerrar={() => setReembolsando(null)} cerrarBloqueado={procesando}>
          <div className="admin-modal__resumen">
            <strong>Pago {idCorto(reembolsando._id)}</strong>
            <span>
              {reembolsando.metodo} · {formatearPrecio(reembolsando.monto)}
            </span>
          </div>

          <p className="admin-modal__aviso">
            ¿Deseas procesar el reembolso de esta transacción?
            {reembolsando.metodo === "tarjeta" && " El reembolso se solicitará a Stripe."}
            {" "}El reembolso financiero no devolverá automáticamente los productos al inventario.
          </p>

          <div className="admin-modal__acciones">
            <button type="button" className="admin-btn admin-btn--borde" disabled={procesando} onClick={() => setReembolsando(null)}>
              Cancelar
            </button>
            <button type="button" className="admin-btn" disabled={procesando} onClick={confirmarReembolso}>
              {procesando ? "Procesando..." : "Confirmar reembolso"}
            </button>
          </div>
        </ModalAdmin>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Pagos;