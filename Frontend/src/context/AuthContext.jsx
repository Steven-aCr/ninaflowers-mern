import { createContext, useState, useEffect } from "react";
import * as authService from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const usuarioActual = await authService.obtenerSesionActual();
        setUsuario(usuarioActual);
      } catch (error) {
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };
    verificarSesion();
  }, []);

  const login = async (correo, password) => {
    const data = await authService.login(correo, password);
    setUsuario(data.usuario);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor:", error.message);
    } finally {
      setUsuario(null);
    }
  };

  const actualizarUsuario = (datosNuevos) => {
    setUsuario((actual) => ({ ...actual, ...datosNuevos }));
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}