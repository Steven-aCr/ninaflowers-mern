import { useState } from "react";
import { obtenerUrlImagen } from "../../services/productoService.js";
import "./FormularioProducto.css";

const ESTADO_INICIAL = {
  sku: "", nombre: "", descripcion: "", categoriaId: "",
  tipoProducto: "simple", precio: "", costo: ""
};

// productosDisponibles: solo productos "simple" activos, para armar componentes.
function FormularioProducto({ producto, categorias, productosDisponibles, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(
    producto
      ? {
          sku: producto.sku,
          nombre: producto.nombre,
          descripcion: producto.descripcion || "",
          categoriaId: producto.categoriaId?._id || producto.categoriaId || "",
          tipoProducto: producto.tipoProducto,
          precio: producto.precio,
          costo: producto.costo ?? ""
        }
      : ESTADO_INICIAL
  );
  const [componentes, setComponentes] = useState(producto?.componentes || []);
  const [archivos, setArchivos] = useState([]);
  const [error, setError] = useState("");

  const manejarCambio = (campo) => (e) => {
    setForm((actual) => ({ ...actual, [campo]: e.target.value }));
  };

  const agregarComponente = () => {
    setComponentes((actual) => [...actual, { productoId: "", cantidad: 1 }]);
  };

  const actualizarComponente = (indice, campo, valor) => {
    setComponentes((actual) =>
      actual.map((c, i) => (i === indice ? { ...c, [campo]: valor } : c))
    );
  };

  const quitarComponente = (indice) => {
    setComponentes((actual) => actual.filter((_, i) => i !== indice));
  };

  const manejarArchivos = (e) => {
    const seleccionados = Array.from(e.target.files);
    if (seleccionados.length > 5) {
      setError("Puedes subir un máximo de 5 imágenes.");
      return;
    }
    setError("");
    setArchivos(seleccionados);
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.categoriaId) return setError("Selecciona una categoría.");
    if (form.tipoProducto === "compuesto" && componentes.length === 0) {
      return setError("Un producto compuesto necesita al menos un componente.");
    }
    if (componentes.some((c) => !c.productoId)) {
      return setError("Todos los componentes deben tener un producto seleccionado.");
    }

    try {
      await onGuardar(
        {
          ...form,
          precio: Number(form.precio),
          costo: form.costo === "" ? undefined : Number(form.costo),
          componentes: form.tipoProducto === "compuesto"
            ? componentes.map((c) => ({ productoId: c.productoId, cantidad: Number(c.cantidad) }))
            : []
        },
        archivos
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || "No se pudo guardar el producto.");
    }
  };

  return (
    <div className="formulario-producto__overlay">
      <form className="formulario-producto" onSubmit={manejarSubmit}>
        <h2>{producto ? "Editar producto" : "Nuevo producto"}</h2>

        <div className="formulario-producto__fila">
          <label className="formulario-producto__campo">
            SKU
            <input type="text" value={form.sku} onChange={manejarCambio("sku")} required />
          </label>
          <label className="formulario-producto__campo">
            Nombre
            <input type="text" value={form.nombre} onChange={manejarCambio("nombre")} required />
          </label>
        </div>

        <label className="formulario-producto__campo">
          Descripción
          <textarea rows={2} value={form.descripcion} onChange={manejarCambio("descripcion")} />
        </label>

        <div className="formulario-producto__fila">
          <label className="formulario-producto__campo">
            Categoría
            <select value={form.categoriaId} onChange={manejarCambio("categoriaId")} required>
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </select>
          </label>
          <label className="formulario-producto__campo">
            Tipo
            <select value={form.tipoProducto} onChange={manejarCambio("tipoProducto")}>
              <option value="simple">Simple</option>
              <option value="compuesto">Compuesto</option>
            </select>
          </label>
        </div>

        <div className="formulario-producto__fila">
          <label className="formulario-producto__campo">
            Precio
            <input type="number" min="0" step="0.01" value={form.precio} onChange={manejarCambio("precio")} required />
          </label>
          <label className="formulario-producto__campo">
            Costo (opcional)
            <input type="number" min="0" step="0.01" value={form.costo} onChange={manejarCambio("costo")} />
          </label>
        </div>

        {form.tipoProducto === "compuesto" && (
          <div className="formulario-producto__componentes">
            <div className="formulario-producto__componentes-titulo">
              <span>Componentes</span>
              <button type="button" onClick={agregarComponente}>+ Agregar</button>
            </div>

            {componentes.map((comp, indice) => (
              <div className="formulario-producto__componente-fila" key={indice}>
                <select
                  value={comp.productoId}
                  onChange={(e) => actualizarComponente(indice, "productoId", e.target.value)}
                >
                  <option value="">Selecciona un producto</option>
                  {productosDisponibles.map((p) => (
                    <option key={p._id} value={p._id}>{p.nombre} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={comp.cantidad}
                  onChange={(e) => actualizarComponente(indice, "cantidad", e.target.value)}
                />
                <button type="button" onClick={() => quitarComponente(indice)}>Quitar</button>
              </div>
            ))}
          </div>
        )}

        <label className="formulario-producto__campo">
          Imágenes (máximo 5 — si subes nuevas, reemplazan a las anteriores)
          <input type="file" accept="image/*" multiple onChange={manejarArchivos} />
        </label>

        {producto?.imagenes?.length > 0 && archivos.length === 0 && (
          <div className="formulario-producto__previews">
            {producto.imagenes.map((img) => (
              <img key={img} src={obtenerUrlImagen(img)} alt={form.nombre} />
            ))}
          </div>
        )}

        {error && <p className="formulario-producto__error">{error}</p>}

        <div className="formulario-producto__acciones">
          <button type="button" onClick={onCancelar} disabled={guardando}>Cancelar</button>
          <button type="submit" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}

export default FormularioProducto;