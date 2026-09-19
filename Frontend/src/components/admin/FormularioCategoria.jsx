import { useState } from "react";
import "./FormularioCategoria.css";

const ESTADO_INICIAL = { nombre: "", descripcion: "" };

// Un solo formulario sirve para crear y editar: si llega "categoria",
// precarga sus datos; si es null, arranca vacío.
function FormularioCategoria({ categoria, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(
    categoria
      ? { nombre: categoria.nombre, descripcion: categoria.descripcion || "" }
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

    try {
      await onGuardar(form);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "No se pudo guardar la categoría.");
    }
  };

  return (
    <div className="formulario-categoria__overlay">
      <form className="formulario-categoria" onSubmit={manejarSubmit}>
        <h2>{categoria ? "Editar categoría" : "Nueva categoría"}</h2>

        <label className="formulario-categoria__campo">
          Nombre
          <input type="text" value={form.nombre} onChange={manejarCambio("nombre")} required />
        </label>

        <label className="formulario-categoria__campo">
          Descripción
          <textarea rows={3} value={form.descripcion} onChange={manejarCambio("descripcion")} />
        </label>

        {error && <p className="formulario-categoria__error">{error}</p>}

        <div className="formulario-categoria__acciones">
          <button type="button" onClick={onCancelar} disabled={guardando}>Cancelar</button>
          <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

export default FormularioCategoria;