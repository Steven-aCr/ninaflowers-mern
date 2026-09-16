// Formatea un número como precio en dólares con 2 decimales: 45 -> "$45.00"
export function formatearPrecio(valor) {
  return `$${Number(valor || 0).toFixed(2)}`;
}
