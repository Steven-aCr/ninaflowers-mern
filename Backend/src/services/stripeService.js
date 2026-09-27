import stripe from "../config/stripe.js";
import pedidoModel from "../models/pedidoModel.js";
import pagoModel from "../models/pagoModel.js";
import { crearPago, confirmarVenta } from "./pagoService.js";

const ESTADOS_NO_PAGABLES = ["cancelado", "pendiente_cotizacion", "entregado"];

// Obtiene y valida la URL del frontend, usada en las redirecciones de Stripe.
// Ejemplo en producción: FRONTEND_URL=https://ninaflowers-mern.vercel.app
const obtenerFrontendUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL?.trim();

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL no está configurada en las variables de entorno.");
  }

  try {
    new URL(frontendUrl);
  } catch {
    throw new Error(`FRONTEND_URL no contiene una URL válida: "${frontendUrl}"`);
  }

  // Evita URLs con doble slash, como https://sitio.com//pago/exito
  return frontendUrl.replace(/\/+$/, "");
};

export const crearSesionCheckout = async (pedidoId, usuario) => {
  const pedido = await pedidoModel.findById(pedidoId);

  if (!pedido) {
    throw new Error("El pedido especificado no existe.");
  }

  // El cliente solo puede pagar sus propios pedidos.
  if (pedido.usuarioId.toString() !== usuario.id.toString() && usuario.rol !== "administrador") {
    throw new Error("Este pedido no te pertenece.");
  }

  if (ESTADOS_NO_PAGABLES.includes(pedido.estadoPedido)) {
    throw new Error(`El pedido está en estado "${pedido.estadoPedido}" y no puede pagarse todavía.`);
  }

  const completado = await pagoModel.findOne({ pedidoId, estado: "completado" });

  if (completado) {
    throw new Error("Este pedido ya está pagado.");
  }

  const total = Number(pedido.total);

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("El pedido no contiene un total válido para realizar el pago.");
  }

  // Se valida FRONTEND_URL antes de crear o modificar el pago, para no
  // dejar un registro a medias si la configuración del entorno falla.
  const frontendUrl = obtenerFrontendUrl();

  // crearPago reutiliza un pago pendiente si ya existe uno para este método.
  const pago = await crearPago({ pedidoId, metodo: "tarjeta" });

  try {
    const successUrl = `${frontendUrl}/pago/exito?pedido=${pedido._id}&pago=${pago._id}`;
    const cancelUrl = `${frontendUrl}/pago/cancelado?pedido=${pedido._id}`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(total * 100),
          product_data: { name: `Pedido NinaFlowers #${pedido._id}` }
        }
      }],
      metadata: {
        pedidoId: pedido._id.toString(),
        pagoId: pago._id.toString()
      },
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    pago.monto = total;
    pago.referenciaTransaccion = checkout.id;
    await pago.save();

    return { url: checkout.url, pagoId: pago._id };
  } catch (error) {
    // Si Stripe rechaza la operación, el pago queda marcado como fallido.
    pago.estado = "fallido";
    await pago.save();
    throw error;
  }
};

// Stripe confirma el pago a través del webhook o de la verificación manual.
const completarPagoStripe = async (stripeSession) => {
  if (stripeSession.payment_status !== "paid") {
    return null;
  }

  const pagoId = stripeSession.metadata?.pagoId;

  if (!pagoId) {
    throw new Error("La sesión de Stripe no contiene el pagoId en metadata.");
  }

  return await confirmarVenta(pagoId, stripeSession.payment_intent);
};

export const verificarSesion = async (pagoId, usuario) => {
  let pago = await pagoModel.findById(pagoId);

  if (!pago) {
    throw new Error("El pago especificado no existe.");
  }

  if (pago.usuarioId.toString() !== usuario.id.toString() && usuario.rol !== "administrador") {
    throw new Error("Este pago no te pertenece.");
  }

  if (pago.estado === "pendiente" && pago.referenciaTransaccion?.startsWith("cs_")) {
    const stripeSession = await stripe.checkout.sessions.retrieve(pago.referenciaTransaccion);
    await completarPagoStripe(stripeSession);
    pago = await pagoModel.findById(pagoId);
  }

  return pago;
};

export const procesarEventoStripe = async (evento) => {
  switch (evento.type) {
    case "checkout.session.completed":
      await completarPagoStripe(evento.data.object);
      break;

    case "checkout.session.expired": {
      const pagoId = evento.data.object.metadata?.pagoId;

      if (pagoId) {
        await pagoModel.findOneAndUpdate(
          { _id: pagoId, estado: "pendiente" },
          { estado: "fallido" }
        );
      }

      break;
    }

    default:
      break;
  }
};