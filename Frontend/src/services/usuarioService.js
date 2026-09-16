import api from "./api";

export const actualizarPerfil = async (datos) => {
  const { data } = await api.put("/usuarios/me", datos);
  return data;
};