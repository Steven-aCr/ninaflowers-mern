import { useState } from "react";
import ModalAdmin from "./ModalAdmin.jsx";

const ESTADO_INICIAL = { nombre: "", telefono: "", correo: "", direccion: "" };

function FormularioProveedor({ proveedor, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(
    proveedor
      ? {
          nombre: proveedor.nombre,
          telefono: proveedor.telefono,
          correo: proveedor.correo,
          direccion: proveedor.direccion,
        }
      : ESTADO_INICIAL
  );
  const [error, setError] = useState("");

  const manejarCambio = (campo) => (e) => {
    setForm((actual) => ({ ...actual, [campo]: e.target.value }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.telefono.trim()) return setError("El teléfono es obligatorio.");
    if (!form.correo.trim()) return setError("El correo es obligatorio.");
    if (!form.direccion.trim()) return setError("La dirección es obligatoria.");

    try {
      await onGuardar(form);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "No se pudo guardar el proveedor.");
    }
  };

  return (
    <ModalAdmin
      titulo={proveedor ? "Editar proveedor" : "Nuevo proveedor"}
      onCerrar={onCancelar}
      cerrarBloqueado={guardando}
      onSubmit={manejarSubmit}
    >
      <label className="admin-modal__campo">
        Nombre
        <input type="text" value={form.nombre} onChange={manejarCambio("nombre")} required />
      </label>

      <div className="admin-modal__fila">
        <label className="admin-modal__campo">
          Teléfono
          <input type="text" value={form.telefono} onChange={manejarCambio("telefono")} required />
        </label>

        <label className="admin-modal__campo">
          Correo
          <input type="email" value={form.correo} onChange={manejarCambio("correo")} required />
        </label>
      </div>

      <label className="admin-modal__campo">
        Dirección
        <textarea rows={2} value={form.direccion} onChange={manejarCambio("direccion")} required />
      </label>

      {error && <p className="admin-modal__error">{error}</p>}

      <div className="admin-modal__acciones">
        <button type="button" className="admin-btn admin-btn--borde" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="admin-btn" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </ModalAdmin>
  );
}

export default FormularioProveedor;
