import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Boton from "../../components/common/Boton.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import "./Perfil.css";

// "usuario" viene de AuthContext (useAuth), no por props — es información
// de sesión, igual que en Navbar. Los campos editables solo se guardan en
// AuthContext por ahora (login() los sobrescribe); cuando conectemos
// usuarioService, "Guardar cambios" hará
// usuarioService.modificarUsuario(usuario._id, datos) antes de actualizar
// la sesión.
function Perfil() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState({
    nombre: usuario?.nombre || "",
    apellido: usuario?.apellido || "",
    telefono: usuario?.telefono || "",
  });

  const actualizarCampo = (campo) => (evento) =>
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));

  const manejarGuardar = (evento) => {
    evento.preventDefault();
    // TODO: usuarioService.modificarUsuario(usuario._id, datos)
    setEditando(false);
  };

  const manejarCerrarSesion = () => {
    cerrarSesion();
    navigate("/");
  };

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

          <div className="perfil__acciones">
            {editando ? (
              <Boton type="submit">Guardar cambios</Boton>
            ) : (
              <Boton type="button" onClick={() => setEditando(true)}>
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
