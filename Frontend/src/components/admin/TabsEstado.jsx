// Pestañas de filtro con contador, como en el diseño: "Todos (48)", "Pendiente (4)"...
// opciones: [{ valor, etiqueta, cantidad? }]. El valor "" significa "Todos".
// Si "cantidad" es undefined (aún cargando) se muestra solo la etiqueta.
function TabsEstado({ opciones, activo, onCambiar }) {
  return (
    <div className="admin-tabs" role="tablist">
      {opciones.map((opcion) => {
        const esActivo = opcion.valor === activo;
        return (
          <button
            key={opcion.valor || "todos"}
            type="button"
            role="tab"
            aria-selected={esActivo}
            className={esActivo ? "admin-tab admin-tab--activo" : "admin-tab"}
            onClick={() => onCambiar(opcion.valor)}
          >
            {opcion.etiqueta}
            {opcion.cantidad !== undefined && opcion.cantidad !== null && ` (${opcion.cantidad})`}
          </button>
        );
      })}
    </div>
  );
}

export default TabsEstado;