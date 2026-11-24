import api from "./api";

export const listarEnvios = async (params = {}) => (await api.get("/envio", { params })).data;
export const obtenerEnvio = async (id) => (await api.get(`/envio/${id}`)).data;
export const obtenerEnvioPorPedido = async (pedidoId) => (await api.get(`/envio/pedido/${pedidoId}`)).data;
export const crearEnvio = async (datos) => (await api.post("/envio", datos)).data;
export const actualizarEnvio = async (id, datos) => (await api.put(`/envio/${id}`, datos)).data;
export const eliminarEnvio = async (id) => (await api.delete(`/envio/${id}`)).data;

// NUEVO (panel admin): cuántos envíos hay de cada tipo, para pestañas y tarjetas.
// Devuelve, por ejemplo: { retiro_tienda: 3, zona_cubierta: 20, fuera_zona: 5 }
export const contarEnviosPorTipo = async (tipos) => {
  const respuestas = await Promise.all(tipos.map((tipo) => listarEnvios({ page: 1, limite: 1, tipo })));
  return Object.fromEntries(tipos.map((tipo, i) => [tipo, respuestas[i].totalDoc ?? 0]));
};