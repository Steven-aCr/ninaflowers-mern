import envioModel from "../models/envioModel.js";

const TARIFAS_ENVIO = {
    retiro_tienda: 0,
    zona_cubierta: 2.00
    //fuera_zona no tiene tarifa fija: se envia al Cliente a cotizar el costo de envio con un Admin
};

export const crearEnvio = async (datosEnvio, session) => {
    const { tipo, costoEnvio, ...resto } = datosEnvio;
    let costoFinal;

    if (tipo === "fuera_zona") {
        if (costoEnvio === undefined || costoEnvio === null || costoEnvio < 0) {
            throw new Error("Para envíos fuera de zona, el costoEnvio debe ingresarse manualmente y no puede ser negativo.");
        }
        costoFinal = costoEnvio;
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

    if (parametrosQuery.tipo) {
        filtros.tipo = parametrosQuery.tipo;
    }
    if (parametrosQuery.pedidoId) {
        filtros.pedidoId = parametrosQuery.pedidoId;
    }

    const [total, envios] = await Promise.all([
        envioModel.countDocuments(filtros),
        envioModel.find(filtros)
            .populate('pedidoId', 'estadoPedido total')
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
    return await envioModel.findById(id).populate('pedidoId', 'estadoPedido total');
};

export const buscarEnvioPorPedido = async (pedidoId) => {
    return await envioModel.findOne({ pedidoId });
};

export const modificarEnvio = async (id, datosActualizados) => {
    return await envioModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
};

export const eliminarEnvio = async (id) => {
    return await envioModel.findByIdAndDelete(id);
};