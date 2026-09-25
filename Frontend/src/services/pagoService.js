import api from "./api.js";

export const listarPagos = async (params = {}) => {
  const { data } = await api.get("/pago", { params });
  return data;
};

export const obtenerPago = async (id) => {
  const { data } = await api.get(`/pago/${id}`);
  return data;
};

export const obtenerPagoPorPedido = async (pedidoId) => {
  const { data } = await api.get(`/pago/pedido/${pedidoId}`);
  return data;
};

export const crearPago = async (pedidoId, metodo) => {
  const { data } = await api.post("/pago", { pedidoId, metodo });
  return data;
};

// Uso del administrador para confirmar la recepción de pagos
// en efectivo o transferencia.
export const confirmarPago = async (id, referenciaTransaccion = "") => {
  const { data } = await api.patch(`/pago/${id}/confirmar`, { referenciaTransaccion });
  return data;
};

// Uso del administrador para solicitar o registrar un reembolso.
export const reembolsarPago = async (id) => {
  const { data } = await api.post(`/pago/${id}/reembolsar`);
  return data;
};

export const obtenerReportePagos = async (params = {}) => {
  const { data } = await api.get("/pago/reporte", { params });
  return data;
};