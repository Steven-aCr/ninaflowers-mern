import "./Loader.css";

// Spinner genérico. "texto" es opcional (ej. "Cargando pedidos...").
function Loader({ texto }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" aria-hidden="true"></span>
      {texto && <span className="loader__texto">{texto}</span>}
    </div>
  );
}

export default Loader;
