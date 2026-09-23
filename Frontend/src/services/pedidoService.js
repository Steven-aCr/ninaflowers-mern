import api from "./api";

export const listarPedidos = async (params = {}) => {
  const { data } = await api.get("/pedidos", { params });
  return data;
};

export const listarMisPedidos = async (params = {}) => {
  const { data } = await api.get("/pedidos/mis-pedidos", { params });
  return data;
};

export const obtenerPedido = async (id) => {
  const { data } = await api.get(`/pedidos/${id}`);
  return data;
};

export const crearPedidoDesdeCarrito = async (datos) => {
  const { data } = await api.post("/pedidos/desde-carrito", datos);
  return data;
};

export const actualizarPedido = async (id, datos) => {
  const { data } = await api.put(`/pedidos/${id}`, datos);
  return data;
};

export const actualizarEstadoPedido = async (id, estado, comentario = "") => {
  const { data } = await api.patch(`/pedidos/${id}/estado`, { estado, comentario });
  return data;
};

export const cancelarPedido = async (id, comentario = "") => {
  const { data } = await api.patch(`/pedidos/${id}/cancelar`, { comentario });
  return data;
};
