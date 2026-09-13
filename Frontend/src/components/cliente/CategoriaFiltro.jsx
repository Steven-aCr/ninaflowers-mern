import "./CategoriaFiltro.css";

// "categorias" debe ser un arreglo de documentos de tu colección Categoria
// (cada uno con al menos _id y nombre). El pill "Todos" se agrega aquí mismo,
// no forma parte del arreglo que llega por props.
function CategoriaFiltro({ categorias = [], categoriaActiva, onSeleccionar }) {
  return (
    <nav className="categoria-filtro" aria-label="Filtros de categoría">
      <button
        type="button"
        className={
          categoriaActiva === "todos"
            ? "categoria-filtro__pill categoria-filtro__pill--activo"
            : "categoria-filtro__pill"
        }
        onClick={() => onSeleccionar("todos")}
      >
        Todos
      </button>

      {categorias.map((categoria) => (
        <button
          key={categoria._id}
          type="button"
          className={
            categoriaActiva === categoria._id
              ? "categoria-filtro__pill categoria-filtro__pill--activo"
              : "categoria-filtro__pill"
          }
          onClick={() => onSeleccionar(categoria._id)}
        >
          {categoria.nombre}
        </button>
      ))}
    </nav>
  );
}

export default CategoriaFiltro;
