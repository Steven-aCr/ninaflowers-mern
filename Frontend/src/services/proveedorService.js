import api from "./api";

export const listarProveedores = async (params = {}) => {
  const { data } = await api.get("/proveedores", { params });
  return data; // { totalDoc, pagActual, totalPag, datos }
};

export const buscarProveedorId = async (id) => {
  const { data } = await api.get(`/proveedores/${id}`);
  return data;
};

export const crearProveedor = async (datos) => {
  const { data } = await api.post("/proveedores", datos);
  return data;
};

export const modificarProveedor = async (id, datos) => {
  const { data } = await api.put(`/proveedores/${id}`, datos);
  return data;
};

// Soft-delete: el backend solo pone activo=false.
export const eliminarProveedor = async (id) => {
  const { data } = await api.delete(`/proveedores/${id}`);
  return data;
};