import { useState } from "react";
import ModalAdmin from "./ModalAdmin.jsx";
import { ESTADOS_PEDIDO } from "../../utils/constantes.js";
import { formatearPrecio } from "../../utils/formatearPrecio.js";
import { etiquetaEstado, idCorto, nombreCompleto } from "../../utils/formatosAdmin.js";
import "../../pages/admin/Pedidos.css";

// Detalle de un pedido + cambio de estado. El estado y el comentario son del formulario,
// por eso viven aquí; el padre solo recibe "onGuardar(nuevoEstado, comentario)".
// Pedidos.jsx le pone un "key" con el estado actual: cuando el estado cambia, el modal
// se vuelve a montar y el formulario arranca limpio con el estado nuevo.
function PedidoDetalleModal({ pedido, guardando, onGuardar, onCerrar }) {
  const [nuevoEstado, setNuevoEstado] = useState(pedido.estadoPedido);
  const [comentario, setComentario] = useState("");

  const direccion = pedido.direccionEntrega;

  return (
    <ModalAdmin ancho className="pedido-modal" ariaLabel={`Pedido ${idCorto(pedido._id)}`} onCerrar={onCerrar} cerrarBloqueado={guardando}>
      <div className="pedido-modal__cabecera">
        <div>
          <p className="pedido-modal__eyebrow">Pedido {idCorto(pedido._id)}</p>
          <h2>Detalle y seguimiento</h2>
        </div>
        <button type="button" className="admin-btn admin-btn--borde admin-btn--sm" onClick={onCerrar} aria-label="Cerrar">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="pedido-modal__grid">
        <div className="pedido-modal__bloque">
          <h3>Cliente</h3>
          <p><strong>{nombreCompleto(pedido.usuarioId)}</strong></p>
          <p>{pedido.usuarioId?.correo || "—"}</p>
        </div>

        <div className="pedido-modal__bloque">
          <h3>Entrega</h3>
          <p>{direccion?.linea1}</p>
          {direccion?.linea2 && <p>{direccion.linea2}</p>}
          <p>{direccion?.ciudad}</p>
          {direccion?.referencia && <p className="pedido-modal__nota">{direccion.referencia}</p>}
        </div>
      </div>

      <div className="pedido-modal__bloque">
        <h3>Productos</h3>
        {pedido.productos?.map((item, indice) => (
          <div className="pedido-modal__linea" key={indice}>
            <span>{item.cantidad}× {item.nombreProducto}</span>
            <strong>{formatearPrecio(item.subtotal)}</strong>
          </div>
        ))}
        <div className="pedido-modal__linea pedido-modal__linea--total">
          <span>Total</span>
          <strong>{formatearPrecio(pedido.total)}</strong>
        </div>
      </div>

      <div className="pedido-modal__bloque">
        <h3>Cambiar estado</h3>
        <div className="admin-modal__fila">
          <label className="admin-modal__campo">
            Estado
            <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)}>
              {ESTADOS_PEDIDO.map((estado) => (
                <option key={estado.valor} value={estado.valor}>{estado.etiqueta}</option>
              ))}
            </select>
          </label>

          <label className="admin-modal__campo">
            Comentario (opcional)
            <input value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Ej. Llamar antes de entregar" />
          </label>
        </div>

        <div className="admin-modal__acciones">
          <button
            type="button"
            className="admin-btn"
            disabled={guardando || nuevoEstado === pedido.estadoPedido}
            onClick={() => onGuardar(nuevoEstado, comentario)}
          >
            {guardando ? "Guardando..." : "Guardar estado"}
          </button>
        </div>
      </div>

      <div className="pedido-modal__bloque">
        <h3>Historial</h3>
        {!pedido.historialEstados?.length ? (
          <p className="pedido-modal__nota">No hay cambios de estado registrados.</p>
        ) : (
          <ol className="pedido-modal__historial">
            {[...pedido.historialEstados].reverse().map((registro, indice) => (
              <li key={indice}>
                <span className="pedido-modal__punto" aria-hidden="true" />
                <div>
                  <span className={`admin-pill admin-pill--${registro.estado}`}>{etiquetaEstado(registro.estado)}</span>
                  <span className="pedido-modal__nota">
                    {new Date(registro.fecha).toLocaleString("es-SV")}
                    {registro.comentario ? ` · ${registro.comentario}` : ""}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </ModalAdmin>
  );
}

export default PedidoDetalleModal;