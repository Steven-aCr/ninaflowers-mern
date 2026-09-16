import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Boton from "../../components/common/Boton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import "./Login.css";

// NOTA: el submit todavía no llama a authService (no existe conexión real
// a la API). Por ahora arma un objeto "usuario" mínimo con el correo
// ingresado y lo guarda en AuthContext, solo para que el resto de la app
// (Navbar, PrivateRoute) tenga sesión con la que trabajar mientras se
// prueba la UI. Cuando conectemos authService, este handleSubmit hace
// authService.iniciarSesion({correo, password}) y usa el usuario que
// devuelva la API real.
function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = (evento) => {
    evento.preventDefault();

    if (!correo.trim() || !password.trim()) {
      setError("Completa correo y contraseña.");
      return;
    }

    setError("");
    login({ correo, nombre: correo.split("@")[0] });
    navigate("/");
  };

  return (
    <main className="login">
      <div className="login__tarjeta">
        <div className="login__encabezado">
          <span className="material-symbols-outlined">local_florist</span>
          <h1>Inicia sesión</h1>
          <p>Accede a tu cuenta de NinaFlowers</p>
        </div>

        <form className="login__form" onSubmit={manejarSubmit}>
          <div className="login__campo">
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

          <div className="login__campo">
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

          {error && <p className="login__error">{error}</p>}

          <Boton type="submit" variante="primario">
            Iniciar sesión
          </Boton>
        </form>

        <p className="login__pie">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
