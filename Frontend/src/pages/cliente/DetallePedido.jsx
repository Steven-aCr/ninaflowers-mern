import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import * as pedidoService from "../../services/pedidoService.js";
import * as pagoService from "../../services/pagoService.js";
import * as stripeService from "../../services/stripeService.js";
import "./DetallePedido.css";

function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [pedido, setPedido] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [error, setError] = useState("");
  const [errorPago, setErrorPago] = useState("");
  const [mensaje, setMensaje] = useState(location.state?.mensaje || "");

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cargarDetalle = async () => {
    try {
      setCargando(true);
      setError("");

      const resultadoPedido = await pedidoService.obtenerPedido(id);
      setPedido(resultadoPedido);

      // Si todavía no existe ningún pago, simplemente quedamos con [].
      try {
        const resultadoPagos = await pagoService.obtenerPagoPorPedido(id);
        setPagos(Array.isArray(resultadoPagos) ? resultadoPagos : []);
      } catch (errorPagoConsulta) {
        console.warn("No se pudieron consultar los pagos:", errorPagoConsulta);
        setPagos([]);
      }
    } catch (error) {
      console.error("Error cargando pedido:", error);
      setError(error.response?.data?.error || error.response?.data?.mensaje || "No se pudo cargar el pedido.");
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (cantidad) =>
    new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(Number(cantidad || 0));

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    return new Intl.DateTimeFormat("es-SV", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(fecha));
  };

  const formatearEstado = (estado) => {
    if (!estado) return "Pendiente";
    return estado.replaceAll("_", " ").replace(/\b\w/g, (letra) => letra.toUpperCase());
  };

  const pagoCompletado = pagos.find((pago) => pago.estado === "completado");
  const pagoPendiente = pagos.find((pago) => pago.estado === "pendiente");
  const pedidoPagado = Boolean(pagoCompletado);

  const pagarConTarjeta = async () => {
    if (!pedido) return;

    try {
      setProcesandoPago(true);
      setErrorPago("");
      setMensaje("");

      const resultado = await stripeService.crearSesionCheckout(pedido._id);

      if (!resultado?.url) {
        throw new Error("Stripe no devolvió una URL de pago.");
      }

      window.location.href = resultado.url;
    } catch (error) {
      console.error("Error iniciando Stripe:", error);
      setErrorPago(
        error.response?.data?.error ||
        error.response?.data?.mensaje ||
        error.message ||
        "No se pudo iniciar el pago."
      );
      setProcesandoPago(false);
    }
  };

  const seleccionarPagoManual = async (metodo) => {
    if (!pedido) return;

    try {
      setProcesandoPago(true);
      setErrorPago("");
      setMensaje("");

      await pagoService.crearPago(pedido._id, metodo);

      setMensaje(
        metodo === "efectivo"
          ? "El pago en efectivo fue registrado y está pendiente de confirmación."
          : "La transferencia fue registrada y está pendiente de validación."
      );

      // Recargamos para reflejar el nuevo pago en la vista.
      await cargarDetalle();
    } catch (error) {
      console.error("Error registrando pago:", error);
      setErrorPago(error.response?.data?.error || error.response?.data?.mensaje || "No se pudo registrar el método de pago.");
    } finally {
      setProcesandoPago(false);
    }
  };

  if (cargando) {
    return (
      <main className="detalle-pedido">
        <div className="detalle-pedido__contenedor">
          <div className="detalle-pedido__cargando">Cargando pedido...</div>
        </div>
      </main>
    );
  }

  if (error || !pedido) {
    return (
      <main className="detalle-pedido">
        <div className="detalle-pedido__contenedor">
          <div className="detalle-pedido__error">
            <h2>No pudimos cargar el pedido</h2>
            <p>{error || "Pedido no encontrado."}</p>
            <button onClick={() => navigate("/mis-pedidos")}>Volver a mis pedidos</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="detalle-pedido">
      <div className="detalle-pedido__contenedor">
        <header className="detalle-pedido__encabezado">
          <div>
            <button className="detalle-pedido__volver" onClick={() => navigate("/mis-pedidos")}>
              ← Mis pedidos
            </button>

            <h1>Pedido #{pedido._id?.slice(-6).toUpperCase()}</h1>
            <p>Realizado el {formatearFecha(pedido.createdAt || pedido.fechaPedido)}</p>
          </div>

          <span className={`detalle-pedido__estado detalle-pedido__estado--${pedido.estadoPedido}`}>
            {formatearEstado(pedido.estadoPedido)}
          </span>
        </header>

        {mensaje && <div className="detalle-pedido__mensaje">{mensaje}</div>}
        {errorPago && <div className="detalle-pedido__error-pago">{errorPago}</div>}

        <section className="detalle-pedido__tarjeta">
          <h2>Productos</h2>

          <div className="detalle-pedido__productos">
            {pedido.productos?.map((item, index) => (
              <div className="detalle-pedido__producto" key={item.productoId || index}>
                <div>
                  <strong>{item.nombreProducto || item.productoId?.nombre || "Producto"}</strong>
                  <span>Cantidad: {item.cantidad}</span>
                </div>

                <div>
                  <span>{formatearMoneda(item.precioUnitario)}</span>
                  <strong>
                    {formatearMoneda(item.subtotal ?? Number(item.precioUnitario) * Number(item.cantidad))}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="detalle-pedido__tarjeta">
          <h2>Resumen</h2>

          <div className="detalle-pedido__resumen">
            <div>
              <span>Subtotal</span>
              <strong>{formatearMoneda(pedido.subtotal)}</strong>
            </div>

            {Number(pedido.descuento || 0) > 0 && (
              <div>
                <span>Descuento</span>
                <strong>-{formatearMoneda(pedido.descuento)}</strong>
              </div>
            )}

            {Number(pedido.impuesto || 0) > 0 && (
              <div>
                <span>Impuesto</span>
                <strong>{formatearMoneda(pedido.impuesto)}</strong>
              </div>
            )}

            <div className="detalle-pedido__total">
              <span>Total</span>
              <strong>{formatearMoneda(pedido.total)}</strong>
            </div>
          </div>
        </section>

        <section className="detalle-pedido__tarjeta">
          <h2>Entrega</h2>

          <div className="detalle-pedido__direccion">
            {pedido.direccionEntrega?.etiqueta && <strong>{pedido.direccionEntrega.etiqueta}</strong>}
            <p>{pedido.direccionEntrega?.linea1}</p>
            {pedido.direccionEntrega?.linea2 && <p>{pedido.direccionEntrega.linea2}</p>}
            <p>{pedido.direccionEntrega?.ciudad}</p>
            {pedido.direccionEntrega?.referencia && <p>Referencia: {pedido.direccionEntrega.referencia}</p>}
            <p><strong>Fecha estimada:</strong> {formatearFecha(pedido.fechaEntregaEstimada)}</p>
          </div>
        </section>

        {pedido.estadoPedido === "pendiente_cotizacion" && (
          <section className="detalle-pedido__tarjeta">
            <h2>Pago pendiente de cotización</h2>

            <div className="detalle-pedido__cotizacion">
              <span className="material-symbols-outlined">schedule</span>

              <div>
                <strong>Estamos cotizando tu envío</strong>
                <p>El administrador todavía debe establecer el costo del envío.</p>
                <p>Cuando termine la cotización, el pedido cambiará a pendiente y podrás realizar el pago desde esta misma pantalla.</p>
              </div>
            </div>
          </section>
        )}

        {pedido.estadoPedido === "pendiente" && !pedidoPagado && (
          <section className="detalle-pedido__tarjeta">
            <h2>Pago</h2>

            {pagoPendiente ? (
              <div className="detalle-pedido__pago-actual">
                <p>Actualmente tienes un pago pendiente.</p>

                <div>
                  <span>Método</span>
                  <strong>{formatearEstado(pagoPendiente.metodo)}</strong>
                </div>

                <div>
                  <span>Monto</span>
                  <strong>{formatearMoneda(pagoPendiente.monto)}</strong>
                </div>

                <div>
                  <span>Estado</span>
                  <strong>{formatearEstado(pagoPendiente.estado)}</strong>
                </div>
              </div>
            ) : (
              <p>Tu pedido está listo. Selecciona cómo deseas realizar el pago.</p>
            )}

            <div className="detalle-pedido__metodos-pago">
              <button type="button" onClick={pagarConTarjeta} disabled={procesandoPago}>
                <span className="material-symbols-outlined">credit_card</span>
                <div>
                  <strong>Pagar con tarjeta</strong>
                  <small>Pago seguro mediante Stripe</small>
                </div>
              </button>

              <button type="button" onClick={() => seleccionarPagoManual("efectivo")} disabled={procesandoPago}>
                <span className="material-symbols-outlined">payments</span>
                <div>
                  <strong>Efectivo</strong>
                  <small>Pendiente hasta que el administrador reciba el pago</small>
                </div>
              </button>

              <button type="button" onClick={() => seleccionarPagoManual("transferencia")} disabled={procesandoPago}>
                <span className="material-symbols-outlined">account_balance</span>
                <div>
                  <strong>Transferencia</strong>
                  <small>Requiere validación del administrador</small>
                </div>
              </button>
            </div>

            {procesandoPago && <p className="detalle-pedido__procesando">Procesando solicitud...</p>}
          </section>
        )}

        {pagoCompletado && (
          <section className="detalle-pedido__tarjeta">
            <h2>Pago confirmado</h2>

            <div className="detalle-pedido__pago-confirmado">
              <span className="material-symbols-outlined">check_circle</span>

              <div>
                <strong>Pago completado</strong>
                <p>Método: {formatearEstado(pagoCompletado.metodo)}</p>
                <p>Monto: {formatearMoneda(pagoCompletado.monto)}</p>
              </div>
            </div>
          </section>
        )}

        <section className="detalle-pedido__tarjeta">
          <h2>Historial del pedido</h2>

          {!pedido.historialEstados?.length ? (
            <p>No hay cambios de estado registrados.</p>
          ) : (
            <div className="detalle-pedido__historial">
              {pedido.historialEstados.slice().reverse().map((historial, index) => (
                <div className="detalle-pedido__historial-item" key={index}>
                  <div className="detalle-pedido__historial-punto" />

                  <div>
                    <strong>{formatearEstado(historial.estado)}</strong>
                    <span>{formatearFecha(historial.fecha)}</span>
                    {historial.comentario && <p>{historial.comentario}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default DetallePedido;