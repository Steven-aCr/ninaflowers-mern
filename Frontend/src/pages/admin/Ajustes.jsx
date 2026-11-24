import { useState } from "react";
import Toast from "../../components/common/Toast.jsx";
import "./Ajustes.css";

// ---------------------------------------------------------------------------
// Ajustes de la florería.
// OJO: el backend todavía no tiene un endpoint de configuración, así que estos
// valores se guardan en el navegador (localStorage) y sirven para este equipo.
// Cuando exista la API, solo hay que cambiar leerAjustes/guardarAjustes por
// llamadas a un servicio (por ejemplo services/ajustesService.js).
// ---------------------------------------------------------------------------

const CLAVE_AJUSTES = "ninaflowers_ajustes";

const AJUSTES_INICIALES = {
  tienda: { nombre: "NinaFlowers", telefono: "", correo: "", direccion: "" },
  entregas: {
    mismoDia: true,
    horaInicio: "09:00",
    horaFin: "18:00",
    horaLimite: "13:00",
    dias: "lunes_sabado",
  },
  tarjeta: { incluir: true, limite: 200, mensaje: "¡Con mucho cariño!" },
  notificaciones: {
    correoCliente: true,
    avisoRepartidor: false,
    alertasStock: true,
    correoAlertas: "",
  },
};

function leerAjustes() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_AJUSTES));
    if (!guardado) return AJUSTES_INICIALES;
    // Se mezcla sección por sección para que un ajuste nuevo no rompa datos viejos.
    return Object.fromEntries(
      Object.keys(AJUSTES_INICIALES).map((seccion) => [
        seccion,
        { ...AJUSTES_INICIALES[seccion], ...(guardado[seccion] || {}) },
      ])
    );
  } catch {
    return AJUSTES_INICIALES;
  }
}

function guardarAjustes(ajustes) {
  try {
    localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes));
    return true;
  } catch {
    return false;
  }
}

function Ajustes() {
  const [ajustes, setAjustes] = useState(leerAjustes);
  const [toast, setToast] = useState("");

  // Cambia un campo de una sección: cambiar("tienda", "nombre")(evento)
  const cambiar = (seccion, campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setAjustes((actual) => ({ ...actual, [seccion]: { ...actual[seccion], [campo]: valor } }));
  };

  const guardar = (mensaje, normalizar) => (e) => {
    e.preventDefault();
    const siguiente = normalizar ? normalizar(ajustes) : ajustes;
    setAjustes(siguiente);
    setToast(guardarAjustes(siguiente) ? mensaje : "No se pudo guardar en este navegador.");
  };

  // El límite de caracteres de la tarjeta debe ser un entero positivo.
  const normalizarTarjeta = (actual) => {
    const limite = Math.max(1, Math.round(Number(actual.tarjeta.limite)) || 200);
    return { ...actual, tarjeta: { ...actual.tarjeta, limite } };
  };

  const { tienda, entregas, tarjeta, notificaciones } = ajustes;

  return (
    <>
      <p className="ajustes-aviso">
        Estos ajustes se guardan en este navegador. Cuando el backend tenga un servicio de configuración
        se podrán compartir entre todos los administradores.
      </p>

      <div className="ajustes-rejilla">
        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-panel__titulo">Datos de la florería</h2>
          </div>

          <form className="ajustes-form" onSubmit={guardar("Datos de la florería guardados.")}>
            <label className="ajustes-campo">
              Nombre de la tienda
              <input value={tienda.nombre} onChange={cambiar("tienda", "nombre")} required />
            </label>

            <div className="ajustes-fila">
              <label className="ajustes-campo">
                Teléfono
                <input value={tienda.telefono} onChange={cambiar("tienda", "telefono")} />
              </label>
              <label className="ajustes-campo">
                Correo
                <input type="email" value={tienda.correo} onChange={cambiar("tienda", "correo")} />
              </label>
            </div>

            <label className="ajustes-campo">
              Dirección
              <input value={tienda.direccion} onChange={cambiar("tienda", "direccion")} />
            </label>

            <button type="submit" className="admin-btn">Guardar datos</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-panel__titulo">Horarios y entregas del mismo día</h2>
          </div>

          <form className="ajustes-form" onSubmit={guardar("Horarios guardados.")}>
            <label className="ajustes-interruptor">
              Entrega el mismo día
              <input type="checkbox" checked={entregas.mismoDia} onChange={cambiar("entregas", "mismoDia")} />
            </label>

            <div className="ajustes-fila">
              <label className="ajustes-campo">
                Entregas desde
                <input type="time" value={entregas.horaInicio} onChange={cambiar("entregas", "horaInicio")} />
              </label>
              <label className="ajustes-campo">
                Entregas hasta
                <input type="time" value={entregas.horaFin} onChange={cambiar("entregas", "horaFin")} />
              </label>
            </div>

            <div className="ajustes-fila">
              <label className="ajustes-campo">
                Hora límite para entrega el mismo día
                <input
                  type="time"
                  value={entregas.horaLimite}
                  onChange={cambiar("entregas", "horaLimite")}
                  disabled={!entregas.mismoDia}
                />
              </label>
              <label className="ajustes-campo">
                Días de entrega
                <select value={entregas.dias} onChange={cambiar("entregas", "dias")}>
                  <option value="lunes_sabado">Lunes a sábado</option>
                  <option value="lunes_domingo">Lunes a domingo</option>
                </select>
              </label>
            </div>

            <button type="submit" className="admin-btn">Guardar horarios</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-panel__titulo">Tarjetas de regalo y mensajes</h2>
          </div>

          <form className="ajustes-form" onSubmit={guardar("Configuración de tarjetas guardada.", normalizarTarjeta)}>
            <label className="ajustes-interruptor">
              Incluir tarjeta de regalo
              <input type="checkbox" checked={tarjeta.incluir} onChange={cambiar("tarjeta", "incluir")} />
            </label>

            <label className="ajustes-campo">
              Límite de caracteres
              <input
                type="number"
                min="1"
                value={tarjeta.limite}
                onChange={cambiar("tarjeta", "limite")}
                disabled={!tarjeta.incluir}
              />
            </label>

            <label className="ajustes-campo">
              Mensaje por defecto
              <textarea
                rows={3}
                value={tarjeta.mensaje}
                onChange={cambiar("tarjeta", "mensaje")}
                maxLength={Number(tarjeta.limite) > 0 ? Number(tarjeta.limite) : undefined}
                disabled={!tarjeta.incluir}
              />
            </label>

            <button type="submit" className="admin-btn">Guardar configuración</button>
          </form>
        </section>

        <section className="admin-panel">
          <div className="admin-panel__head">
            <h2 className="admin-panel__titulo">Preferencias de notificaciones</h2>
          </div>

          <form className="ajustes-form" onSubmit={guardar("Preferencias guardadas.")}>
            <label className="ajustes-interruptor">
              Enviar correo al cliente al confirmar
              <input type="checkbox" checked={notificaciones.correoCliente} onChange={cambiar("notificaciones", "correoCliente")} />
            </label>

            <label className="ajustes-interruptor">
              Avisar al repartidor por mensaje
              <input type="checkbox" checked={notificaciones.avisoRepartidor} onChange={cambiar("notificaciones", "avisoRepartidor")} />
            </label>

            <label className="ajustes-interruptor">
              Recibir alertas de bajo stock
              <input type="checkbox" checked={notificaciones.alertasStock} onChange={cambiar("notificaciones", "alertasStock")} />
            </label>

            <label className="ajustes-campo">
              Correo para alertas
              <input
                type="email"
                placeholder="alertas@tutienda.com"
                value={notificaciones.correoAlertas}
                onChange={cambiar("notificaciones", "correoAlertas")}
              />
            </label>

            <button type="submit" className="admin-btn">Guardar preferencias</button>
          </form>
        </section>
      </div>

      <Toast mensaje={toast} onCerrar={() => setToast("")} />
    </>
  );
}

export default Ajustes;
