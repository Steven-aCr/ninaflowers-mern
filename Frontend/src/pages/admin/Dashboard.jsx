import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { listarProductos } from "../../services/productoService.js";
import { listarInventarioBajoMinimo } from "../../services/inventarioService.js";
import { listarUsuarios } from "../../services/usuarioService.js";
import * as pedidoService from "../../services/pedidoService.js";

import "./Dashboard.css";

function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [resumen, setResumen] = useState({
    productos: 0,
    usuarios: 0,
    pedidos: 0,
    ventas: 0,
    stockBajo: 0,
  });

  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [inventarioBajo, setInventarioBajo] = useState([]);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      setError("");

      const resultados = await Promise.allSettled([
        listarProductos({
          pagina: 1,
          limite: 1,
        }),

        listarUsuarios({
          pagina: 1,
          limite: 1,
        }),

        pedidoService.listarPedidos({
          pagina: 1,
          limite: 5,
        }),

        listarInventarioBajoMinimo(),
      ]);

      const productos =
        resultados[0].status === "fulfilled"
          ? resultados[0].value
          : null;

      const usuarios =
        resultados[1].status === "fulfilled"
          ? resultados[1].value
          : null;

      const pedidos =
        resultados[2].status === "fulfilled"
          ? resultados[2].value
          : null;

      const inventario =
        resultados[3].status === "fulfilled"
          ? resultados[3].value
          : null;

      const listaPedidos =
        pedidos?.datos ||
        pedidos?.pedidos ||
        (Array.isArray(pedidos) ? pedidos : []);

      const listaInventario =
        inventario?.datos ||
        (Array.isArray(inventario) ? inventario : []);

      /*
       * Se calcula utilizando los pedidos obtenidos.
       * Si posteriormente creamos un endpoint de estadísticas,
       * este cálculo puede trasladarse al backend.
       */
      const ventas = listaPedidos
        .filter((pedido) => pedido.estadoPedido !== "cancelado")
        .reduce(
          (total, pedido) =>
            total + Number(pedido.total || 0),
          0
        );

      setResumen({
        productos:
          productos?.totalDoc ??
          productos?.total ??
          productos?.datos?.length ??
          0,

        usuarios:
          usuarios?.totalDoc ??
          usuarios?.total ??
          usuarios?.datos?.length ??
          0,

        pedidos:
          pedidos?.totalDoc ??
          pedidos?.total ??
          listaPedidos.length,

        ventas,

        stockBajo:
          inventario?.totalDoc ??
          inventario?.total ??
          listaInventario.length,
      });

      setPedidosRecientes(listaPedidos.slice(0, 5));
      setInventarioBajo(listaInventario.slice(0, 5));

    } catch (error) {
      console.error("Error cargando dashboard:", error);

      setError(
        "No se pudo cargar la información del dashboard."
      );
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (cantidad) =>
    new Intl.NumberFormat("es-SV", {
      style: "currency",
      currency: "USD",
    }).format(cantidad || 0);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Intl.DateTimeFormat("es-SV", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(fecha));
  };

  const obtenerNombreCliente = (pedido) => {
    if (pedido.usuarioId?.nombre) {
      return `${pedido.usuarioId.nombre} ${
        pedido.usuarioId.apellido || ""
      }`;
    }

    if (pedido.usuario?.nombre) {
      return `${pedido.usuario.nombre} ${
        pedido.usuario.apellido || ""
      }`;
    }

    return "Cliente";
  };

  if (cargando) {
    return (
      <div className="dashboard">
        <div className="dashboard__cargando">
          Cargando dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* ENCABEZADO */}

      <div className="dashboard__encabezado">
        <div>
          <h1>Dashboard</h1>

          <p>
            Bienvenido,{" "}
            <strong>{usuario?.nombre || "Administrador"}</strong>.
            Aquí tienes un resumen de NinaFlowers.
          </p>
        </div>

        <button
          className="dashboard__actualizar"
          onClick={cargarDashboard}
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="dashboard__error">
          {error}
        </div>
      )}

      {/* TARJETAS */}

      <section className="dashboard__tarjetas">

        <article className="dashboard-card">
          <div className="dashboard-card__icono">
            🛒
          </div>

          <div>
            <span>Pedidos</span>
            <h2>{resumen.pedidos}</h2>
            <p>Pedidos registrados</p>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__icono">
            💰
          </div>

          <div>
            <span>Ventas recientes</span>
            <h2>{formatearMoneda(resumen.ventas)}</h2>
            <p>Según pedidos consultados</p>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__icono">
            🌸
          </div>

          <div>
            <span>Productos</span>
            <h2>{resumen.productos}</h2>
            <p>Productos registrados</p>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__icono">
            👥
          </div>

          <div>
            <span>Usuarios</span>
            <h2>{resumen.usuarios}</h2>
            <p>Usuarios registrados</p>
          </div>
        </article>

      </section>

      {/* CONTENIDO */}

      <section className="dashboard__contenido">

        {/* PEDIDOS RECIENTES */}

        <div className="dashboard-panel dashboard-panel--pedidos">

          <div className="dashboard-panel__encabezado">
            <div>
              <h2>Pedidos recientes</h2>
              <p>Últimos pedidos registrados</p>
            </div>

            <button
              onClick={() => navigate("/admin/pedidos")}
            >
              Ver todos
            </button>
          </div>

          {pedidosRecientes.length === 0 ? (
            <div className="dashboard__vacio">
              No hay pedidos registrados.
            </div>
          ) : (
            <div className="dashboard-tabla-contenedor">
              <table className="dashboard-tabla">

                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosRecientes.map((pedido) => (
                    <tr key={pedido._id}>

                      <td>
                        <strong>
                          #{pedido._id?.slice(-6).toUpperCase()}
                        </strong>
                      </td>

                      <td>
                        {obtenerNombreCliente(pedido)}
                      </td>

                      <td>
                        {formatearFecha(
                          pedido.createdAt ||
                          pedido.fechaPedido
                        )}
                      </td>

                      <td>
                        {formatearMoneda(pedido.total)}
                      </td>

                      <td>
                        <span
                          className={`dashboard-estado dashboard-estado--${
                            pedido.estadoPedido || "pendiente"
                          }`}
                        >
                          {(pedido.estadoPedido || "pendiente")
                            .replaceAll("_", " ")}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

        {/* INVENTARIO */}

        <div className="dashboard-panel">

          <div className="dashboard-panel__encabezado">
            <div>
              <h2>Stock bajo</h2>
              <p>Productos que requieren atención</p>
            </div>

            <span className="dashboard-alerta">
              {resumen.stockBajo}
            </span>
          </div>

          <div className="dashboard-stock">

            {inventarioBajo.length === 0 ? (
              <div className="dashboard__vacio">
                No hay productos con stock bajo.
              </div>
            ) : (
              inventarioBajo.map((item) => (
                <div
                  className="dashboard-stock__item"
                  key={item._id}
                >
                  <div>
                    <strong>
                      {item.productoId?.nombre ||
                        item.producto?.nombre ||
                        "Producto"}
                    </strong>

                    <span>
                      Mínimo: {item.stockMinimo ?? 0}
                    </span>
                  </div>

                  <div className="dashboard-stock__cantidad">
                    {item.stock ?? 0}
                    <small> unidades</small>
                  </div>
                </div>
              ))
            )}

          </div>

          <button
            className="dashboard-stock__boton"
            onClick={() => navigate("/admin/inventario")}
          >
            Ver inventario
          </button>

        </div>

      </section>

      {/* ACCESOS RÁPIDOS */}

      <section className="dashboard-panel dashboard-accesos">

        <div className="dashboard-panel__encabezado">
          <div>
            <h2>Accesos rápidos</h2>
            <p>Administración del sistema</p>
          </div>
        </div>

        <div className="dashboard-accesos__grid">

          <button onClick={() => navigate("/admin/productos")}>
            <span>🌷</span>
            Productos
          </button>

          <button onClick={() => navigate("/admin/pedidos")}>
            <span>📦</span>
            Pedidos
          </button>

          <button onClick={() => navigate("/admin/inventario")}>
            <span>📋</span>
            Inventario
          </button>

          <button onClick={() => navigate("/admin/usuarios")}>
            <span>👤</span>
            Usuarios
          </button>

          <button onClick={() => navigate("/admin/pagos")}>
            <span>💳</span>
            Pagos
          </button>

          <button onClick={() => navigate("/admin/envios")}>
            <span>🚚</span>
            Envíos
          </button>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;