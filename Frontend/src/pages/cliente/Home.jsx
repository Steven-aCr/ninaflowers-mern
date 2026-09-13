import { Link } from "react-router-dom";
import ProductoCard from "../../components/cliente/ProductoCard.jsx";
import "./Home.css";

// productosDestacados llega como prop: por ahora un arreglo vacío por defecto.
// Cuando construyamos la conexión con productoService, Home usará useEffect
// para pedir los productos reales y pasarlos aquí (o los pedirá directamente
// si decidimos que Home los consulte por sí misma).
function Home({ productosDestacados = [] }) {
  return (
    <main className="home">
      {/* --- Hero --- */}
      <section className="home__hero">
        <div className="home__hero-contenedor">
          <div className="home__hero-texto">
            <span className="home__eyebrow">
              <span className="material-symbols-outlined">spa</span>
              Atelier Botánico Floral
            </span>

            <h1 className="home__titulo">
              El arte de transmitir emociones con flores frescas
            </h1>

            <p className="home__subtitulo">
              Diseñamos ramos y arreglos florales artesanales con flores seleccionadas del
              día. Llena tus momentos especiales de delicadeza, naturaleza y elegancia.
            </p>

            <div className="home__hero-acciones">
              <Link to="/catalogo" className="home__boton-primario">
                <span>Ver catálogo</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a href="#como-funciona" className="home__boton-secundario">
                <span className="material-symbols-outlined">local_florist</span>
                <span>Conoce el taller</span>
              </a>
            </div>

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

          <div className="home__hero-visual">
            <div className="home__hero-tarjeta">
              <p className="home__hero-tarjeta-eyebrow">Compromiso Nina</p>
              <p className="home__hero-tarjeta-texto">
                Frescura botánica certificada por 7 días
              </p>
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
            <p className="home__sin-productos">
              Aún no hay productos destacados para mostrar.
            </p>
          )}
        </div>
      </section>

      {/* --- Cómo funciona --- */}
      <section className="home__proceso" id="como-funciona">
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
                <h4 className="home__banner-titulo">
                  ¿Deseas una dedicatoria escrita a mano?
                </h4>
                <p className="home__banner-texto">
                  Cada arreglo incluye una tarjeta de caligrafía botánica sin costo
                  adicional.
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
