// Constantes de negocio compartidas por toda la app: roles, estados de
// pedido, tipos de envío y métodos de pago. Los valores deben coincidir
// EXACTO con los enums de los modelos de Mongoose del backend — si cambias
// un enum allá, actualiza aquí también.

export const ROLES = {
  CLIENTE: "cliente",
  ADMINISTRADOR: "administrador",
};

// Coincide con el enum "estadoPedido" de pedidoModel.js
export const ESTADOS_PEDIDO = [
  { valor: "pendiente", etiqueta: "Pendiente", icono: "hourglass_empty" },
  { valor: "pendiente_cotizacion", etiqueta: "Pendiente de cotización", icono: "request_quote" },
  { valor: "confirmado", etiqueta: "Confirmado", icono: "check_circle" },
  { valor: "en_preparacion", etiqueta: "En preparación", icono: "content_cut" },
  { valor: "listo_entrega", etiqueta: "Listo para entrega", icono: "package_2" },
  { valor: "entregado", etiqueta: "Entregado", icono: "mark_email_read" },
  { valor: "cancelado", etiqueta: "Cancelado", icono: "block" },
];

export const ESTADOS_EN_CURSO = [
  "pendiente",
  "pendiente_cotizacion",
  "confirmado",
  "en_preparacion",
  "listo_entrega",
];

// Coincide con el enum "tipo" de envioModel.js y las tarifas de envioService.js
export const TIPOS_ENVIO = [
  { valor: "retiro_tienda", etiqueta: "Retiro en tienda", costo: 0 },
  { valor: "zona_cubierta", etiqueta: "Zona cubierta", costo: 2 },
  { valor: "fuera_zona", etiqueta: "Fuera de zona (cotización manual)", costo: null },
];

// Coincide con el enum "metodo" de pagoModel.js
export const METODOS_PAGO = [
  { valor: "tarjeta", etiqueta: "Tarjeta" },
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "transferencia", etiqueta: "Transferencia" },
];

export function obtenerEstadoPedido(valor) {
  return ESTADOS_PEDIDO.find((estado) => estado.valor === valor) || null;
}
