import { useCallback, useEffect, useRef, useState } from "react";
import "./CategoriaFiltro.css";

// "categorias" debe ser un arreglo de documentos de tu colección Categoria
// (cada uno con al menos _id y nombre). El pill "Todos" se agrega aquí mismo,
// no forma parte del arreglo que llega por props.
//
// CAMBIO (solo visual): antes los pills se acomodaban en varias filas y con 20+
// categorías se veía desordenado. Ahora van en UNA fila que se desplaza
// horizontalmente, con flechas a los lados (en móvil se desliza con el dedo).
// La lógica de selección (categoriaActiva / onSeleccionar) no cambia.
function CategoriaFiltro({ categorias = [], categoriaActiva, onSeleccionar }) {
  const pistaRef = useRef(null);
  const [puedeIzquierda, setPuedeIzquierda] = useState(false);
  const [puedeDerecha, setPuedeDerecha] = useState(false);

  // Revisa si queda contenido escondido a cada lado para habilitar/deshabilitar flechas.
  const actualizarFlechas = useCallback(() => {
    const pista = pistaRef.current;
    if (!pista) return;
    setPuedeIzquierda(pista.scrollLeft > 4);
    setPuedeDerecha(pista.scrollLeft + pista.clientWidth < pista.scrollWidth - 4);
  }, []);

  useEffect(() => {
    actualizarFlechas();
    window.addEventListener("resize", actualizarFlechas);
    return () => window.removeEventListener("resize", actualizarFlechas);
  }, [categorias, actualizarFlechas]);

  // Si la categoría activa quedó fuera de la vista (por ejemplo, al llegar desde el
  // Home con "Lirios"), la centra. block:"nearest" evita que la página suba o baje.
  useEffect(() => {
    const activo = pistaRef.current?.querySelector(".categoria-filtro__pill--activo");
    activo?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [categoriaActiva, categorias]);

  const desplazar = (direccion) => {
    const pista = pistaRef.current;
    if (!pista) return;
    pista.scrollBy({ left: direccion * pista.clientWidth * 0.7, behavior: "smooth" });
  };

  const clasePill = (activo) =>
    activo ? "categoria-filtro__pill categoria-filtro__pill--activo" : "categoria-filtro__pill";

  return (
    <div className="categoria-filtro">
      <button
        type="button"
        className="categoria-filtro__flecha"
        aria-label="Ver categorías anteriores"
        disabled={!puedeIzquierda}
        onClick={() => desplazar(-1)}
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      <nav
        className="categoria-filtro__pista"
        aria-label="Filtros de categoría"
        ref={pistaRef}
        onScroll={actualizarFlechas}
      >
        <button
          type="button"
          className={clasePill(categoriaActiva === "todos")}
          onClick={() => onSeleccionar("todos")}
        >
          Todos
        </button>

        {categorias.map((categoria) => (
          <button
            key={categoria._id}
            type="button"
            className={clasePill(categoriaActiva === categoria._id)}
            onClick={() => onSeleccionar(categoria._id)}
          >
            {categoria.nombre}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="categoria-filtro__flecha"
        aria-label="Ver más categorías"
        disabled={!puedeDerecha}
        onClick={() => desplazar(1)}
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}

export default CategoriaFiltro;