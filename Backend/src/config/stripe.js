import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Falta STRIPE_SECRET_KEY en el archivo .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;