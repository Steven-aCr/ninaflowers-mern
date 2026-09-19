import { useState } from "react";
import "./FormularioInventario.css";

const ESTADO_INICIAL = { productoId: "", stock: 0, stockMinimo: 0, proveedorId: "" };

function FormularioInventario({ productos, proveedores, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [error, setError] = useState("");

  const manejarCambio = (campo) => (e) => {
    setForm((actual) => ({ ...actual, [campo]: e.target.value }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.productoId) return setError("Selecciona un producto.");

    const stock = Number(form.stock);
    const stockMinimo = Number(form.stockMinimo);
    if (stock < 0 || stockMinimo < 0) return setError("El stock y el stock mínimo no pueden ser negativos.");
    if (stock > 0 && !form.proveedorId) {
      return setError("Si registras stock inicial, indica el proveedor de esa compra.");
    }

    try {
      await onGuardar({
        productoId: form.productoId,
        stock,
        stockMinimo,
        proveedorId: stock > 0 ? form.proveedorId : undefined
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "No se pudo crear el registro.");
    }
  };

  return (
    <div className="formulario-inventario__overlay">
      <form className="formulario-inventario" onSubmit={manejarSubmit}>
        <h2>Nuevo registro de inventario</h2>

        <label className="formulario-inventario__campo">
          Producto
          <select value={form.productoId} onChange={manejarCambio("productoId")} required>
            <option value="">Selecciona un producto</option>
            {productos.map((p) => (
              <option key={p._id} value={p._id}>{p.nombre} ({p.sku})</option>
            ))}
          </select>
        </label>

        <label className="formulario-inventario__campo">
          Stock inicial
          <input type="number" min="0" value={form.stock} onChange={manejarCambio("stock")} />
        </label>

        <label className="formulario-inventario__campo">
          Stock mínimo
          <input type="number" min="0" value={form.stockMinimo} onChange={manejarCambio("stockMinimo")} required />
        </label>

        {Number(form.stock) > 0 && (
          <label className="formulario-inventario__campo">
            Proveedor (de la compra del stock inicial)
            <select value={form.proveedorId} onChange={manejarCambio("proveedorId")} required>
              <option value="">Selecciona un proveedor</option>
              {proveedores.map((prov) => (
                <option key={prov._id} value={prov._id}>{prov.nombre}</option>
              ))}
            </select>
          </label>
        )}

        {error && <p className="formulario-inventario__error">{error}</p>}

        <div className="formulario-inventario__acciones">
          <button type="button" onClick={onCancelar} disabled={guardando}>Cancelar</button>
          <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

export default FormularioInventario;