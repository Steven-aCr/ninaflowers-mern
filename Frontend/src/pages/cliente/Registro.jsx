import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Boton from "../../components/common/Boton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import "./Registro.css";

// Campos según tu usuarioModel: nombre, apellido, correo, password,
// telefono. "direcciones" no se pide aquí — según tu modelo es un arreglo
// que se llena después, desde Perfil o al hacer el primer pedido.
//
// Igual que en Login: el submit todavía no llama a usuarioService/
// authService. Arma el objeto localmente y lo guarda en AuthContext para
// poder probar la UI. Cuando conectemos el backend, aquí va
// usuarioService.crearUsuario(datos) seguido de login(usuarioCreado).
function Registro() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const actualizarCampo = (campo) => (evento) => {
    setForm((actual) => ({ ...actual, [campo]: evento.target.value }));
  };

  const manejarSubmit = (evento) => {
    evento.preventDefault();

    const camposFaltantes = Object.entries(form).filter(([, valor]) => !valor.trim());
    if (camposFaltantes.length > 0) {
      setError("Completa todos los campos.");
      return;
    }

    setError("");
    login({ ...form, rol: "cliente" });
    navigate("/");
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
