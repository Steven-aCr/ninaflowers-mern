import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { rutaInicialPorRol } from "../../utils/rutasPorRol.js";
import { useAuth } from "../../hooks/useAuth.js";
import "./Auth.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (evento) => {
    evento.preventDefault();

    if (!correo.trim() || !password.trim()) {
      setError("Completa correo y contraseña.");
      return;
    }

    setError("");
    setEnviando(true);

    try {
      const datos = await login(correo, password);
      navigate(rutaInicialPorRol(datos.usuario.rol), { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.error || "Correo o contraseña incorrectos."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__tarjeta">
        <aside className="auth__panel">
          <img src={logo} alt="Logo NinaFlowers" className="auth__logo" />
          <div>
            <h1>Hola de nuevo</h1>
            <p>Revisa el estado de tus pedidos y sigue cada entrega floral desde tu cuenta.</p>
          </div>
          <span className="auth__adorno" aria-hidden="true" />
        </aside>

        <section className="auth__contenido">
          <form className="auth__form" onSubmit={manejarSubmit}>
            <h2>Inicia sesión</h2>
            <p className="auth__subtitulo">Accede a tu cuenta de NinaFlowers</p>

            <div className="ui-campo">
              <label htmlFor="login-correo">Correo electrónico</label>
              <input
                id="login-correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
              />
            </div>

            <div className="ui-campo">
              <label htmlFor="login-password">Contraseña</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && <p className="ui-error" role="alert">{error}</p>}

            <button type="submit" className="ui-btn ui-btn--full" disabled={enviando}>
              {enviando ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <p className="auth__pie">
              ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;