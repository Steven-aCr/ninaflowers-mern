import api from "./api";

export const listarUsuarios = async (params = {}) => {
  const { data } = await api.get("/usuarios", { params });
  return data; // { totalDoc, pagActual, totalPag, datos }
};

// Soft-delete: el backend solo pone activo=false, nunca borra el documento.
export const desactivarUsuario = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
};

export const activarUsuario = async (id) => {
  const { data } = await api.put(`/usuarios/${id}`, { activo: true });
  return data;
};