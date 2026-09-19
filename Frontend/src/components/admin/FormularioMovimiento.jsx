import { useState } from "react";
import "./FormularioMovimiento.css";

const MOTIVOS_POR_TIPO = {
  entrada: [
    { valor: "compra", etiqueta: "Compra" },
    { valor: "devolucion", etiqueta: "Devolución" },
    { valor: "ajuste", etiqueta: "Ajuste" }
  ],
  salida: [
    { valor: "venta", etiqueta: "Venta" },
    { valor: "merma", etiqueta: "Merma" },
    { valor: "ajuste", etiqueta: "Ajuste" },
    { valor: "devolucion", etiqueta: "Devolución" }
  ]
};

const ESTADO_INICIAL = { productoId: "", tipo: "entrada", motivo: "compra", cantidad: 1, proveedorId: "" };

function FormularioMovimiento({ productos, proveedores, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [error, setError] = useState("");

  const manejarCambio = (campo) => (e) => {
    const valor = e.target.value;
    setForm((actual) => {
      if (campo === "tipo") {
        // Al cambiar el tipo, el motivo se reinicia al primero válido para ese tipo.
        return { ...actual, tipo: valor, motivo: MOTIVOS_POR_TIPO[valor][0].valor };
      }
      return { ...actual, [campo]: valor };
    });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.productoId) return setError("Selecciona un producto.");
    const cantidad = Number(form.cantidad);
    if (cantidad <= 0) return setError("La cantidad debe ser mayor a 0.");
    if (form.motivo === "compra" && !form.proveedorId) {
      return setError("Selecciona el proveedor de esta compra.");
    }

    try {
      await onGuardar({
        productoId: form.productoId,
        tipo: form.tipo,
        motivo: form.motivo,
        cantidad,
        proveedorId: form.motivo === "compra" ? form.proveedorId : undefined
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "No se pudo registrar el movimiento.");
    }
  };

  return (
    <div className="formulario-movimiento__overlay">
      <form className="formulario-movimiento" onSubmit={manejarSubmit}>
        <h2>Nuevo movimiento de inventario</h2>

        <label className="formulario-movimiento__campo">
          Producto
          <select value={form.productoId} onChange={manejarCambio("productoId")} required>
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p._id} value={p._id}>{p.nombre} ({p.sku}) — stock: {p.stock}</option>
            ))}
          </select>
        </label>

        <div className="formulario-movimiento__fila">
          <label className="formulario-movimiento__campo">
            Tipo
            <select value={form.tipo} onChange={manejarCambio("tipo")}>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
          </label>

          <label className="formulario-movimiento__campo">
            Motivo
            <select value={form.motivo} onChange={manejarCambio("motivo")}>
              {MOTIVOS_POR_TIPO[form.tipo].map((m) => (
                <option key={m.valor} value={m.valor}>{m.etiqueta}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="formulario-movimiento__campo">
          Cantidad
          <input type="number" min="1" value={form.cantidad} onChange={manejarCambio("cantidad")} required />
        </label>

        {form.motivo === "compra" && (
          <label className="formulario-movimiento__campo">
            Proveedor
            <select value={form.proveedorId} onChange={manejarCambio("proveedorId")} required>
              <option value="">Selecciona un proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov._id} value={prov._id}>{prov.nombre}</option>
              ))}
            </select>
          </label>
        )}

        {error && <p className="formulario-movimiento__error">{error}</p>}

        <div className="formulario-movimiento__acciones">
          <button type="button" onClick={onCancelar} disabled={guardando}>Cancelar</button>
          <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

export default FormularioMovimiento;