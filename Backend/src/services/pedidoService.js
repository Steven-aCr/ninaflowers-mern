import pedidoModel from "../models/pedidoModel.js";
import mongoose from "mongoose";
import carritoModel from "../models/carritoModel.js";
import productoModel from "../models/productoModel.js";
import usuarioModel from "../models/usuarioModel.js";
import { crearEnvio } from "./envioService.js";
import { vaciarCarrito } from "./carritoService.js";

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

export const actualizarEstadoPedido = async (id, estado, usuarioId, comentario = "") => {
    const estadosValidos = ["pendiente", "pendiente_cotizacion", "confirmado", "en_preparacion", "listo_entrega", "entregado", "cancelado"];
    if (!estadosValidos.includes(estado)) throw new Error("Estado de pedido inválido.");
    return await pedidoModel.findByIdAndUpdate(
        id,
        {
            estadoPedido: estado,
            $push: { historialEstados: { estado, fecha: new Date(), usuarioId, comentario } }
        },
        { new: true, runValidators: true }
    ).populate('usuarioId', 'nombre apellido correo');
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

const redondear = (n) => Math.round(n * 100) / 100;

// Convierte el carrito en pedido. Precios y totales los calcula el servidor, nunca el cliente.
// actor = req.usuario (viene del token). datos = { tipoEnvio, direccionEntrega, fechaEntregaEstimada, usuarioId? }
export const crearPedidoDesdeCarrito = async (actor, datos) => {
    const { tipoEnvio, direccionEntrega, fechaEntregaEstimada } = datos;

    // Cliente: siempre para sí mismo (se ignora cualquier usuarioId del body).
    // Administrador: para el cliente que indique.
    const esAdmin = actor.rol === "administrador";
    const clienteId = esAdmin ? datos.usuarioId : actor.id;
    if (!clienteId) {
        throw new Error("Debes indicar el usuarioId del cliente.");
    }

    const fechaEntrega = new Date(fechaEntregaEstimada);
    if (isNaN(fechaEntrega) || fechaEntrega <= new Date()) {
        throw new Error("La fecha de entrega estimada debe ser una fecha futura válida.");
    }

    // Transacción: o se guarda todo (envío + pedido + carrito vacío) o no se guarda nada.
    return await mongoose.connection.transaction(async (session) => {
        const cliente = await usuarioModel.findById(clienteId).session(session);
        if (!cliente || !cliente.activo) {
            throw new Error("El cliente no existe o está inactivo.");
        }

        const carrito = await carritoModel.findOne({ usuarioId: clienteId }).session(session);
        if (!carrito || carrito.items.length === 0) {
            throw new Error("El carrito está vacío.");
        }

        // Precios actuales desde Producto (fuente de verdad), no desde el carrito.
        const ids = carrito.items.map((item) => item.productoId);
        const productos = await productoModel.find({ _id: { $in: ids } }).session(session);
        const catalogo = new Map(productos.map((p) => [p._id.toString(), p]));

        const items = carrito.items.map((item) => {
            const p = catalogo.get(item.productoId.toString());
            if (!p || !p.activo) {
                throw new Error(`"${p?.nombre ?? item.productoId}" ya no está disponible. Quítalo del carrito para continuar.`);
            }
            return {
                productoId: p._id,
                nombreProducto: p.nombre,
                cantidad: item.cantidad,
                precioUnitario: p.precio,
                subtotal: redondear(p.precio * item.cantidad)
            };
        });

        // Se genera el _id antes para poder crear el Envío primero y conocer su costo.
        // La tarifa se calcula en crearEnvio (una sola fuente de verdad).
        // fuera_zona: costo 0 por ahora, el admin lo cotiza después.
        const pedidoId = new mongoose.Types.ObjectId();
        const envio = await crearEnvio({ pedidoId, tipo: tipoEnvio, costoEnvio: 0 }, session);

        const subtotal = redondear(items.reduce((acc, i) => acc + i.subtotal, 0));
        const total = redondear(subtotal + envio.costoEnvio);
        const estadoInicial = tipoEnvio === "fuera_zona" ? "pendiente_cotizacion" : "pendiente";

        const pedido = new pedidoModel({
            _id: pedidoId,
            usuarioId: clienteId,
            productos: items,
            direccionEntrega,
            historialEstados: [{
                estado: estadoInicial,
                usuarioId: actor.id, // quién lo creó: el cliente o el admin
                comentario: esAdmin ? "Pedido creado por el administrador" : "Pedido creado por el cliente"
            }],
            subtotal,
            descuento: 0,
            impuesto: 0,
            total,
            estadoPedido: estadoInicial,
            fechaEntregaEstimada: fechaEntrega
        });
        await pedido.save({ session });

        await vaciarCarrito(clienteId, session);

        return { pedido, envio };
    });
};