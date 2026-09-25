import api from "./api";

export const listarInventario = async (params = {}) => {
  const { data } = await api.get("/inventarios", { params });
  return data;
};

export const crearInventario = async (datosInventario) => {
  const { data } = await api.post("/inventarios", datosInventario);
  return data;
};

export const modificarInventario = async (id, datosActualizados) => {
  const { data } = await api.put(`/inventarios/${id}`, datosActualizados);
  return data;
};

export const listarInventarioBajoMinimo = async () => {
  const { data } = await api.get("/inventarios", { params: { bajoMinimo: "true", limite: 100 } });
  return data;
};

export const producirProducto = async (productoId, cantidad) => {
  const { data } = await api.post("/inventarios/produccion", { productoId, cantidad: Number(cantidad) });
  return data;
};