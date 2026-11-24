import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth.js";
import "./Auth.css";
import * as authService from "../../services/authService.js";

function Registro() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const actualizarCampo = (campo) => (evento) => {
    setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    const camposFaltantes = Object.entries(form).filter(([, valor]) => !valor.trim());
    if (camposFaltantes.length > 0) {
      setError("Completa todos los campos.");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      await authService.registro(form);       // crea el usuario en la BD
      await login(form.correo, form.password); // inicia sesión automáticamente
      navigate("/");
    } catch (error) {
      setError(
        error.response?.data?.error || "No se pudo completar el registro."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__tarjeta">
        <aside className="auth__panel auth__panel--lila">
          <img src={logo} alt="Logo NinaFlowers" className="auth__logo" />
          <div>
            <h1>Crea tu cuenta</h1>
            <p>Regístrate para hacer tus pedidos en NinaFlowers y seguir cada entrega.</p>
          </div>
          <span className="auth__adorno" aria-hidden="true" />
        </aside>

        <section className="auth__contenido">
          <form className="auth__form" onSubmit={manejarSubmit}>
            <h2>Regístrate</h2>
            <p className="auth__subtitulo">Solo toma un minuto</p>

            <div className="auth__fila">
              <div className="ui-campo">
                <label htmlFor="registro-nombre">Nombre</label>
                <input
                  id="registro-nombre"
                  type="text"
                  value={form.nombre}
                  onChange={actualizarCampo("nombre")}
                  placeholder="María"
                  autoComplete="given-name"
                />
              </div>
              <div className="ui-campo">
                <label htmlFor="registro-apellido">Apellido</label>
                <input
                  id="registro-apellido"
                  type="text"
                  value={form.apellido}
                  onChange={actualizarCampo("apellido")}
                  placeholder="González"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="ui-campo">
              <label htmlFor="registro-correo">Correo electrónico</label>
              <input
                id="registro-correo"
                type="email"
                value={form.correo}
                onChange={actualizarCampo("correo")}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
              />
            </div>

            <div className="ui-campo">
              <label htmlFor="registro-telefono">Teléfono</label>
              <input
                id="registro-telefono"
                type="tel"
                value={form.telefono}
                onChange={actualizarCampo("telefono")}
                placeholder="7000-0000"
                autoComplete="tel"
              />
            </div>

            <div className="ui-campo">
              <label htmlFor="registro-password">Contraseña</label>
              <input
                id="registro-password"
                type="password"
                value={form.password}
                onChange={actualizarCampo("password")}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {error && <p className="ui-error" role="alert">{error}</p>}

            <button type="submit" className="ui-btn ui-btn--full">
              Crear cuenta
            </button>

            <p className="auth__pie">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Registro;