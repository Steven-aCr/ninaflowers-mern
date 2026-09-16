import api from "./api";

export const login = async (correo, password) => {
  const { data } = await api.post(
    "/usuarios/login",
    { correo, password },
    { headers: { "x-use-cookie": "true" } }
  );
  return data; // { usuario, token }
};

export const registro = async (datosUsuario) => {
  const { data } = await api.post("/usuarios", datosUsuario);
  return data;
};

export const obtenerSesionActual = async () => {
  const { data } = await api.get("/usuarios/me");
  return data; // usuario
};

export const logout = async () => {
    const { data } = await api.post("/usuarios/logout");
    return data;
};