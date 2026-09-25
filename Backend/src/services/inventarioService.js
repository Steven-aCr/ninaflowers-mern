import mongoose from "mongoose";
import inventarioModel from "../models/inventarioModel.js";
import productoModel from "../models/productoModel.js";
import movInventarioModel from "../models/movInventarioModel.js";
import { crearMovimiento } from "./movInventarioService.js";

export const crearInventario = async (datosInventario) => {
  const { productoId, stock = 0, stockMinimo, usuarioId, proveedorId } = datosInventario;

  const yaExiste = await inventarioModel.findOne({ productoId });

  if (yaExiste) {
    throw new Error("Ya existe un registro de inventario para este producto.");
  }

  const nuevoInventario = new inventarioModel({ productoId, stock: 0, stockMinimo });
  await nuevoInventario.save();

  // Los productos simples pueden recibir stock inicial mediante una entrada
  // por compra. Los compuestos NO reciben stock directo: solo por producción.
  if (stock > 0) {
    const producto = await productoModel.findById(productoId);

    if (!producto) {
      throw new Error("Producto no encontrado.");
    }

    if (producto.tipoProducto === "compuesto") {
      throw new Error("El stock de un producto compuesto debe generarse mediante producción.");
    }

    await crearMovimiento({
      productoId,
      usuarioId,
      proveedorId,
      tipo: "entrada",
      motivo: "compra",
      cantidad: Number(stock)
    });
  }

  return await inventarioModel
    .findById(nuevoInventario._id)
    .populate("productoId", "nombre sku tipoProducto");
};

export const listarInventario = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
  const desde = (pagina - 1) * limite;
  const filtros = {};

  if (parametrosQuery.productoId) {
    filtros.productoId = parametrosQuery.productoId;
  }

  if (parametrosQuery.bajoMinimo === "true") {
    filtros.$expr = { $lte: ["$stock", "$stockMinimo"] };
  }

  // Filtro por tipo de producto (simple | compuesto): se resuelve primero
  // contra el catálogo de productos y luego se cruza con el inventario.
  if (parametrosQuery.tipoProducto === "simple" || parametrosQuery.tipoProducto === "compuesto") {
    const productosPorTipo = await productoModel
      .find({ tipoProducto: parametrosQuery.tipoProducto })
      .select("_id");

    const idsProductos = productosPorTipo.map((producto) => producto._id);

    if (parametrosQuery.productoId) {
      const perteneceAlTipo = idsProductos.some(
        (id) => id.toString() === parametrosQuery.productoId.toString()
      );

      if (!perteneceAlTipo) {
        return { totalDoc: 0, pagActual: Number(pagina), totalPag: 0, datos: [] };
      }
    } else {
      filtros.productoId = { $in: idsProductos };
    }
  }

  const [total, inventarios] = await Promise.all([
    inventarioModel.countDocuments(filtros),
    inventarioModel
      .find(filtros)
      .populate("productoId", "nombre sku tipoProducto")
      .skip(desde)
      .limit(limite)
      .sort({ ultimaActualizacion: -1 })
  ]);

  return {
    totalDoc: total,
    pagActual: Number(pagina),
    totalPag: Math.ceil(total / limite),
    datos: inventarios
  };
};

export const buscarInventarioId = async (id) => {
  return await inventarioModel
    .findById(id)
    .populate("productoId", "nombre sku tipoProducto");
};

export const modificarInventario = async (id, datosActualizados) => {
  return await inventarioModel
    .findByIdAndUpdate(
      id,
      { stockMinimo: datosActualizados.stockMinimo, ultimaActualizacion: new Date() },
      { new: true, runValidators: true }
    )
    .populate("productoId", "nombre sku tipoProducto");
};

export const producirProductoCompuesto = async (productoId, cantidad, usuarioId) => {
  const cantidadProduccion = Number(cantidad);

  if (!Number.isInteger(cantidadProduccion) || cantidadProduccion <= 0) {
    throw new Error("La cantidad a producir debe ser un entero mayor que 0.");
  }

  return await mongoose.connection.transaction(async (session) => {
    const producto = await productoModel.findById(productoId).session(session);

    if (!producto) {
      throw new Error("Producto no encontrado.");
    }

    if (producto.tipoProducto !== "compuesto") {
      throw new Error("Solo se pueden producir productos compuestos.");
    }

    if (!producto.componentes || producto.componentes.length === 0) {
      throw new Error("El producto compuesto no tiene componentes registrados.");
    }

    const inventarioProducto = await inventarioModel
      .findOne({ productoId: producto._id })
      .session(session);

    if (!inventarioProducto) {
      throw new Error(`El producto ${producto.nombre} no tiene inventario registrado.`);
    }

    // Primero se valida que haya stock suficiente de TODOS los componentes
    // antes de descontar nada, para no dejar el inventario a medio procesar.
    const componentesProcesados = [];

    for (const componente of producto.componentes) {
      const inventarioComponente = await inventarioModel
        .findOne({ productoId: componente.productoId })
        .session(session);

      if (!inventarioComponente) {
        const productoComponente = await productoModel.findById(componente.productoId).session(session);
        throw new Error(`${productoComponente?.nombre || "Uno de los componentes"} de ${producto.nombre} no tiene inventario registrado.`);
      }

      const cantidadNecesaria = Number(componente.cantidad) * cantidadProduccion;

      if (inventarioComponente.stock < cantidadNecesaria) {
        const productoComponente = await productoModel.findById(componente.productoId).session(session);
        throw new Error(
          `Stock insuficiente de ${productoComponente?.nombre || "componente"}. ` +
          `Disponible: ${inventarioComponente.stock}. Necesario: ${cantidadNecesaria}.`
        );
      }

      componentesProcesados.push({ componente, inventario: inventarioComponente, cantidadNecesaria });
    }

    const movimientos = [];

    for (const item of componentesProcesados) {
      item.inventario.stock -= item.cantidadNecesaria;
      item.inventario.ultimaActualizacion = new Date();
      await item.inventario.save({ session });

      const [movimiento] = await movInventarioModel.create(
        [{
          productoId: item.componente.productoId,
          usuarioId,
          tipo: "salida",
          motivo: "produccion",
          cantidad: item.cantidadNecesaria,
          stockResultante: item.inventario.stock
        }],
        { session }
      );

      movimientos.push(movimiento);
    }

    inventarioProducto.stock += cantidadProduccion;
    inventarioProducto.ultimaActualizacion = new Date();
    await inventarioProducto.save({ session });

    const [movimientoEntrada] = await movInventarioModel.create(
      [{
        productoId: producto._id,
        usuarioId,
        tipo: "entrada",
        motivo: "produccion",
        cantidad: cantidadProduccion,
        stockResultante: inventarioProducto.stock
      }],
      { session }
    );

    movimientos.push(movimientoEntrada);

    return {
      mensaje: "Producto compuesto producido correctamente.",
      producto: { _id: producto._id, sku: producto.sku, nombre: producto.nombre },
      cantidadProducida: cantidadProduccion,
      stockResultante: inventarioProducto.stock,
      movimientos
    };
  });
};