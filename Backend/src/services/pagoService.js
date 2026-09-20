import pagoModel from "../models/pagoModel.js";
import pedidoModel from "../models/pedidoModel.js";

const ZONA_HORARIA = "America/El_Salvador"; // UTC-6, sin horario de verano

// Convierte "2026-09-01" y "2026-09-30" en un rango que incluye los días completos.
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

    const rango = construirRangoFechas(parametrosQuery.fechaDesde, parametrosQuery.fechaHasta);
    if (rango) {
        filtros.createdAt = rango;
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

export const reportePagos = async (parametrosQuery = {}) => {
    const filtros = {};
    const rango = construirRangoFechas(parametrosQuery.fechaDesde, parametrosQuery.fechaHasta);
    if (rango) {
        filtros.createdAt = rango;
    }

    // $facet ejecuta varios agrupamientos sobre los mismos datos en una sola consulta.
    const [resultado] = await pagoModel.aggregate([
        { $match: filtros },
        {
            $facet: {
                porEstado: [
                    { $group: { _id: "$estado", cantidad: { $sum: 1 }, monto: { $sum: "$monto" } } }
                ],
                // Dinero real: solo cuentan los pagos completados.
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