// Helpers de formato compartidos por las tablas y modales del panel admin.
// Antes cada tabla repetía estas mismas líneas (slice(-6), replaceAll, etc.).

// "665f1c2e9a..." -> "#9A1234" (los últimos 6 caracteres del _id).
export const idCorto = (id) => (id ? `#${String(id).slice(-6).toUpperCase()}` : "—");

// "pendiente_cotizacion" -> "pendiente cotizacion". El CSS (.admin-pill) lo capitaliza.
export const etiquetaEstado = (valor) => (valor ? valor.replaceAll("_", " ") : "—");

export const nombreCompleto = (usuario) =>
  usuario ? `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim() || "—" : "—";

// { nombre: "Sofía", apellido: "Pérez" } -> "SP"
export const iniciales = (usuario) => {
  const n = (usuario?.nombre || "").charAt(0);
  const a = (usuario?.apellido || "").charAt(0);
  return (n + a).toUpperCase() || "?";
};

export const formatearFechaCorta = (fecha) =>
  fecha ? new Date(fecha).toLocaleDateString("es-SV") : "—";

// NUEVO: "hace 5 min", "hace 3 h", "hace 2 días"... (para "Movimientos recientes").
export const tiempoRelativo = (fecha) => {
  if (!fecha) return "—";
  const minutos = Math.max(0, Math.round((Date.now() - new Date(fecha).getTime()) / 60000));
  if (minutos < 1) return "hace un momento";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
};

// NUEVO: primer día del mes actual en formato "AAAA-MM-DD" (filtro fechaInicio de movimientos).
export const inicioDeMes = () => {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${hoy.getFullYear()}-${mes}-01`;
};
