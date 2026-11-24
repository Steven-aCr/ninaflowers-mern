import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { listarProductos } from "../../services/productoService.js";
import { listarInventarioBajoMinimo } from "../../services/inventarioService.js";
import { listarUsuarios } from "../../services/usuarioService.js";
import { obtenerReportePagos } from "../../services/pagoService.js";
import * as pedidoService from "../../services/pedidoService.js";

import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import Loader from "../../components/common/Loader.jsx";
import { ESTADOS_PEDIDO, ESTADOS_EN_CURSO } from "../../utils/constantes.js";
import { etiquetaEstado, formatearFechaCorta, idCorto, nombreCompleto } from "../../utils/formatosAdmin.js";

import "./Dashboard.css";

const VALORES_ESTADO = ESTADOS_PEDIDO.map((e) => e.valor);
const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];

const ACCESOS = [
  { ruta: "/admin/productos", icono: "local_florist", texto: "Productos" },
  { ruta: "/admin/pedidos", icono: "receipt_long", texto: "Pedidos" },
  { ruta: "/admin/inventario", icono: "inventory_2", texto: "Inventario" },
  { ruta: "/admin/usuarios", icono: "group", texto: "Usuarios" },
  { ruta: "/admin/pagos", icono: "credit_card", texto: "Pagos" },
  { ruta: "/admin/envios", icono: "local_shipping", texto: "Envíos" },
];

// "2026-11-05" para el filtro de fechas del reporte de pagos (AAAA-MM-DD, hora local).
const aFechaISO = (fecha) =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;

const formatearMoneda = (cantidad) =>
  new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(cantidad || 0);

// Calendario del mes actual. Marca los días con entregas programadas de pedidos
// que siguen en curso (a partir de fechaEntregaEstimada).
function CalendarioEntregas({ pedidos }) {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();

  const diaSemanaPrimerDia = new Date(anio, mes, 1).getDay();
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const nombreMes = new Intl.DateTimeFormat("es-SV", { month: "long" }).format(hoy);

  const entregasPorDia = {};
  pedidos.forEach((pedido) => {
    if (!ESTADOS_EN_CURSO.includes(pedido.estadoPedido)) return;
    const fecha = new Date(pedido.fechaEntregaEstimada);
    if (fecha.getFullYear() === anio && fecha.getMonth() === mes) {
      entregasPorDia[fecha.getDate()] = (entregasPorDia[fecha.getDate()] || 0) + 1;
    }
  });

  return (
    <div className="dashboard-calendario">
      <div className="dashboard-calendario__grid">
        {DIAS_SEMANA.map((dia, indice) => (
          <span key={indice} className="dashboard-calendario__dia dashboard-calendario__dia--cabecera">{dia}</span>
        ))}

        {Array.from({ length: diaSemanaPrimerDia }, (_, indice) => (
          <span key={`vacio-${indice}`} />
        ))}

        {Array.from({ length: diasDelMes }, (_, indice) => {
          const dia = indice + 1;
          const entregas = entregasPorDia[dia];
          const clases = ["dashboard-calendario__dia"];
          if (entregas) clases.push("dashboard-calendario__dia--marcado");
          if (dia === hoy.getDate()) clases.push("dashboard-calendario__dia--hoy");

          return (
            <span
              key={dia}
              className={clases.join(" ")}
              title={entregas ? `${entregas} ${entregas === 1 ? "entrega" : "entregas"}` : undefined}
            >
              {dia}
            </span>
          );
        })}
      </div>
      <p className="dashboard-calendario__mes">{nombreMes}</p>
    </div>
  );
}

function Dashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // null = ese dato no se pudo cargar (la tarjeta muestra "—" en vez de un 0 engañoso).
  const [totales, setTotales] = useState({ productos: null, usuarios: null, stockBajo: null });
  const [conteos, setConteos] = useState(null); // pedidos por estado
  const [reporteMes, setReporteMes] = useState(null); // pagos completados del mes
  const [pedidos, setPedidos] = useState([]); // los 100 más recientes (tabla y calendario)
  const [inventarioBajo, setInventarioBajo] = useState([]);

  const cargarDashboard = useCallback(async () => {
    setCargando(true);
    setError("");

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const resultados = await Promise.allSettled([
      listarProductos({ page: 1, limite: 1 }),
      listarUsuarios({ page: 1, limite: 1 }),
      pedidoService.listarPedidos({ page: 1, limite: 100 }),
      listarInventarioBajoMinimo(),
      pedidoService.contarPedidosPorEstado(VALORES_ESTADO),
      obtenerReportePagos({ fechaDesde: aFechaISO(inicioMes), fechaHasta: aFechaISO(hoy) }),
    ]);

    const valor = (resultado) => (resultado.status === "fulfilled" ? resultado.value : null);
    const [productos, usuarios, listaPedidos, inventario, conteoEstados, reporte] = resultados.map(valor);

    const totalDe = (respuesta) => (respuesta ? respuesta.totalDoc ?? respuesta.datos?.length ?? 0 : null);

    setTotales({
      productos: totalDe(productos),
      usuarios: totalDe(usuarios),
      stockBajo: totalDe(inventario),
    });
    setPedidos(listaPedidos?.datos || []);
    setInventarioBajo((inventario?.datos || []).slice(0, 5));
    setConteos(conteoEstados);
    setReporteMes(reporte);

    if (resultados.some((r) => r.status === "rejected")) {
      setError("Algunos datos no se pudieron cargar. Puedes intentar de nuevo con “Actualizar”.");
    }
    setCargando(false);
  }, []);

  useEffect(() => { cargarDashboard(); }, [cargarDashboard]);

  if (cargando) return <Loader texto="Cargando dashboard..." />;

  const totalPedidos = conteos ? VALORES_ESTADO.reduce((suma, e) => suma + (conteos[e] ?? 0), 0) : null;
  const pedidosEnCurso = conteos ? ESTADOS_EN_CURSO.reduce((suma, e) => suma + (conteos[e] ?? 0), 0) : null;
  const mostrar = (numero) => (numero === null ? "—" : numero);
  const pedidosRecientes = pedidos.slice(0, 5);

  return (
    <>
      <div className="dashboard-intro">
        <p>
          Bienvenido, <strong>{usuario?.nombre || "Administrador"}</strong>. Aquí tienes un resumen de NinaFlowers.
        </p>
        <button type="button" className="admin-btn admin-btn--borde" onClick={cargarDashboard}>
          <span className="material-symbols-outlined">refresh</span>
          Actualizar
        </button>
      </div>

      {error && <p className="dashboard-error" role="alert">{error}</p>}

      {/* ---------- Tarjetas ---------- */}
      <section className="admin-stats" aria-label="Resumen general">
        <TarjetaMetrica
          etiqueta="Pedidos en curso"
          valor={mostrar(pedidosEnCurso)}
          nota={totalPedidos === null ? undefined : `${totalPedidos} pedidos registrados`}
        />
        <TarjetaMetrica
          etiqueta="Ingresos del mes"
          valor={reporteMes ? formatearMoneda(reporteMes.totalRecaudado) : "—"}
          nota={reporteMes ? `${reporteMes.pagosCompletados} pagos completados` : undefined}
        />
        <TarjetaMetrica etiqueta="Productos" valor={mostrar(totales.productos)} nota="Productos registrados" />
        <TarjetaMetrica etiqueta="Usuarios" valor={mostrar(totales.usuarios)} nota="Clientes y administradores" />
      </section>

      {/* ---------- Pedidos recientes + stock bajo ---------- */}
      <section className="dashboard-fila">
        <article className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <h2 className="admin-panel__titulo">Pedidos recientes</h2>
              <p className="admin-panel__sub">Últimos pedidos registrados</p>
            </div>
            <button type="button" className="admin-btn admin-btn--claro admin-btn--sm" onClick={() => navigate("/admin/pedidos")}>
              Ver todos
            </button>
          </div>

          {pedidosRecientes.length === 0 ? (
            <p className="admin-vacio">No hay pedidos registrados.</p>
          ) : (
            <div className="admin-tabla-wrap">
              <table className="admin-tabla">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th className="admin-tabla__num">Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidosRecientes.map((pedido) => (
                    <tr key={pedido._id}>
                      <td className="admin-tabla__id">{idCorto(pedido._id)}</td>
                      <td>{nombreCompleto(pedido.usuarioId)}</td>
                      <td>{formatearFechaCorta(pedido.createdAt || pedido.fechaPedido)}</td>
                      <td className="admin-tabla__num">{formatearMoneda(pedido.total)}</td>
                      <td>
                        <span className={`admin-pill admin-pill--${pedido.estadoPedido || "pendiente"}`}>
                          {etiquetaEstado(pedido.estadoPedido || "pendiente")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <h2 className="admin-panel__titulo">Stock bajo</h2>
              <p className="admin-panel__sub">Productos que requieren atención</p>
            </div>
            <span className="admin-pill admin-pill--alerta">{mostrar(totales.stockBajo)}</span>
          </div>

          {inventarioBajo.length === 0 ? (
            <p className="admin-vacio">No hay productos con stock bajo.</p>
          ) : (
            <ul className="dashboard-stock">
              {inventarioBajo.map((item) => (
                <li key={item._id} className="dashboard-stock__item">
                  <div>
                    <span className="admin-tabla__principal">{item.productoId?.nombre || "Producto"}</span>
                    <span className="admin-tabla__secundario">Mínimo: {item.stockMinimo ?? 0}</span>
                  </div>
                  <strong className="dashboard-stock__cantidad">{item.stock ?? 0}</strong>
                </li>
              ))}
            </ul>
          )}

          <button type="button" className="admin-btn admin-btn--borde admin-btn--full dashboard-stock__boton" onClick={() => navigate("/admin/inventario")}>
            Ver inventario
          </button>
        </article>
      </section>

      {/* ---------- Pedidos por estado + calendario ---------- */}
      <section className="dashboard-fila dashboard-fila--iguales">
        <article className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <h2 className="admin-panel__titulo">Pedidos por estado</h2>
              <p className="admin-panel__sub">Distribución del total de pedidos</p>
            </div>
            <span className="dashboard-flor" aria-hidden="true">✿</span>
          </div>

          {conteos === null ? (
            <p className="admin-vacio">No se pudo cargar la distribución.</p>
          ) : (
            <ul className="dashboard-estados">
              {ESTADOS_PEDIDO.map((estado) => {
                const cantidad = conteos[estado.valor] ?? 0;
                const porcentaje = totalPedidos ? Math.round((cantidad / totalPedidos) * 100) : 0;
                return (
                  <li key={estado.valor}>
                    <div className="dashboard-estados__fila">
                      <span>{estado.etiqueta}</span>
                      <strong>{cantidad}</strong>
                    </div>
                    <div
                      className="dashboard-progreso"
                      role="progressbar"
                      aria-label={estado.etiqueta}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={porcentaje}
                    >
                      <span style={{ width: `${porcentaje}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="admin-panel">
          <div className="admin-panel__head">
            <div>
              <h2 className="admin-panel__titulo">Calendario de entregas</h2>
              <p className="admin-panel__sub">Días con entregas programadas este mes</p>
            </div>
          </div>
          <CalendarioEntregas pedidos={pedidos} />
        </article>
      </section>

      {/* ---------- Accesos rápidos ---------- */}
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__titulo">Accesos rápidos</h2>
            <p className="admin-panel__sub">Administración del sistema</p>
          </div>
        </div>

        <div className="dashboard-accesos">
          {ACCESOS.map((acceso) => (
            <button key={acceso.ruta} type="button" className="dashboard-accesos__boton" onClick={() => navigate(acceso.ruta)}>
              <span className="material-symbols-outlined" aria-hidden="true">{acceso.icono}</span>
              <span>{acceso.texto}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

export default Dashboard;