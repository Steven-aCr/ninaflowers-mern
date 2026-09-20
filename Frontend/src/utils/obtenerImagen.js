// Devuelve la URL de una imagen de producto, sin importar si viene como
// texto (formato viejo) o como objeto { url, publicId } (formato actual).
export function obtenerUrlImagen(imagen) {
  if (!imagen) return null;
  return typeof imagen === "string" ? imagen : imagen.url || null;
}