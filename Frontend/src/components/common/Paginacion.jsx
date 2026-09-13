import "./Paginacion.css";

// Paginación genérica: no sabe nada de productos ni de la API.
// Recibe la página actual, el total de páginas y avisa el cambio.
function Paginacion({ paginaActual, totalPaginas, onCambiarPagina }) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <nav className="paginacion" aria-label="Paginación de resultados">
      {paginas.map((pagina) => (
        <button
          key={pagina}
          type="button"
          className={
            pagina === paginaActual
              ? "paginacion__boton paginacion__boton--activo"
              : "paginacion__boton"
          }
          aria-current={pagina === paginaActual ? "page" : undefined}
          onClick={() => onCambiarPagina(pagina)}
        >
          {pagina}
        </button>
      ))}

      <button
        type="button"
        className="paginacion__boton"
        aria-label="Página siguiente"
        disabled={paginaActual === totalPaginas}
        onClick={() => onCambiarPagina(paginaActual + 1)}
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </nav>
  );
}

export default Paginacion;
