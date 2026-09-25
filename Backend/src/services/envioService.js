import envioModel from "../models/envioModel.js";
import pedidoModel from "../models/pedidoModel.js";

const TARIFAS_ENVIO = {
  retiro_tienda: 0,
  zona_cubierta: 2.00
};

const redondear = (numero) => Math.round(numero * 100) / 100;

export const crearEnvio = async (datosEnvio, session) => {
  const { tipo, costoEnvio, ...resto } = datosEnvio;

  let costoFinal;

  if (tipo === "fuera_zona") {
    if (costoEnvio === undefined || costoEnvio === null || costoEnvio < 0) {
      throw new Error("El costo de envío debe ser válido.");
    }
    costoFinal = Number(costoEnvio);
  } else {
    if (TARIFAS_ENVIO[tipo] === undefined) {
      throw new Error(`Tipo de envío inválido: ${tipo}`);
    }
    costoFinal = TARIFAS_ENVIO[tipo];
  }

  const nuevoEnvio = new envioModel({ ...resto, tipo, costoEnvio: costoFinal });
  return await nuevoEnvio.save({ session });
};

export const listarEnvios = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
  const desde = (pagina - 1) * limite;
  const filtros = {};

  if (parametrosQuery.tipo) filtros.tipo = parametrosQuery.tipo;
  if (parametrosQuery.pedidoId) filtros.pedidoId = parametrosQuery.pedidoId;

  const [total, envios] = await Promise.all([
    envioModel.countDocuments(filtros),
    envioModel
      .find(filtros)
      .populate("pedidoId", "estadoPedido total subtotal")
      .skip(desde)
      .limit(limite)
      .sort({ createdAt: -1 })
  ]);

  return {
    totalDoc: total,
    pagActual: Number(pagina),
    totalPag: Math.ceil(total / limite),
    datos: envios
  };
};

export const buscarEnvioId = async (id) => {
  return await envioModel
    .findById(id)
    .populate("pedidoId", "estadoPedido total subtotal");
};

export const buscarEnvioPorPedido = async (pedidoId) => {
  return await envioModel.findOne({ pedidoId });
};

export const modificarEnvio = async (id, datosActualizados) => {
  const actual = await envioModel.findById(id);
  if (!actual) return null;

  const tipo = datosActualizados.tipo ?? actual.tipo;
  let costoEnvio;

  if (tipo === "fuera_zona") {
    costoEnvio = Number(datosActualizados.costoEnvio ?? actual.costoEnvio);

    if (Number.isNaN(costoEnvio) || costoEnvio < 0) {
      throw new Error("El costo de envío debe ser válido.");
    }
  } else {
    costoEnvio = TARIFAS_ENVIO[tipo];

    if (costoEnvio === undefined) {
      throw new Error(`Tipo de envío inválido: ${tipo}`);
    }
  }

  actual.tipo = tipo;
  actual.costoEnvio = costoEnvio;
  await actual.save();

  // Recalcular el total del pedido con el nuevo costo de envío.
  const pedido = await pedidoModel.findById(actual.pedidoId);

  if (pedido) {
    pedido.total = redondear(
      pedido.subtotal - (pedido.descuento || 0) + (pedido.impuesto || 0) + costoEnvio
    );

    // Si estaba esperando cotización, ya puede pasar a pago.
    if (pedido.estadoPedido === "pendiente_cotizacion") {
      pedido.estadoPedido = "pendiente";

      // Se usa el usuario original del pedido porque HistorialEstado exige usuarioId.
      pedido.historialEstados.push({
        estado: "pendiente",
        fecha: new Date(),
        usuarioId: pedido.usuarioId,
        comentario: `Envío cotizado. Costo: $${costoEnvio.toFixed(2)}. Pedido listo para pago.`
      });
    }

    await pedido.save();
  }

  return await buscarEnvioId(actual._id);
};

export const eliminarEnvio = async (id) => {
  return await envioModel.findByIdAndDelete(id);
};