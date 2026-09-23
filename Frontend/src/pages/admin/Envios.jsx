import { useCallback, useEffect, useState } from "react";
import * as envioService from "../../services/envioService.js";
import TablaEnvios from "../../components/admin/TablaEnvios.jsx";
import Paginacion from "../../components/common/Paginacion.jsx";
import Loader from "../../components/common/Loader.jsx";
import Toast from "../../components/common/Toast.jsx";
import "./Pedidos.css";

const TIPOS = ["retiro_tienda", "zona_cubierta", "fuera_zona"];

function Envios() {
  const [envios, setEnvios] = useState([]),
    [pagina, setPagina] = useState(1),
    [total, setTotal] = useState(1),
    [tipo, setTipo] = useState(""),
    [cargando, setCargando] = useState(true),
    [editando, setEditando] = useState(null),
    [nuevoTipo, setNuevoTipo] = useState(""),
    [costo, setCosto] = useState(0),
    [toast, setToast] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await envioService.listarEnvios({
        page: pagina,
        limite: 10,
        tipo: tipo || undefined,
      });
      setEnvios(r.datos);
      setTotal(Math.max(1, r.totalPag));
    } catch {
      setToast("No se pudieron cargar los envíos.");
    } finally {
      setCargando(false);
    }
  }, [pagina, tipo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrir = (e) => {
    setEditando(e);
    setNuevoTipo(e.tipo);
    setCosto(e.costoEnvio);
  };

  const guardar = async () => {
    try {
      await envioService.actualizarEnvio(editando._id, {
        tipo: nuevoTipo,
        costoEnvio: Number(costo),
      });
      setEditando(null);
      setToast("Envío actualizado.");
      cargar();
    } catch (e) {
      setToast(e.response?.data?.error || "No se pudo actualizar el envío.");
    }
  };

  return (
    <div className="gestion-page">
      <header className="gestion-header">
        <div>
          <p className="gestion-eyebrow">Logística</p>
          <h1>Envíos</h1>
          <p>Administra modalidad y costo de entrega.</p>
        </div>
      </header>

      <div className="gestion-filtros">
        <label>
          Tipo
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            {TIPOS.map((x) => (
              <option key={x} value={x}>
                {x.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button onClick={cargar}>Actualizar</button>
      </div>

      {cargando ? (
        <Loader texto="Cargando envíos..." />
      ) : (
        <>
          <TablaEnvios envios={envios} onEditar={abrir} />
          <Paginacion
            paginaActual={pagina}
            totalPaginas={total}
            onCambiarPagina={setPagina}
          />
        </>
      )}

      {editando && (
        <div
          className="gestion-overlay"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setEditando(null)
          }
        >
          <section className="gestion-modal">
            <div className="gestion-modal__head">
              <div>
                <p className="gestion-eyebrow">
                  Envío #{editando._id.slice(-6).toUpperCase()}
                </p>
                <h2>Editar entrega</h2>
              </div>
              <button
                className="gestion-cerrar"
                onClick={() => setEditando(null)}
              >
                ×
              </button>
            </div>
            <div className="gestion-card">
              <div className="gestion-form-row">
                <select
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value)}
                >
                  {TIPOS.map((x) => (
                    <option key={x} value={x}>
                      {x.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  disabled={nuevoTipo !== "fuera_zona"}
                />
                <button onClick={guardar}>Guardar</button>
              </div>
              <small>
                Las tarifas de retiro y zona cubierta las determina el backend.
                El costo manual aplica a fuera de zona.
              </small>
            </div>
          </section>
        </div>
      )}

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </div>
  );
}

export default Envios;