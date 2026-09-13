import "./Buscador.css";

// Componente controlado: el estado del texto vive en el padre (Catalogo.jsx),
// aquí solo se recibe "valor" y se avisa el cambio con "onChange".
function Buscador({ valor, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="buscador">
      <span className="material-symbols-outlined buscador__icono">search</span>
      <input
        type="text"
        className="buscador__input"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
      {valor && (
        <button
          type="button"
          className="buscador__limpiar"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange("")}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}

export default Buscador;
