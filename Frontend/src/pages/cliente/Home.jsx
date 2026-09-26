import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductoCard from "../../components/cliente/ProductoCard.jsx";
import { listarProductos } from "../../services/productoService.js";
import NinaFlowersPet from "../../assets/NinaFlowersPet.png";
import Ramo1 from "../../assets/Ramo1.jpg";
import Ramo2 from "../../assets/Ramo2.jpg";
import "./Home.css";

// Mensajes del carrusel principal. Son textos de marca, no productos —
// por eso viven aquí como datos fijos y no vienen de la API.
const SLIDES = [
  {
    eyebrow: "Atelier Botánico Floral",
    titulo: "El arte de transmitir emociones con flores frescas",
    texto:
      "Diseñamos ramos y arreglos artesanales con flores seleccionadas del día, listos para llenar tus momentos especiales.",
    icono: "spa",
    imagen: NinaFlowersPet,
  },
  {
    eyebrow: "Colección de Temporada",
    titulo: "Ramos pensados para cada ocasión especial",
    texto:
      "Desde aniversarios hasta detalles espontáneos: encuentra el arreglo perfecto para regalar o regalarte.",
    icono: "favorite",
    imagen: Ramo2,
  },
  {
    eyebrow: "Compromiso Botánico",
    titulo: "Frescura garantizada por 7 días en cada entrega",
    texto:
      "Cuidamos cada tallo con conservación artesanal y empaques biodegradables, sin químicos agresivos.",
    icono: "eco",
    imagen: Ramo1,
  },
];

function Home() {
  const location = useLocation();

  // --- Carrusel ---
  const [slideActual, setSlideActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setSlideActual((actual) => (actual + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(intervalo);
  }, []);

  const irASlide = (indice) => setSlideActual(indice);
  const moverSlide = (direccion) =>
    setSlideActual((actual) => (actual + direccion + SLIDES.length) % SLIDES.length);

  // --- Productos destacados: antes llegaban por props y siempre eran [],
  // ahora Home pide sus propios productos igual que hace Catalogo.jsx.
  const [productosDestacados, setProductosDestacados] = useState([]);

  useEffect(() => {
    const cargarDestacados = async () => {
      try {
        const respuesta = await listarProductos({ page: 1, limite: 4, orden: "nombre-asc" });
        setProductosDestacados(respuesta.datos || []);
      } catch (err) {
        console.error("No se pudieron cargar los productos destacados:", err.message);
      }
    };
    cargarDestacados();
  }, []);

  // Si alguien llega con /#sobre-nosotros (por ejemplo desde el Navbar
  // estando en otra página), baja el scroll hasta esa sección al montar.
  useEffect(() => {
    if (location.hash === "#sobre-nosotros") {
      document.getElementById("sobre-nosotros")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  return (
    <main className="home">
      {/* --- Hero / Carrusel --- */}
      <section className="home__hero">
        <div className="home__carrusel">
          {SLIDES.map((slide, indice) => (
            <div
              key={slide.titulo}
              className={`home__slide home__slide--${indice + 1} ${
                indice === slideActual ? "home__slide--activa" : ""
              }`}
              // CAMBIO: si el slide trae "imagen" (como el primero, con
              // NinaFlowersPet), se pinta como fondo inline. Si no la trae
              // (slides 2 y 3), no se pasa "style" y se queda el gradiente
              // que ya define .home__slide--2 / .home__slide--3 en el CSS.
              style={slide.imagen ? { backgroundImage: `url(${slide.imagen})` } : undefined}
            >
              <div className="home__slide-contenido">
                <span className="home__eyebrow">
                  <span className="material-symbols-outlined">{slide.icono}</span>
                  {slide.eyebrow}
                </span>
                <h1 className="home__titulo">{slide.titulo}</h1>
                <p className="home__subtitulo">{slide.texto}</p>
                <div className="home__hero-acciones">
                  <Link to="/catalogo" className="home__boton-primario">
                    <span>Ver catálogo</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                  <a href="#sobre-nosotros" className="home__boton-secundario">
                    <span className="material-symbols-outlined">local_florist</span>
                    <span>Conoce el taller</span>
                  </a>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="home__flecha home__flecha--izq"
            aria-label="Slide anterior"
            onClick={() => moverSlide(-1)}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            type="button"
            className="home__flecha home__flecha--der"
            aria-label="Slide siguiente"
            onClick={() => moverSlide(1)}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          <div className="home__puntos">
            {SLIDES.map((_, indice) => (
              <button
                key={indice}
                type="button"
                aria-label={`Ir al slide ${indice + 1}`}
                className={`home__punto ${indice === slideActual ? "home__punto--activo" : ""}`}
                onClick={() => irASlide(indice)}
              />
            ))}
          </div>
        </div>

        <div className="home__pilares-franja">
          <div className="home__pilares">
            <div className="home__pilar">
              <div className="home__pilar-icono home__pilar-icono--verde">
                <span className="material-symbols-outlined">filter_vintage</span>
              </div>
              <div>
                <p className="home__pilar-titulo">Corte Diario</p>
                <p className="home__pilar-texto">Flores frescas cortadas a diario</p>
              </div>
            </div>

            <div className="home__pilar">
              <div className="home__pilar-icono home__pilar-icono--rosa">
                <span className="material-symbols-outlined">brush</span>
              </div>
              <div>
                <p className="home__pilar-titulo">Arte Manual</p>
                <p className="home__pilar-texto">Preparación artesanal cuidadosa</p>
              </div>
            </div>

            <div className="home__pilar">
              <div className="home__pilar-icono home__pilar-icono--neutro">
                <span className="material-symbols-outlined">schedule_send</span>
              </div>
              <div>
                <p className="home__pilar-titulo">Puntualidad</p>
                <p className="home__pilar-texto">Entregas programadas a domicilio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Productos destacados --- */}
      <section className="home__productos">
        <div className="home__productos-contenedor">
          <div className="home__productos-encabezado">
            <div>
              <span className="home__eyebrow-simple">Colección Especializada</span>
              <h2 className="home__seccion-titulo">Nuestros arreglos florales</h2>
              <p className="home__seccion-subtitulo">
                Descubre creaciones botánicas concebidas para perdurar en el recuerdo.
              </p>
            </div>
            <Link to="/catalogo" className="home__enlace-explorar">
              <span>Explorar colección completa</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          {productosDestacados.length > 0 ? (
            <div className="home__grid-productos">
              {productosDestacados.map((producto) => (
                <ProductoCard key={producto._id} producto={producto} />
              ))}
            </div>
          ) : (
            <p className="home__sin-productos">Aún no hay productos destacados para mostrar.</p>
          )}
        </div>
      </section>

      {/* --- Sobre nosotros / Cómo funciona --- */}
      <section className="home__proceso" id="sobre-nosotros">
        <div className="home__proceso-contenedor">
          <div className="home__proceso-encabezado">
            <span className="home__eyebrow-simple home__eyebrow-simple--rosa">
              Experiencia Sin Esfuerzo
            </span>
            <h2 className="home__seccion-titulo">Cómo funciona NinaFlowers</h2>
            <p className="home__seccion-subtitulo">
              Un proceso pensado para que cada envío sea un gesto memorable de inicio a fin.
            </p>
          </div>

          <div className="home__pasos">
            <div className="home__paso">
              <div className="home__paso-icono home__paso-icono--verde">
                <span className="material-symbols-outlined">menu_book</span>
                <span className="home__paso-numero home__paso-numero--verde">1</span>
              </div>
              <h3 className="home__paso-titulo">Elige tu arreglo</h3>
              <p className="home__paso-texto">
                Explora nuestro catálogo de ramos, bouquets y cajas florales de temporada
                diseñadas con variedades selectas.
              </p>
            </div>

            <div className="home__paso">
              <div className="home__paso-icono home__paso-icono--rosa">
                <span className="material-symbols-outlined">volunteer_activism</span>
                <span className="home__paso-numero home__paso-numero--rosa">2</span>
              </div>
              <h3 className="home__paso-titulo">Preparamos con amor</h3>
              <p className="home__paso-texto">
                Floristas expertas confeccionan cada pieza floral a mano cuidando cada
                tallo, detalle, hidratación y envoltura.
              </p>
            </div>

            <div className="home__paso">
              <div className="home__paso-icono home__paso-icono--neutro">
                <span className="material-symbols-outlined">local_shipping</span>
                <span className="home__paso-numero home__paso-numero--neutro">3</span>
              </div>
              <h3 className="home__paso-titulo">Entrega puntual</h3>
              <p className="home__paso-texto">
                Llevamos tu pedido directamente a la dirección indicada en la fecha y
                franja horaria previamente programada.
              </p>
            </div>
          </div>

          <div className="home__banner">
            <div className="home__banner-info">
              <div className="home__banner-icono">
                <span className="material-symbols-outlined">card_giftcard</span>
              </div>
              <div>
                <h4 className="home__banner-titulo">¿Deseas una dedicatoria escrita a mano?</h4>
                <p className="home__banner-texto">
                  Cada arreglo incluye una tarjeta de caligrafía botánica sin costo adicional.
                </p>
              </div>
            </div>
            <Link to="/catalogo" className="home__banner-boton">
              Personalizar pedido
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;