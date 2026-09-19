import movInventarioModel from "../models/movInventarioModel.js";
import inventarioModel from "../models/inventarioModel.js";

export const crearMovimiento = async (datosMovimiento) => {
    const { productoId, tipo, cantidad } = datosMovimiento;

    const inventario = await inventarioModel.findOne({ productoId });
    if (!inventario) {
        throw new Error("Este producto no tiene inventario registrado. Crea primero su registro de inventario.");
    }

    let nuevoStock;
    if (tipo === "entrada") {
        nuevoStock = inventario.stock + cantidad;
    } else if (tipo === "salida") {
        if (inventario.stock < cantidad) {
            throw new Error(`Stock insuficiente. Stock actual: ${inventario.stock}, cantidad solicitada: ${cantidad}.`);
        }
        nuevoStock = inventario.stock - cantidad;
    } else {
        throw new Error("Tipo de movimiento inválido.");
    }
    
    // Se calcula aquí, nunca se recibe del cliente.
    const nuevoMovimiento = new movInventarioModel({
        ...datosMovimiento,
        stockResultante: nuevoStock
    });
    const movimientoGuardado = await nuevoMovimiento.save();
   
    // Se refleja el cambio en el inventario real.
    inventario.stock = nuevoStock;
    inventario.ultimaActualizacion = new Date();
    await inventario.save();

    return await movInventarioModel.findById(movimientoGuardado._id)
        .populate('productoId', 'nombre sku')
        .populate('usuarioId', 'nombre apellido')
        .populate('proveedorId', 'nombre');
};

export const listarMovimientos = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.productoId) {
        filtros.productoId = parametrosQuery.productoId;
    }
    if (parametrosQuery.tipo) {
        filtros.tipo = parametrosQuery.tipo;
    }
    if (parametrosQuery.motivo) {
        filtros.motivo = parametrosQuery.motivo;
    }
    if (parametrosQuery.proveedorId) {
        filtros.proveedorId = parametrosQuery.proveedorId;
    }
    if (parametrosQuery.pedidoId) {
        filtros.pedidoId = parametrosQuery.pedidoId;
    }
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
        movInventarioModel.find(filtros)
            .populate('productoId', 'nombre sku')
            .populate('usuarioId', 'nombre apellido')
            .populate('proveedorId', 'nombre')
            .skip(desde).limit(limite).sort({ fecha: -1 })
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: movimientos
    };
};

export const buscarMovimientoId = async (id) => {
    return await movInventarioModel.findById(id)
        .populate('productoId', 'nombre sku')
        .populate('usuarioId', 'nombre apellido')
        .populate('proveedorId', 'nombre');
};