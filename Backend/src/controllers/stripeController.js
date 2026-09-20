import stripe from "../config/stripe.js";
import * as stripeService from "../services/stripeService.js";

export const crearSesion = async (req, res) => {
    try {
        // req.usuario lo llena verificarToken (viene del JWT), no del body.
        const resultado = await stripeService.crearSesionCheckout(req.body.pedidoId, req.usuario);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const webhook = async (req, res) => {
    let evento;
    try {
        // Verifica que el mensaje realmente viene de Stripe.
        evento = stripe.webhooks.constructEvent(
            req.body, // aquí req.body es un Buffer (raw), no JSON
            req.headers["stripe-signature"],
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return res.status(400).send(`Webhook inválido: ${error.message}`);
    }

    try {
        await stripeService.procesarEventoStripe(evento);
        res.status(200).json({ recibido: true });
    } catch (error) {
        // Responder 500 hace que Stripe reintente el envío más tarde.
        res.status(500).json({ error: error.message });
    }
};


export const verificar = async (req, res) => {
    try {
        const pago = await stripeService.verificarSesion(req.params.pagoId, req.usuario);
        res.status(200).json({ pagoId: pago._id, estado: pago.estado });
    } catch (error) { res.status(400).json({ error: error.message }); }
};