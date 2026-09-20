import stripe from "../config/stripe.js";
import pedidoModel from "../models/pedidoModel.js";
import pagoModel from "../models/pagoModel.js";
import { crearPago } from "./pagoService.js";

// Un pedido en estos estados no se puede pagar.
// (pendiente_cotizacion: envío fuera de zona aún sin cotizar por el Admin)
const ESTADOS_NO_PAGABLES = ["cancelado", "pendiente_cotizacion", "entregado"];

export const crearSesionCheckout = async (pedidoId, usuario) => {
    const pedido = await pedidoModel.findById(pedidoId);
    if (!pedido) {
        throw new Error("El pedido especificado no existe.");
    }
    // El cliente solo paga SUS pedidos. El administrador puede pagar el de cualquier cliente.
    if (pedido.usuarioId.toString() !== usuario.id.toString() && usuario.rol !== "administrador") {
        throw new Error("Este pedido no te pertenece.");
    }
    if (ESTADOS_NO_PAGABLES.includes(pedido.estadoPedido)) {
        throw new Error(`El pedido está en estado "${pedido.estadoPedido}" y no se puede pagar.`);
    }

    // Crea el Pago en estado "pendiente" (valida que no exista uno completado).
    // El Pago pertenece al dueño del pedido, aunque lo inicie un administrador.
    const pago = await crearPago({ pedidoId, usuarioId: pedido.usuarioId, metodo: "tarjeta" });

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [{
                quantity: 1,
                price_data: {
                    currency: "usd",
                    // Stripe trabaja en centavos: $12.50 -> 1250
                    unit_amount: Math.round(pago.monto * 100),
                    product_data: { name: `Pedido NinaFlowers #${pedido._id}` }
                }
            }],
            // Sirve para saber qué Pago/Pedido corresponde cuando llegue el webhook.
            metadata: {
                pedidoId: pedido._id.toString(),
                pagoId: pago._id.toString()
            },
            success_url: `${process.env.CLIENT_URL}/pago/exito?pedido=${pedido._id}&pago=${pago._id}`,
            cancel_url: `${process.env.CLIENT_URL}/pago/cancelado?pedido=${pedido._id}`
        });

        pago.referenciaTransaccion = session.id;
        await pago.save();

        return { url: session.url, pagoId: pago._id };
    } catch (error) {
        // Si Stripe falla, no dejamos un Pago "pendiente" huérfano.
        pago.estado = "fallido";
        await pago.save();
        throw error;
    }
};

// Marca un Pago como completado. La usan el webhook y la verificación manual.
const completarPago = async (session) => {
    if (session.payment_status !== "paid") return null;

    const { pagoId, pedidoId } = session.metadata;

    // Atómico: solo actualiza si aún NO estaba completado.
    // Si webhook y verificación llegan a la vez, solo uno gana.
    const pago = await pagoModel.findOneAndUpdate(
        { _id: pagoId, estado: { $ne: "completado" } },
        { estado: "completado", referenciaTransaccion: session.payment_intent },
        { new: true }
    );
    if (!pago) return null; // ya estaba completado

    await pedidoModel.findOneAndUpdate(
        { _id: pedidoId, estadoPedido: "pendiente" },
        {
            estadoPedido: "confirmado",
            $push: {
                historialEstados: {
                    estado: "confirmado",
                    fecha: new Date(),
                    usuarioId: pago.usuarioId,
                    comentario: "Pago con tarjeta confirmado (Stripe)"
                }
            }
        }
    );
    return pago;
};

// Consulta a Stripe directamente (con tu clave secreta) si el pago ya se realizó.
// No confía en lo que diga el navegador del cliente.
export const verificarSesion = async (pagoId, usuario) => {
    const pago = await pagoModel.findById(pagoId);
    if (!pago) {
        throw new Error("El pago especificado no existe.");
    }
    if (pago.usuarioId.toString() !== usuario.id.toString() && usuario.rol !== "administrador") {
        throw new Error("Este pago no te pertenece.");
    }

    // Mientras esté pendiente, referenciaTransaccion guarda el ID de la sesión (cs_...).
    if (pago.estado === "pendiente" && pago.referenciaTransaccion?.startsWith("cs_")) {
        const session = await stripe.checkout.sessions.retrieve(pago.referenciaTransaccion);
        await completarPago(session);
        return await pagoModel.findById(pagoId);
    }
    return pago;
};

export const procesarEventoStripe = async (evento) => {
    switch (evento.type) {
        case "checkout.session.completed":
            await completarPago(evento.data.object);
            break;

        case "checkout.session.expired": {
            const { pagoId } = evento.data.object.metadata;
            await pagoModel.findOneAndUpdate(
                { _id: pagoId, estado: "pendiente" },
                { estado: "fallido" }
            );
            break;
        }
    }
};