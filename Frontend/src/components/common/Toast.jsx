import { useEffect } from "react";
import "./Toast.css";

// Toast controlado por el padre: "mensaje" null/vacío = oculto.
// Se auto-oculta llamando a onCerrar después de "duracion" ms.
function Toast({ mensaje, onCerrar, duracion = 3200 }) {
  useEffect(() => {
    if (!mensaje) return;
    const temporizador = setTimeout(onCerrar, duracion);
    return () => clearTimeout(temporizador);
  }, [mensaje, duracion, onCerrar]);

  return (
    <div className={`toast ${mensaje ? "toast--visible" : ""}`} role="status">
      <span className="material-symbols-outlined toast__icono">check_circle</span>
      <span className="toast__mensaje">{mensaje}</span>
    </div>
  );
}

export default Toast;
