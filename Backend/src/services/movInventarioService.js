import mongoose from "mongoose";
import movInventarioModel from "../models/movInventarioModel.js";
import inventarioModel from "../models/inventarioModel.js";
import pedidoModel from "../models/pedidoModel.js";

export const crearMovimiento = async (datosMovimiento) => {
  const { productoId, tipo, cantidad } = datosMovimiento;

  const inventario = await inventarioModel.findOne({ productoId });

  if (!inventario) {
    throw new Error("Este producto no tiene inventario registrado.");
  }

  let nuevoStock;

  if (tipo === "entrada") {
    nuevoStock = inventario.stock + Number(cantidad);
  } else if (tipo === "salida") {
    if (inventario.stock < Number(cantidad)) {
      throw new Error(`Stock insuficiente. Stock actual: ${inventario.stock}.`);
    }
    nuevoStock = inventario.stock - Number(cantidad);
  } else {
    throw new Error("Tipo de movimiento inválido.");
  }

  const movimiento = new movInventarioModel({
    ...datosMovimiento,
    cantidad: Number(cantidad),
    stockResultante: nuevoStock
  });

  const guardado = await movimiento.save();

  inventario.stock = nuevoStock;
  inventario.ultimaActualizacion = new Date();
  await inventario.save();

  return await movInventarioModel
    .findById(guardado._id)
    .populate("productoId", "nombre sku")
    .populate("usuarioId", "nombre apellido")
    .populate("proveedorId", "nombre")
    .populate("pedidoId", "estadoPedido total");
};

export const procesarInventarioVenta = async (pedidoId, usuarioId) => {
  return await mongoose.connection.transaction(async (session) => {
    const pedido = await pedidoModel.findById(pedidoId).session(session);

    if (!pedido) {
      throw new Error("Pedido no encontrado.");
    }

    // Protección contra doble descuento (Stripe puede reintentar el webhook).
    if (pedido.inventarioProcesado) {
      return { procesado: false, mensaje: "El inventario de este pedido ya fue procesado." };
    }

    if (!pedido.productos?.length) {
      throw new Error("El pedido no contiene productos.");
    }

    // Primero se valida el stock de todos los productos antes de descontar.
    for (const item of pedido.productos) {
      const inventario = await inventarioModel.findOne({ productoId: item.productoId }).session(session);

      if (!inventario) {
        throw new Error(`No existe inventario para ${item.nombreProducto}.`);
      }

      if (inventario.stock < item.cantidad) {
        throw new Error(
          `Stock insuficiente para ${item.nombreProducto}. ` +
          `Disponible: ${inventario.stock}. Solicitado: ${item.cantidad}.`
        );
      }
    }

    const movimientos = [];

    for (const item of pedido.productos) {
      const inventario = await inventarioModel.findOne({ productoId: item.productoId }).session(session);

      inventario.stock -= item.cantidad;
      inventario.ultimaActualizacion = new Date();
      await inventario.save({ session });

      const [movimiento] = await movInventarioModel.create(
        [{
          productoId: item.productoId,
          usuarioId,
          pedidoId: pedido._id,
          tipo: "salida",
          motivo: "venta",
          cantidad: item.cantidad,
          stockResultante: inventario.stock
        }],
        { session }
      );

      movimientos.push(movimiento);
    }

    // Solo se marca como procesado después de crear todos los movimientos.
    pedido.inventarioProcesado = true;
    pedido.fechaInventarioProcesado = new Date();
    await pedido.save({ session });

    return { procesado: true, movimientos };
  });
};

export const listarMovimientos = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
  const desde = (pagina - 1) * limite;
  const filtros = {};

  if (parametrosQuery.productoId) filtros.productoId = parametrosQuery.productoId;
  if (parametrosQuery.tipo) filtros.tipo = parametrosQuery.tipo;
  if (parametrosQuery.motivo) filtros.motivo = parametrosQuery.motivo;
  if (parametrosQuery.proveedorId) filtros.proveedorId = parametrosQuery.proveedorId;
  if (parametrosQuery.pedidoId) filtros.pedidoId = parametrosQuery.pedidoId;

  if (parametrosQuery.fechaInicio || parametrosQuery.fechaFin) {
    filtros.fecha = {};

    if (parametrosQuery.fechaInicio) {
      filtros.fecha.$gte = new Date(parametrosQuery.fechaInicio);
    }

    if (parametrosQuery.fechaFin) {
      const fin = new Date(parametrosQuery.fechaFin);
      fin.setHours(23, 59, 59, 999);
      filtros.fecha.$lte = fin;
    }
  }

  const [total, movimientos] = await Promise.all([
    movInventarioModel.countDocuments(filtros),
    movInventarioModel
      .find(filtros)
      .populate("productoId", "nombre sku")
      .populate("usuarioId", "nombre apellido")
      .populate("proveedorId", "nombre")
      .populate("pedidoId", "estadoPedido total")
      .skip(desde)
      .limit(limite)
      .sort({ fecha: -1 })
  ]);

  return {
    totalDoc: total,
    pagActual: Number(pagina),
    totalPag: Math.ceil(total / limite),
    datos: movimientos
  };
};

export const buscarMovimientoId = async (id) => {
  return await movInventarioModel
    .findById(id)
    .populate("productoId", "nombre sku")
    .populate("usuarioId", "nombre apellido")
    .populate("proveedorId", "nombre")
    .populate("pedidoId", "estadoPedido total");
};