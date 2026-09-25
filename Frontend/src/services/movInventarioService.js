import api from "./api";

export const listarMovimientos = async (params = {}) => {
  const { data } = await api.get("/movimientosInventario", { params });
  return data;
};

export const crearMovimiento = async (datos) => {
  const { data } = await api.post("/movimientosInventario", datos);
  return data;
};