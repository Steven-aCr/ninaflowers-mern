import "dotenv/config";
import Stripe from "stripe";

// La clave se lee del .env, nunca se escribe aquí.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const probar = async () => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 50000,                    // centavos: $5.00
            currency: "usd",
            payment_method: "pm_card_visa", // tarjeta de prueba de Stripe
            confirm: true,                  // cobra en el mismo paso
            automatic_payment_methods: { enabled: true, allow_redirects: "never" }
        });

        console.log("ID:", paymentIntent.id);
        console.log("Estado:", paymentIntent.status);
    } catch (error) {
        console.error("Error de Stripe:", error.message);
    }
};

probar();