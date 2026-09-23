import api from "./api";

export const listarPagos = async (params = {}) => (await api.get("/pago", { params })).data;
export const obtenerPago = async (id) => (await api.get(`/pago/${id}`)).data;
export const obtenerPagoPorPedido = async (pedidoId) => (await api.get(`/pago/pedido/${pedidoId}`)).data;
export const crearPago = async (datos) => (await api.post("/pago", datos)).data;

export const actualizarEstadoPago = async (id, estado, referenciaTransaccion = "") =>
  (await api.patch(`/pago/${id}/estado`, { estado, referenciaTransaccion })).data;
export const obtenerReportePagos = async (params = {}) => (await api.get("/pago/reporte", { params })).data;
