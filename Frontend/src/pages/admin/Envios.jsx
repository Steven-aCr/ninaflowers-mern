import { useCallback, useEffect, useState } from "react";
import * as envioService from "../../services/envioService.js";
import TablaEnvios from "../../components/admin/TablaEnvios.jsx";
import ModalAdmin from "../../components/admin/ModalAdmin.jsx";
import TarjetaMetrica from "../../components/admin/TarjetaMetrica.jsx";
import TabsEstado from "../../components/admin/TabsEstado.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import { TIPOS_ENVIO } from "../../utils/constantes.js";
import { idCorto } from "../../utils/formatosAdmin.js";

const VALORES_TIPO = TIPOS_ENVIO.map((t) => t.valor);

function Envios() {
  const [envios, setEnvios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [tipo, setTipo] = useState(""); // "" = todos
  const [conteos, setConteos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [costo, setCosto] = useState(0);
  const [toast, setToast] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const resultado = await envioService.listarEnvios({
        page: pagina,
        limite: 10,
        tipo: tipo || undefined,
      });
      setEnvios(resultado.datos);
      setTotalPaginas(Math.max(1, resultado.totalPag));
    } catch {
      setToast("No se pudieron cargar los envíos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, tipo]);

  const cargarConteos = useCallback(async () => {
    try {
      setConteos(await envioService.contarEnviosPorTipo(VALORES_TIPO));
    } catch {
      setConteos(null);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { cargarConteos(); }, [cargarConteos]);

  const actualizarTodo = () => {
    cargar();
    cargarConteos();
  };

  const abrir = (envio) => {
    setEditando(envio);
    setNuevoTipo(envio.tipo);
    setCosto(envio.costoEnvio);
  };

  const guardar = async () => {
    setGuardando(true);
    try {
      await envioService.actualizarEnvio(editando._id, {
        tipo: nuevoTipo,
        costoEnvio: Number(costo),
      });
      setEditando(null);
      setToast("Envío actualizado.");
      await Promise.all([cargar(), cargarConteos()]);
    } catch (error) {
      setToast(error.response?.data?.error || "No se pudo actualizar el envío.");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPestana = (valor) => {
    setTipo(valor);
    setPagina(1);
  };

  const total = conteos ? VALORES_TIPO.reduce((suma, t) => suma + (conteos[t] ?? 0), 0) : null;
  const mostrar = (numero) => (numero === null || numero === undefined ? "—" : numero);

  const opciones = [
    { valor: "", etiqueta: "Todos", cantidad: total },
    ...TIPOS_ENVIO.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta, cantidad: conteos?.[t.valor] })),
  ];

  // Retiro y zona cubierta tienen tarifa fija (la define el backend); solo "fuera de zona" se cotiza.
  const esFueraDeZona = nuevoTipo === "fuera_zona";
  const tarifaFija = TIPOS_ENVIO.find((t) => t.valor === nuevoTipo)?.costo ?? 0;

  return (
    <>
      <section className="admin-stats" aria-label="Resumen de envíos">
        <TarjetaMetrica etiqueta="Total de envíos" valor={mostrar(total)} nota="Registrados en el sistema" />
        <TarjetaMetrica etiqueta="Retiro en tienda" valor={mostrar(conteos?.retiro_tienda)} nota="Sin costo de envío" />
        <TarjetaMetrica etiqueta="Zona cubierta" valor={mostrar(conteos?.zona_cubierta)} nota="Tarifa fija" />
        <TarjetaMetrica etiqueta="Fuera de zona" valor={mostrar(conteos?.fuera_zona)} nota="Costo cotizado por el administrador" />
      </section>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2 className="admin-panel__titulo">Lista de envíos</h2>
            <p className="admin-panel__sub">Administra la modalidad y el costo de entrega.</p>
          </div>
          <div className="admin-panel__acciones">
            <button type="button" className="admin-btn admin-btn--claro" onClick={actualizarTodo}>
              <span className="material-symbols-outlined">refresh</span>
              Actualizar
            </button>
          </div>
        </div>

        <div className="admin-toolbar">
          <TabsEstado opciones={opciones} activo={tipo} onCambiar={cambiarPestana} />
        </div>

        {cargando ? (
          <Loader texto="Cargando envíos..." />
        ) : (
          <>
            <TablaEnvios envios={envios} onEditar={abrir} />
            <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiarPagina={setPagina} />
          </>
        )}
      </section>

      {editando && (
        <ModalAdmin titulo={`Editar envío ${idCorto(editando._id)}`} onCerrar={() => setEditando(null)} cerrarBloqueado={guardando}>
          <div className="admin-modal__fila">
            <label className="admin-modal__campo">
              Tipo de envío
              <select value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)}>
                {TIPOS_ENVIO.map((t) => (
                  <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
                ))}
              </select>
            </label>

            <label className="admin-modal__campo">
              Costo (USD)
              <input
                type="number"
                min="0"
                step="0.01"
                value={esFueraDeZona ? costo : tarifaFija}
                onChange={(e) => setCosto(e.target.value)}
                disabled={!esFueraDeZona}
              />
            </label>
          </div>

          <p className="admin-modal__aviso">
            Las tarifas de retiro en tienda y zona cubierta las determina el backend. El costo manual solo aplica
            a “fuera de zona”; al cotizarlo, el pedido pendiente de cotización pasa a pendiente y el cliente podrá pagarlo.
          </p>

          <div className="admin-modal__acciones">
            <button type="button" className="admin-btn admin-btn--borde" disabled={guardando} onClick={() => setEditando(null)}>
              Cancelar
            </button>
            <button type="button" className="admin-btn" disabled={guardando} onClick={guardar}>
              {guardando ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </ModalAdmin>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Envios;