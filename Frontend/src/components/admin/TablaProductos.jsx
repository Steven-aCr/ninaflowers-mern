import { obtenerUrlImagen } from "../../services/productoService.js";
import "./TablaProductos.css";

function TablaProductos({ productos, onEditar, onCambiarEstado }) {
  if (productos.length === 0) {
    return <p className="tabla-productos__vacio">No hay productos registrados.</p>;
  }

  return (
    <table className="tabla-productos">
      <thead>
        <tr>
          <th></th>
          <th>SKU</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Tipo</th>
          <th>Precio</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p._id}>
            <td>
              {p.imagenes?.[0] ? (
                <img className="tabla-productos__miniatura" src={obtenerUrlImagen(p.imagenes[0])} alt={p.nombre} />
              ) : (
                <div className="tabla-productos__miniatura tabla-productos__miniatura--vacia" />
              )}
            </td>
            <td>{p.sku}</td>
            <td>{p.nombre}</td>
            <td>{p.categoriaId?.nombre ?? "—"}</td>
            <td>{p.tipoProducto}</td>
            <td>${Number(p.precio).toFixed(2)}</td>
            <td>
              <span className={`tabla-productos__badge ${p.activo ? "" : "tabla-productos__badge--inactivo"}`}>
                {p.activo ? "Activo" : "Inactivo"}
              </span>
            </td>
            <td className="tabla-productos__acciones">
              <button type="button" onClick={() => onEditar(p)}>Editar</button>
              <button type="button" onClick={() => onCambiarEstado(p)}>
                {p.activo ? "Desactivar" : "Activar"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TablaProductos;