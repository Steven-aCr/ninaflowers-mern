import api from "./api";

export const listarEnvios = async (params = {}) => (await api.get("/envio", { params })).data;
export const obtenerEnvio = async (id) => (await api.get(`/envio/${id}`)).data;
export const obtenerEnvioPorPedido = async (pedidoId) => (await api.get(`/envio/pedido/${pedidoId}`)).data;
export const crearEnvio = async (datos) => (await api.post("/envio", datos)).data;
export const actualizarEnvio = async (id, datos) => (await api.put(`/envio/${id}`, datos)).data;
export const eliminarEnvio = async (id) => (await api.delete(`/envio/${id}`)).data;
