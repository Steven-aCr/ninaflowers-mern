import api from "./api";

export const obtenerCarrito = async (usuarioId) => {
  const { data } = await api.get(`/carrito/${usuarioId}`);
  return data;
};
export const agregarItem = async (usuarioId, productoId, cantidad = 1) => {
  const { data } = await api.post(`/carrito/${usuarioId}/items`, { productoId, cantidad });
  return data;
};
export const actualizarCantidad = async (usuarioId, productoId, cantidad) => {
  const { data } = await api.put(`/carrito/${usuarioId}/items/${productoId}`, { cantidad });
  return data;
};
export const eliminarItem = async (usuarioId, productoId) => {
  const { data } = await api.delete(`/carrito/${usuarioId}/items/${productoId}`);
  return data;
};
export const vaciarCarrito = async (usuarioId) => {
  const { data } = await api.delete(`/carrito/${usuarioId}`);
  return data;
};
