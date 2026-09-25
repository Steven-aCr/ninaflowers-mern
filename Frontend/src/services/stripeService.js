import api from "./api.js";

export const crearSesionCheckout = async (pedidoId) => {
  const { data } = await api.post("/stripe/checkout", { pedidoId });
  return data;
};

export const verificarPagoStripe = async (pagoId) => {
  const { data } = await api.get(`/stripe/verificar/${pagoId}`);
  return data;
};