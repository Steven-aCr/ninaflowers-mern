export function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo || "");
}

export function esCampoVacio(valor) {
  return !valor || valor.toString().trim() === "";
}

export function tieneLongitudMinima(valor, minimo) {
  return (valor || "").toString().trim().length >= minimo;
}
