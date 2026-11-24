// Tarjeta de métrica del panel (clases .admin-stat de admin.css).
// "valor" y "nota" aceptan texto o JSX (por ejemplo, un <span className="admin-pill">).
function TarjetaMetrica({ etiqueta, valor, nota }) {
  return (
    <article className="admin-stat">
      <span className="admin-stat__flor" aria-hidden="true">✿</span>
      <span className="admin-stat__etiqueta">{etiqueta}</span>
      <strong className="admin-stat__valor">{valor}</strong>
      {nota && <span className="admin-stat__nota">{nota}</span>}
    </article>
  );
}

export default TarjetaMetrica;