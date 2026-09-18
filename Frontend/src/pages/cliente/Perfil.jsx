import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Boton from "../../components/common/Boton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import * as usuarioService from "../../services/usuarioService.js";
import "./Perfil.css";

function Perfil() {
  const { usuario, logout, actualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [datos, setDatos] = useState({
    nombre: usuario?.nombre || "",
    apellido: usuario?.apellido || "",
    telefono: usuario?.telefono || "",
  });

  const actualizarCampo = (campo) => (evento) =>
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));

  const manejarGuardar = async (evento) => {
    evento.preventDefault();
    setError("");
    setGuardando(true);

    try {
      const usuarioActualizado = await usuarioService.actualizarPerfil(datos);
      actualizarUsuario(usuarioActualizado);
      setEditando(false);
    } catch (error) {
      setError(error.response?.data?.error || "No se pudo guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  const manejarCerrarSesion = () => {
    logout();
    navigate("/");
  };

  if (!usuario) return null;

  return (
    <main className="perfil">
      <div className="perfil__contenedor">
        <h1>Mi perfil</h1>

        <form className="perfil__tarjeta" onSubmit={manejarGuardar}>
          <div className="perfil__avatar">
            <span className="material-symbols-outlined">account_circle</span>
            <div>
              <p className="perfil__avatar-nombre">
                {usuario.nombre} {usuario.apellido || ""}
              </p>
              <p className="perfil__avatar-correo">{usuario.correo}</p>
            </div>
          </div>

          <div className="perfil__fila">
            <label className="perfil__campo">
              <span>Nombre</span>
              <input value={datos.nombre} disabled={!editando} onChange={actualizarCampo("nombre")} />
            </label>
            <label className="perfil__campo">
              <span>Apellido</span>
              <input value={datos.apellido} disabled={!editando} onChange={actualizarCampo("apellido")} />
            </label>
          </div>

          <label className="perfil__campo">
            <span>Correo</span>
            <input value={usuario.correo} disabled />
          </label>

          <label className="perfil__campo">
            <span>Teléfono</span>
            <input value={datos.telefono} disabled={!editando} onChange={actualizarCampo("telefono")} />
          </label>

          {error && <p className="perfil__error">{error}</p>}

          <div className="perfil__acciones">
            {editando ? (
              <Boton key="guardar" type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </Boton>
            ) : (
              <Boton key="editar" type="button" onClick={() => setEditando(true)}>
                Editar perfil
              </Boton>
            )}
            <Boton type="button" variante="fantasma" onClick={manejarCerrarSesion} icono="logout">
              Cerrar sesión
            </Boton>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Perfil;