import { useEffect } from "react";

// Contenedor de modal con los estilos .admin-modal de admin.css.
// - Se cierra al hacer clic en el fondo o con la tecla Escape.
// - "cerrarBloqueado" evita cerrarlo mientras hay una petición en curso.
// - Si pasas "titulo" dibuja un <h2>; si no, el contenido trae su propio encabezado
//   (en ese caso pasa "ariaLabel" para los lectores de pantalla).
// - NUEVO: si pasas "onSubmit", el modal se dibuja como <form> (misma caja, mismos
//   estilos) para que Enter y la validación nativa (required, min...) funcionen.
function ModalAdmin({
  titulo,
  ariaLabel,
  onCerrar,
  cerrarBloqueado = false,
  ancho = false,
  className = "",
  onSubmit,
  children,
}) {
  useEffect(() => {
    const manejarTecla = (evento) => {
      if (evento.key === "Escape" && !cerrarBloqueado) onCerrar();
    };
    document.addEventListener("keydown", manejarTecla);
    return () => document.removeEventListener("keydown", manejarTecla);
  }, [onCerrar, cerrarBloqueado]);

  const manejarFondo = (evento) => {
    if (evento.target === evento.currentTarget && !cerrarBloqueado) onCerrar();
  };

  const clases = ["admin-modal", ancho ? "admin-modal--ancho" : "", className].filter(Boolean).join(" ");
  const Contenedor = onSubmit ? "form" : "section";

  return (
    <div className="admin-modal__overlay" onMouseDown={manejarFondo}>
      <Contenedor
        className={clases}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || titulo}
        onSubmit={onSubmit}
      >
        {titulo && <h2>{titulo}</h2>}
        {children}
      </Contenedor>
    </div>
  );
}

export default ModalAdmin;
