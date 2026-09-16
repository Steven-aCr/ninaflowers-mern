import "./Boton.css";

// Botón genérico para formularios y acciones (Login, Registro, Checkout...).
// "variante": primario | secundario | fantasma. "type" por defecto "button"
// para que nunca dispare un submit sin querer si se usa suelto.
function Boton({
  children,
  variante = "primario",
  type = "button",
  disabled = false,
  onClick,
  icono,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`boton boton--${variante}`}
    >
      {icono && <span className="material-symbols-outlined">{icono}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Boton;
