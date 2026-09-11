import pagoModel from "../models/pagoModel.js";
import pedidoModel from "../models/pedidoModel.js";

export const crearPago = async (datosPago) => {
    const { pedidoId, usuarioId, metodo, referenciaTransaccion } = datosPago;

    const pedido = await pedidoModel.findById(pedidoId);
    if (!pedido) {
        throw new Error("El pedido especificado no existe.");
    }

    const pagoCompletadoExistente = await pagoModel.findOne({ pedidoId, estado: "completado" });
    if (pagoCompletadoExistente) {
        throw new Error("Este pedido ya tiene un pago completado. No se puede registrar otro.");
    }

    const nuevoPago = new pagoModel({
        pedidoId,
        usuarioId,
        monto: pedido.total, // se toma la informacion del pedido
        metodo,
        referenciaTransaccion
    });

    return await nuevoPago.save();
};

export const listarPagos = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.pedidoId) {
        filtros.pedidoId = parametrosQuery.pedidoId;
    }
    if (parametrosQuery.usuarioId) {
        filtros.usuarioId = parametrosQuery.usuarioId;
    }
    if (parametrosQuery.metodo) {
        filtros.metodo = parametrosQuery.metodo;
    }
    if (parametrosQuery.estado) {
        filtros.estado = parametrosQuery.estado;
    }

    const [total, pagos] = await Promise.all([
        pagoModel.countDocuments(filtros),
        pagoModel.find(filtros)
            .populate('pedidoId', 'estadoPedido total')
            .populate('usuarioId', 'nombre apellido correo')
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
    return await pagoModel.findById(id)
        .populate('pedidoId', 'estadoPedido total')
        .populate('usuarioId', 'nombre apellido correo');
};

export const buscarPagoPorPedido = async (pedidoId) => {
    return await pagoModel.find({ pedidoId }).sort({ createdAt: -1 });
};

export const actualizarEstadoPago = async (id, nuevoEstado, referenciaTransaccion) => {
    const datosActualizados = { estado: nuevoEstado };
    if (referenciaTransaccion) {
        datosActualizados.referenciaTransaccion = referenciaTransaccion;
    }
    return await pagoModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
};