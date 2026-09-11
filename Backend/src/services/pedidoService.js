import pedidoModel from "../models/pedidoModel.js";

export const crearPedido = async (datosPedido) => {
    const nuevoPedido = new pedidoModel(datosPedido);
    return await nuevoPedido.save();
};

export const listarPedido = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.usuarioId) {
        filtros.usuarioId = parametrosQuery.usuarioId;
    }
    if (parametrosQuery.productoId) {
        filtros['productos.productoId'] = parametrosQuery.productoId;
    }
    if (parametrosQuery.ciudad) {
        filtros['direccionEntrega.linea1'] = { $regex: parametrosQuery.linea1, $options: 'i' };
    }
    if (parametrosQuery.estadoPedido) {
        filtros.estadoPedido = parametrosQuery.estadoPedido;
    }

    const [total, pedidos] = await Promise.all([
        pedidoModel.countDocuments(filtros),
        pedidoModel.find(filtros)
            .populate('usuarioId', 'nombre apellido correo')
            .skip(desde)
            .limit(limite)
            .sort({ createdAt: -1 })
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: pedidos
    };
};

export const buscarPedidoId = async (id) => {
    return await pedidoModel.findById(id).populate('usuarioId', 'nombre apellido correo');
};

export const modificarPedido = async (id, datosActualizados) => {
    return await pedidoModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
};

export const cancelarPedido = async (id, usuarioId, comentario = '') => {
    return await pedidoModel.findByIdAndUpdate(
        id,
        {
            estadoPedido: 'cancelado',
            $push: {
                historialEstados: { estado: 'cancelado', fecha: new Date(), usuarioId, comentario }
            }
        },
        { new: true, runValidators: true }
    );
};