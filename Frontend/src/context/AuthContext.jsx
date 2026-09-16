import { createContext, useState } from "react";

export const AuthContext = createContext(null);

// NOTA IMPORTANTE (leer antes de conectar authService real):
// "usuario" es local por ahora (no persiste al recargar, no llama a la API).
// login()/registrar() solo GUARDAN el objeto usuario en memoria para que el
// resto de la app (Navbar, PrivateRoute, Perfil) ya tenga algo real con qué
// trabajar. Cuando conectemos authService:
//   - login(correo, password) hará authService.iniciarSesion(...) y GUARDARÁ
//     el usuario que devuelva la API (no el que recibe por parámetro).
//   - Se leerá el token de una cookie HttpOnly (según tu arquitectura de
//     autenticación), no de localStorage.
//   - Se agregará "cargando" (true mientras se verifica sesión al abrir la
//     app) para que PrivateRoute no redirija de más antes de confirmar.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  const login = (datosUsuario) => {
    setUsuario(datosUsuario);
  };

  const logout = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
