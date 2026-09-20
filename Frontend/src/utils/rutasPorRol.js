import { ROLES } from "./constantes.js";

// Devuelve la ruta inicial según el rol del usuario.
export function rutaInicialPorRol(rol) {
  return rol === ROLES.ADMINISTRADOR ? "/admin" : "/";
}