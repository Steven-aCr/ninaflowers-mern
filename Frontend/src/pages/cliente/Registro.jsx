import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Boton from "../../components/common/Boton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import "./Registro.css";
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
    <main className="registro">
      <div className="registro__tarjeta">
        <div className="registro__encabezado">
          <span className="material-symbols-outlined">local_florist</span>
          <h1>Crea tu cuenta</h1>
          <p>Regístrate para hacer tus pedidos en NinaFlowers</p>
        </div>

        <form className="registro__form" onSubmit={manejarSubmit}>
          <div className="registro__fila">
            <div className="registro__campo">
              <label htmlFor="registro-nombre">Nombre</label>
              <input
                id="registro-nombre"
                type="text"
                value={form.nombre}
                onChange={actualizarCampo("nombre")}
                placeholder="María"
              />
            </div>
            <div className="registro__campo">
              <label htmlFor="registro-apellido">Apellido</label>
              <input
                id="registro-apellido"
                type="text"
                value={form.apellido}
                onChange={actualizarCampo("apellido")}
                placeholder="González"
              />
            </div>
          </div>

          <div className="registro__campo">
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

          <div className="registro__campo">
            <label htmlFor="registro-telefono">Teléfono</label>
            <input
              id="registro-telefono"
              type="tel"
              value={form.telefono}
              onChange={actualizarCampo("telefono")}
              placeholder="7000-0000"
            />
          </div>

          <div className="registro__campo">
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

          {error && <p className="registro__error">{error}</p>}

          <Boton type="submit" variante="primario">
            Crear cuenta
          </Boton>
        </form>

        <p className="registro__pie">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  );
}

export default Registro;
