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

// NUEVO (panel admin): cuántos pedidos hay en cada estado, para los contadores de las
// pestañas y las tarjetas. Pide 1 pedido por estado y usa solo "totalDoc" de la respuesta.
// Devuelve, por ejemplo: { pendiente: 4, confirmado: 12, entregado: 130, ... }
export const contarPedidosPorEstado = async (estados) => {
  const respuestas = await Promise.all(
    estados.map((estadoPedido) => listarPedidos({ page: 1, limite: 1, estadoPedido }))
  );
  return Object.fromEntries(estados.map((estado, i) => [estado, respuestas[i].totalDoc ?? 0]));
};