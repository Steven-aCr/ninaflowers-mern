import pagoModel from "../models/pagoModel.js";
import pedidoModel from "../models/pedidoModel.js";
import stripe from "../config/stripe.js";
import { procesarInventarioVenta } from "./movInventarioService.js";

const ZONA_HORARIA = "America/El_Salvador";

const construirRangoFechas = (fechaDesde, fechaHasta) => {
  const rango = {};

  if (fechaDesde) rango.$gte = new Date(`${fechaDesde}T00:00:00-06:00`);
  if (fechaHasta) rango.$lte = new Date(`${fechaHasta}T23:59:59.999-06:00`);

  if ((rango.$gte && isNaN(rango.$gte)) || (rango.$lte && isNaN(rango.$lte))) {
    throw new Error("Formato de fecha inválido. Usa AAAA-MM-DD.");
  }

  return Object.keys(rango).length ? rango : null;
};

export const crearPago = async (datosPago) => {
  const { pedidoId, metodo, referenciaTransaccion } = datosPago;

  const pedido = await pedidoModel.findById(pedidoId);

  if (!pedido) {
    throw new Error("El pedido especificado no existe.");
  }

  if (pedido.estadoPedido === "cancelado") {
    throw new Error("No se puede pagar un pedido cancelado.");
  }

  if (pedido.estadoPedido === "pendiente_cotizacion") {
    throw new Error("El costo de envío todavía está pendiente de cotización.");
  }

  const metodosValidos = ["tarjeta", "efectivo", "transferencia"];

  if (!metodosValidos.includes(metodo)) {
    throw new Error("Método de pago inválido.");
  }

  const completado = await pagoModel.findOne({ pedidoId, estado: "completado" });

  if (completado) {
    throw new Error("Este pedido ya fue pagado.");
  }

  // Si ya existe un pago pendiente con el mismo método, se reutiliza
  // en lugar de generar duplicados.
  const existente = await pagoModel.findOne({ pedidoId, metodo, estado: "pendiente" });

  if (existente) {
    existente.monto = pedido.total;

    if (referenciaTransaccion) {
      existente.referenciaTransaccion = referenciaTransaccion;
    }

    return await existente.save();
  }

  return await pagoModel.create({
    pedidoId: pedido._id,
    usuarioId: pedido.usuarioId,
    monto: pedido.total,
    metodo,
    referenciaTransaccion,
    estado: "pendiente"
  });
};

export const crearPagoCliente = async (pedidoId, metodo, usuario) => {
  const pedido = await pedidoModel.findById(pedidoId);

  if (!pedido) {
    throw new Error("Pedido no encontrado.");
  }

  if (pedido.usuarioId.toString() !== usuario.id.toString()) {
    throw new Error("Este pedido no te pertenece.");
  }

  return await crearPago({ pedidoId, metodo });
};

export const listarPagos = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
  const desde = (pagina - 1) * limite;
  const filtros = {};

  if (parametrosQuery.pedidoId) filtros.pedidoId = parametrosQuery.pedidoId;
  if (parametrosQuery.usuarioId) filtros.usuarioId = parametrosQuery.usuarioId;
  if (parametrosQuery.metodo) filtros.metodo = parametrosQuery.metodo;
  if (parametrosQuery.estado) filtros.estado = parametrosQuery.estado;

  const rango = construirRangoFechas(parametrosQuery.fechaDesde, parametrosQuery.fechaHasta);
  if (rango) filtros.createdAt = rango;

  const [total, pagos] = await Promise.all([
    pagoModel.countDocuments(filtros),
    pagoModel
      .find(filtros)
      .populate("pedidoId", "estadoPedido total")
      .populate("usuarioId", "nombre apellido correo")
      .skip(desde)
      .limit(limite)
      .sort({ createdAt: -1 })
  ]);

  return {
    totalDoc: total,
    pagActual: Number(pagina),
    totalPag: Math.ceil(total / limite),
    datos: pagos
  };
};

export const buscarPagoId = async (id) => {
  return await pagoModel
    .findById(id)
    .populate("pedidoId", "estadoPedido total")
    .populate("usuarioId", "nombre apellido correo");
};

export const buscarPagoPorPedido = async (pedidoId) => {
  return await pagoModel.find({ pedidoId }).sort({ createdAt: -1 });
};

export const buscarPagoPedidoCliente = async (pedidoId, usuario) => {
  const pedido = await pedidoModel.findById(pedidoId);

  if (!pedido) {
    throw new Error("Pedido no encontrado.");
  }

  if (pedido.usuarioId.toString() !== usuario.id.toString() && usuario.rol !== "administrador") {
    throw new Error("Este pedido no te pertenece.");
  }

  return await buscarPagoPorPedido(pedidoId);
};

// Único punto para completar una venta. Lo utilizan Stripe, la
// confirmación de efectivo y la confirmación de transferencia.
export const confirmarVenta = async (pagoId, referenciaTransaccion = null) => {
  const pago = await pagoModel.findById(pagoId);

  if (!pago) {
    throw new Error("Pago no encontrado.");
  }

  if (pago.estado === "reembolsado") {
    throw new Error("Un pago reembolsado no puede volver a completarse.");
  }

  if (pago.estado === "fallido") {
    throw new Error("Un pago fallido no puede confirmarse.");
  }

  // Stripe puede notificar varias veces; procesarInventarioVenta está
  // protegido mediante la bandera inventarioProcesado del pedido.
  if (pago.estado !== "completado") {
    pago.estado = "completado";

    if (referenciaTransaccion) {
      pago.referenciaTransaccion = referenciaTransaccion;
    }

    await pago.save();
  }

  // Aquí ocurre la venta física: baja el stock y crea el movimiento
  // de inventario correspondiente (tipo salida, motivo venta).
  await procesarInventarioVenta(pago.pedidoId, pago.usuarioId);

  const pedido = await pedidoModel.findById(pago.pedidoId);

  if (pedido && pedido.estadoPedido === "pendiente") {
    pedido.estadoPedido = "confirmado";

    pedido.historialEstados.push({
      estado: "confirmado",
      fecha: new Date(),
      usuarioId: pago.usuarioId,
      comentario:
        pago.metodo === "tarjeta"
          ? "Pago con tarjeta confirmado."
          : pago.metodo === "efectivo"
            ? "Pago en efectivo recibido y confirmado."
            : "Transferencia recibida y confirmada."
    });

    await pedido.save();
  }

  return await buscarPagoId(pago._id);
};

// Uso del administrador: solo efectivo y transferencia pueden
// confirmarse manualmente.
export const confirmarPagoManual = async (pagoId, referenciaTransaccion = null) => {
  const pago = await pagoModel.findById(pagoId);

  if (!pago) {
    throw new Error("Pago no encontrado.");
  }

  if (pago.estado !== "pendiente") {
    throw new Error("Solo se pueden confirmar pagos pendientes.");
  }

  if (pago.metodo === "tarjeta") {
    throw new Error("Los pagos con tarjeta solamente pueden ser confirmados por Stripe.");
  }

  if (pago.metodo !== "efectivo" && pago.metodo !== "transferencia") {
    throw new Error("Este método de pago no admite confirmación manual.");
  }

  return await confirmarVenta(pagoId, referenciaTransaccion);
};

// Uso del administrador: reembolso. En tarjeta se solicita realmente
// a Stripe; en efectivo/transferencia se registra el reembolso
// administrativo. Importante: reembolsar dinero NO devuelve
// automáticamente productos al inventario.
export const reembolsarPago = async (pagoId) => {
  const pago = await pagoModel.findById(pagoId);

  if (!pago) {
    throw new Error("Pago no encontrado.");
  }

  if (pago.estado !== "completado") {
    throw new Error("Solo se pueden reembolsar pagos completados.");
  }

  if (pago.metodo === "tarjeta") {
    if (!pago.referenciaTransaccion) {
      throw new Error("El pago no tiene referencia de Stripe.");
    }

    // Después de confirmar el pago se guarda el payment_intent como referencia.
    if (!pago.referenciaTransaccion.startsWith("pi_")) {
      throw new Error("No se encontró un PaymentIntent válido para realizar el reembolso.");
    }

    const refund = await stripe.refunds.create({ payment_intent: pago.referenciaTransaccion });

    if (refund.status !== "succeeded" && refund.status !== "pending") {
      throw new Error("Stripe no pudo procesar el reembolso.");
    }
  }

  pago.estado = "reembolsado";
  await pago.save();

  return await buscarPagoId(pago._id);
};

export const reportePagos = async (parametrosQuery = {}) => {
  const filtros = {};

  const rango = construirRangoFechas(parametrosQuery.fechaDesde, parametrosQuery.fechaHasta);
  if (rango) filtros.createdAt = rango;

  const [resultado] = await pagoModel.aggregate([
    { $match: filtros },
    {
      $facet: {
        porEstado: [
          { $group: { _id: "$estado", cantidad: { $sum: 1 }, monto: { $sum: "$monto" } } }
        ],
        porMetodo: [
          { $match: { estado: "completado" } },
          { $group: { _id: "$metodo", cantidad: { $sum: 1 }, monto: { $sum: "$monto" } } }
        ],
        porDia: [
          { $match: { estado: "completado" } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: ZONA_HORARIA } },
              cantidad: { $sum: 1 },
              monto: { $sum: "$monto" }
            }
          },
          { $sort: { _id: 1 } }
        ]
      }
    }
  ]);

  const redondear = (n) => Math.round(n * 100) / 100;

  const formatear = (lista, campo) =>
    lista.map(({ _id, cantidad, monto }) => ({ [campo]: _id, cantidad, monto: redondear(monto) }));

  const completados = resultado.porEstado.find((e) => e._id === "completado");
  const totalRecaudado = completados ? completados.monto : 0;
  const pagosCompletados = completados ? completados.cantidad : 0;

  return {
    totalRecaudado: redondear(totalRecaudado),
    pagosCompletados,
    ticketPromedio: pagosCompletados ? redondear(totalRecaudado / pagosCompletados) : 0,
    porEstado: formatear(resultado.porEstado, "estado"),
    porMetodo: formatear(resultado.porMetodo, "metodo"),
    porDia: formatear(resultado.porDia, "dia")
  };
};