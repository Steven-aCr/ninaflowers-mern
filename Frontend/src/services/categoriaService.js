import api from "./api";

export const listarCategorias = async (params = {}) => {
  const { data } = await api.get("/categorias", { params });
  return data; // { totalDoc, pagActual, totalPag, datos }
};

export const buscarCategoriaId = async (id) => {
  const { data } = await api.get(`/categorias/${id}`);
  return data;
};

export const crearCategoria = async (datos) => {
  const { data } = await api.post("/categorias", datos);
  return data;
};

export const modificarCategoria = async (id, datos) => {
  const { data } = await api.put(`/categorias/${id}`, datos);
  return data;
};

// Soft-delete: el backend solo pone activo=false, nunca borra el documento.
export const eliminarCategoria = async (id) => {
  const { data } = await api.delete(`/categorias/${id}`);
  return data;
};