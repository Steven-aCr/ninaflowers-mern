import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProductoCard from "../../components/cliente/ProductoCard.jsx";
import { listarProductos } from "../../services/productoService.js";
import { listarCategorias } from "../../services/categoriaService.js";
import NinaFlowersPet from "../../assets/NinaFlowersPet.png";
import Ramo1 from "../../assets/Ramo1.jpg";
import Ramo2 from "../../assets/Ramo2.jpg";
import "./Home.css";

const MAX_CATEGORIAS = 5;
const INTERVALO_CARRUSEL = 5500; // milisegundos entre slide y slide

// Slides del carrusel. Son textos de marca, no productos (no vienen de la API).
// "posicion" decide qué parte de la foto queda visible al llenar la pantalla
// (por ejemplo "center", "top", "70% center").
const SLIDES = [
  {
    eyebrow: "Atelier Botánico Floral",
    titulo: "El arte de transmitir emociones con flores frescas",
    texto:
      "Diseñamos ramos y arreglos artesanales con flores seleccionadas del día, listos para llenar tus momentos especiales.",
    icono: "spa",
    imagen: NinaFlowersPet,
    alt: "Nina, la mascota de NinaFlowers",
    posicion: "center",
  },
  {
    eyebrow: "Colección de temporada",
    titulo: "Ramos pensados para cada ocasión especial",
    texto:
      "Desde aniversarios hasta detalles espontáneos: encuentra el arreglo perfecto para regalar o regalarte.",
    icono: "favorite",
    imagen: Ramo2,
    alt: "Ramo de flores de temporada",
    posicion: "center",
  },
  {
    eyebrow: "Compromiso botánico",
    titulo: "Frescura garantizada por 7 días en cada entrega",
    texto:
      "Cuidamos cada tallo con conservación artesanal y empaques biodegradables, sin químicos agresivos.",
    icono: "eco",
    imagen: Ramo1,
    alt: "Ramo de flores frescas",
    posicion: "center",
  },
];

function Home() {
  const location = useLocation();

  // ---------- Carrusel ----------
  const [slideActual, setSlideActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado) return; // si el mouse está encima, no avanza solo
    const intervalo = setInterval(() => {
      setSlideActual((actual) => (actual + 1) % SLIDES.length);
    }, INTERVALO_CARRUSEL);
    return () => clearInterval(intervalo);
  }, [pausado, slideActual]);

  const moverSlide = (direccion) =>
    setSlideActual((actual) => (actual + direccion + SLIDES.length) % SLIDES.length);

  // ---------- Datos de la API ----------
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      try {
        const respuesta = await listarProductos({ page: 1, limite: 4, orden: "nombre-asc" });
        if (!cancelado) setProductos(respuesta?.datos ?? []);
      } catch (err) {
        console.error("No se pudieron cargar los productos destacados:", err.message);
      }

      try {
        const respuesta = await listarCategorias({ activo: true, limite: 100 });
        const lista = Array.isArray(respuesta) ? respuesta : respuesta?.datos ?? [];
        if (!cancelado) setCategorias(lista.slice(0, MAX_CATEGORIAS));
      } catch (err) {
        console.error("No se pudieron cargar las categorías:", err.message);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  // Si llegan con /#sobre-nosotros (desde el Navbar), bajar hasta esa sección.
  useEffect(() => {
    if (location.hash === "#sobre-nosotros") {
      document.getElementById("sobre-nosotros")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <main className="home">
      {/* --- Carrusel --- */}
      <section className="home__hero" aria-roledescription="carrusel" aria-label="Destacados">
        <div
          className="home__carrusel"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          {/* Fondos: cada foto ocupa todo el carrusel; solo la activa se ve */}
          {SLIDES.map((slide, indice) => (
            <div
              key={slide.titulo}
              className={`home__fondo ${indice === slideActual ? "home__fondo--activo" : ""}`}
              style={{ backgroundImage: `url(${slide.imagen})`, backgroundPosition: slide.posicion }}
              aria-hidden="true"
            />
          ))}
          <div className="home__sombra" aria-hidden="true" />

          {/* Contador: 01 / 03 */}
          <div className="home__contador" aria-hidden="true">
            <span className="home__contador-punto" />
            <span>
              {String(slideActual + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>

          {/* Textos: solo el slide activo es visible */}
          <div className="home__slides-texto">
            {SLIDES.map((slide, indice) => (
              <article
                key={slide.titulo}
                className={`home__slide ${indice === slideActual ? "home__slide--activa" : ""}`}
                aria-hidden={indice !== slideActual}
              >
                <span className="home__eyebrow">
                  <span className="material-symbols-outlined">{slide.icono}</span>
                  {slide.eyebrow}
                </span>
                <h1 className="home__titulo">{slide.titulo}</h1>
                <p className="home__subtitulo">{slide.texto}</p>
                <div className="home__hero-acciones">
                  <Link to="/catalogo" className="ui-btn ui-btn--blanco">
                    <span>Ver catálogo</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                  <a href="#sobre-nosotros" className="ui-btn home__boton-vidrio">
                    <span className="material-symbols-outlined">local_florist</span>
                    <span>Conoce el taller</span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* Miniaturas de los siguientes slides. "--pos" es la posición de cada una
              respecto al slide activo (0 = activo, 1 = el que sigue, ...). Al cambiar
              de slide cambia --pos y el CSS las desliza hacia la izquierda. */}
          <div className="home__miniaturas" style={{ "--n": SLIDES.length }}>
            {SLIDES.map((slide, indice) => {
              const pos = (indice - slideActual + SLIDES.length) % SLIDES.length;
              return (
                <button
                  key={slide.titulo}
                  type="button"
                  className={`home__miniatura ${pos === 0 ? "home__miniatura--oculta" : ""}`}
                  style={{ "--pos": pos }}
                  aria-label={`Ir a: ${slide.titulo}`}
                  tabIndex={pos === 0 ? -1 : 0}
                  onClick={() => setSlideActual(indice)}
                >
                  <img src={slide.imagen} alt="" style={{ objectPosition: slide.posicion }} />
                </button>
              );
            })}
          </div>

          {/* Controles */}
          <div className="home__controles">
            <button
              type="button"
              className="home__flecha"
              aria-label="Slide anterior"
              onClick={() => moverSlide(-1)}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <div className="home__puntos">
              {SLIDES.map((_, indice) => (
                <button
                  key={indice}
                  type="button"
                  aria-label={`Ir al slide ${indice + 1}`}
                  className={`home__punto ${indice === slideActual ? "home__punto--activo" : ""}`}
                  onClick={() => setSlideActual(indice)}
                />
              ))}
            </div>

            <button
              type="button"
              className="home__flecha"
              aria-label="Slide siguiente"
              onClick={() => moverSlide(1)}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Pilares debajo del carrusel */}
        <div className="home__pilares">
          <div className="home__pilar">
            <div className="home__pilar-icono home__pilar-icono--1">
              <span className="material-symbols-outlined">filter_vintage</span>
            </div>
            <div>
              <p className="home__pilar-titulo">Corte diario</p>
              <p className="home__pilar-texto">Flores frescas cortadas a diario</p>
            </div>
          </div>

          <div className="home__pilar">
            <div className="home__pilar-icono home__pilar-icono--2">
              <span className="material-symbols-outlined">brush</span>
            </div>
            <div>
              <p className="home__pilar-titulo">Arte manual</p>
              <p className="home__pilar-texto">Preparación artesanal cuidadosa</p>
            </div>
          </div>

          <div className="home__pilar">
            <div className="home__pilar-icono home__pilar-icono--3">
              <span className="material-symbols-outlined">schedule_send</span>
            </div>
            <div>
              <p className="home__pilar-titulo">Puntualidad</p>
              <p className="home__pilar-texto">Entregas programadas a domicilio</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Categorías --- */}
      {categorias.length > 0 && (
        <section className="home__seccion">
          <div className="home__encabezado">
            <span className="ui-badge home__eyebrow-simple">Categorías</span>
            <h2 className="home__seccion-titulo">Explora por categoría</h2>
            <p className="home__seccion-subtitulo">
              Encuentra rápido lo que buscas: ramos, globos, peluches y más.
            </p>
          </div>

          <div className="home__categorias">
            {categorias.map((categoria, indice) => (
              <Link
                key={categoria._id}
                to="/catalogo"
                state={{ categoriaId: categoria._id }}
                className={`home__categoria home__categoria--${(indice % 5) + 1}`}
              >
                <span className="home__categoria-icono">
                  <span className="material-symbols-outlined">local_florist</span>
                </span>
                <span className="home__categoria-nombre">{categoria.nombre}</span>
                <span className="home__categoria-flecha" aria-hidden="true">
                  <span className="material-symbols-outlined">arrow_outward</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --- Productos destacados --- */}
      <section className="home__seccion">
        <div className="home__productos-encabezado">
          <div>
            <span className="ui-badge home__eyebrow-simple">Colección especializada</span>
            <h2 className="home__seccion-titulo">Nuestros arreglos florales</h2>
            <p className="home__seccion-subtitulo">
              Descubre creaciones botánicas concebidas para perdurar en el recuerdo.
            </p>
          </div>
          <Link to="/catalogo" className="ui-btn ui-btn--rosa">
            <span>Explorar colección completa</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>

        {productos.length > 0 ? (
          <div className="home__grid-productos">
            {productos.map((producto) => (
              <ProductoCard key={producto._id} producto={producto} />
            ))}
          </div>
        ) : (
          <p className="home__sin-productos">Aún no hay productos destacados para mostrar.</p>
        )}
      </section>

      {/* --- Sobre nosotros / Cómo funciona --- */}
      <section className="home__seccion" id="sobre-nosotros">
        <div className="home__proceso">
          <div className="home__proceso-encabezado">
            <span className="ui-badge home__eyebrow-simple">Experiencia sin esfuerzo</span>
            <h2 className="home__seccion-titulo">Cómo funciona NinaFlowers</h2>
            <p className="home__seccion-subtitulo">
              Un proceso pensado para que cada envío sea un gesto memorable de inicio a fin.
            </p>
          </div>

          <div className="home__pasos">
            <div className="home__paso home__paso--1">
              <span className="home__paso-numero">1</span>
              <span className="material-symbols-outlined">menu_book</span>
              <h3 className="home__paso-titulo">Elige tu arreglo</h3>
              <p className="home__paso-texto">
                Explora nuestro catálogo de ramos, bouquets y cajas florales de temporada
                diseñadas con variedades selectas.
              </p>
            </div>

            <div className="home__paso home__paso--2">
              <span className="home__paso-numero">2</span>
              <span className="material-symbols-outlined">volunteer_activism</span>
              <h3 className="home__paso-titulo">Preparamos con amor</h3>
              <p className="home__paso-texto">
                Floristas expertas confeccionan cada pieza floral a mano cuidando cada
                tallo, detalle, hidratación y envoltura.
              </p>
            </div>

            <div className="home__paso home__paso--3">
              <span className="home__paso-numero">3</span>
              <span className="material-symbols-outlined">local_shipping</span>
              <h3 className="home__paso-titulo">Entrega puntual</h3>
              <p className="home__paso-texto">
                Llevamos tu pedido directamente a la dirección indicada en la fecha y
                franja horaria previamente programada.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;