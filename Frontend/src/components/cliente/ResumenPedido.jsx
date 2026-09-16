import "./ResumenPedido.css";

// Tarjeta de resumen financiero. No calcula impuestos ni envío por su
// cuenta — recibe los montos ya calculados (subtotal, envio, impuesto) y
// solo suma para mostrar el total. Así la regla de negocio de cuánto
// cobrar de envío/impuesto vive en un solo lugar (la página que la use),
// no duplicada dentro de este componente.
function ResumenPedido({
  subtotal,
  envio = 0,
  impuesto = 0,
  textoBoton = "Continuar",
  onContinuar,
  deshabilitado = false,
}) {
  const total = subtotal + envio + impuesto;

  return (
    <div className="resumen-pedido">
      <h3 className="resumen-pedido__titulo">Resumen de compra</h3>

      <div className="resumen-pedido__filas">
        <div className="resumen-pedido__fila">
          <span>Subtotal de productos</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="resumen-pedido__fila">
          <span>Costo de envío</span>
          <span>{envio > 0 ? `$${envio.toFixed(2)}` : "A calcular"}</span>
        </div>
        <div className="resumen-pedido__fila">
          <span>Impuesto</span>
          <span>${impuesto.toFixed(2)}</span>
        </div>
      </div>

      <div className="resumen-pedido__separador"></div>

      <div className="resumen-pedido__total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
        type="button"
        className="resumen-pedido__boton"
        disabled={deshabilitado}
        onClick={onContinuar}
      >
        <span className="material-symbols-outlined">lock</span>
        <span>{textoBoton}</span>
      </button>
    </div>
  );
}

export default ResumenPedido;
