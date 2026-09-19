import api from "./api";

// El backend sirve /uploads fuera de /api, así que se arma la URL
// quitando el sufijo "/api" de la variable de entorno.
const API_BASE = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

export const obtenerUrlImagen = (rutaRelativa) => `${API_BASE}${rutaRelativa}`;

export const listarProductos = async (params = {}) => {
  const { data } = await api.get("/productos", { params });
  return data;
};

export const buscarProductoId = async (id) => {
  const { data } = await api.get(`/productos/${id}`);
  return data;
};

const construirFormData = (datos, archivos) => {
  const formData = new FormData();
  formData.append("sku", datos.sku);
  formData.append("nombre", datos.nombre);
  formData.append("descripcion", datos.descripcion || "");
  formData.append("categoriaId", datos.categoriaId);
  formData.append("tipoProducto", datos.tipoProducto);
  formData.append("precio", datos.precio);
  formData.append("costo", datos.costo ?? "");
  formData.append("componentes", JSON.stringify(datos.componentes || []));
  archivos.forEach((archivo) => formData.append("imagenes", archivo));
  return formData;
};

export const crearProducto = async (datos, archivos = []) => {
  const formData = construirFormData(datos, archivos);
  const { data } = await api.post("/productos", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

// Si "archivos" viene vacío, el backend conserva las imágenes actuales.
export const modificarProducto = async (id, datos, archivos = []) => {
  const formData = construirFormData(datos, archivos);
  const { data } = await api.put(`/productos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

// Activar/desactivar no manda imágenes: va como JSON simple.
export const cambiarEstadoProducto = async (id, activo) => {
  if (activo) {
    const { data } = await api.put(`/productos/${id}`, { activo: true });
    return data;
  }
  const { data } = await api.delete(`/productos/${id}`); // soft-delete
  return data;
};