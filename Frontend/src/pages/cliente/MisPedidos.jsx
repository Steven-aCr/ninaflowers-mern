import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Buscador from "../../components/common/Buscador.jsx";
import { ESTADOS_EN_CURSO, obtenerEstadoPedido } from "../../utils/constantes.js";
import { formatearPrecio } from "../../utils/formatearPrecio.js";
import "./MisPedidos.css";

const TABS = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "en_curso", etiqueta: "En curso" },
  { valor: "entregado", etiqueta: "Entregados" },
  { valor: "cancelado", etiqueta: "Cancelados" },
];

// NOTA: recibe "pedidos" por props (arreglo vacío por defecto), igual que
// Home/Catalogo. Cuando conectemos pedidoService, esta página hará
// pedidoService.listarPedido({ usuarioId }) en un useEffect y "pedidos"
// pasa de prop a estado local. La forma de cada pedido es la de tu
// pedidoModel tal cual (productos, direccionEntrega, estadoPedido, etc.).
function MisPedidos({ pedidos = [] }) {
  const [tab, setTab] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const contarPorTab = (valorTab) => {
    if (valorTab === "todos") return pedidos.length;
    if (valorTab === "en_curso") {
      return pedidos.filter((p) => ESTADOS_EN_CURSO.includes(p.estadoPedido)).length;
    }
    return pedidos.filter((p) => p.estadoPedido === valorTab).length;
  };

  const pedidosFiltrados = useMemo(() => {
    let resultado = pedidos;

    if (tab === "en_curso") {
      resultado = resultado.filter((p) => ESTADOS_EN_CURSO.includes(p.estadoPedido));
    } else if (tab !== "todos") {
      resultado = resultado.filter((p) => p.estadoPedido === tab);
    }

    if (busqueda.trim() !== "") {
      const termino = busqueda.trim().toLowerCase();
      resultado = resultado.filter(
        (pedido) =>
          pedido._id.toLowerCase().includes(termino) ||
          pedido.productos.some((item) => item.nombreProducto.toLowerCase().includes(termino))
      );
    }

    return resultado;
  }, [pedidos, tab, busqueda]);

  return (
    <main className="mis-pedidos">
      <div className="mis-pedidos__contenedor">
        <header className="mis-pedidos__encabezado">
          <h1>Historial de mis pedidos</h1>
          <p>Consulta el estado y los detalles de cada entrega floral.</p>
        </header>

        <div className="mis-pedidos__controles">
          <div className="mis-pedidos__tabs">
            {TABS.map((t) => (
              <button
                key={t.valor}
                type="button"
                className={
                  tab === t.valor ? "mis-pedidos__tab mis-pedidos__tab--activo" : "mis-pedidos__tab"
                }
                onClick={() => setTab(t.valor)}
              >
                <span>{t.etiqueta}</span>
                <span className="mis-pedidos__tab-contador">{contarPorTab(t.valor)}</span>
              </button>
            ))}
          </div>

          <div className="mis-pedidos__buscador">
            <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar por N° o flor..." />
          </div>
        </div>

        {pedidosFiltrados.length > 0 ? (
          <div className="mis-pedidos__lista">
            {pedidosFiltrados.map((pedido) => {
              const estado = obtenerEstadoPedido(pedido.estadoPedido);
              return (
                <article key={pedido._id} className="pedido-card">
                  <div className="pedido-card__encabezado">
                    <span className="pedido-card__id">#{pedido._id.slice(-6).toUpperCase()}</span>
                    <span className="pedido-card__fecha">
                      {new Date(pedido.fechaPedido).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {estado && (
                      <span className={`pedido-card__badge pedido-card__badge--${estado.valor}`}>
                        <span className="material-symbols-outlined">{estado.icono}</span>
                        {estado.etiqueta}
                      </span>
                    )}
                  </div>

                  <div className="pedido-card__cuerpo">
                    <div className="pedido-card__productos">
                      {pedido.productos.map((item, indice) => (
                        <p key={indice}>
                          {item.cantidad}× {item.nombreProducto}
                        </p>
                      ))}
                    </div>

                    <div className="pedido-card__direccion">
                      <span className="material-symbols-outlined">location_on</span>
                      <div>
                        <p>{pedido.direccionEntrega.linea1}</p>
                        <p>{pedido.direccionEntrega.ciudad}</p>
                      </div>
                    </div>

                    <div className="pedido-card__total">
                      <span>Total</span>
                      <p>{formatearPrecio(pedido.total)}</p>
                    </div>
                  </div>

                  <Link to={`/mis-pedidos/${pedido._id}`} className="pedido-card__boton">
                    <span>Ver detalle</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mis-pedidos__vacio">
            <span className="material-symbols-outlined">local_florist</span>
            <h3>Todavía no tienes pedidos aquí</h3>
            <p>Cuando hagas un pedido, aparecerá en este historial.</p>
            <Link to="/catalogo">Ver catálogo</Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default MisPedidos;
