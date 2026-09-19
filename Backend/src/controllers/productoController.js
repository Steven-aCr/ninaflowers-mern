import * as productoService from "../services/productoService.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { subirImagenCloudinary } from "../utils/subirImagenCloudinary.js";

// Ahora es async porque subir a Cloudinary toma tiempo (ya no es
// instantáneo como escribir a disco local).
const construirDatosProducto = async (req) => {
    const datos = { ...req.body };

    if (datos.precio !== undefined) datos.precio = Number(datos.precio);
    if (datos.costo !== undefined && datos.costo !== '') datos.costo = Number(datos.costo);
    if (datos.componentes !== undefined) {
        datos.componentes = typeof datos.componentes === 'string'
            ? JSON.parse(datos.componentes)
            : datos.componentes;
    }
    if (datos.activo !== undefined) {
        datos.activo = datos.activo === 'true' || datos.activo === true;
    }

    if (req.files && req.files.length > 0) {
        datos.imagenes = await Promise.all(
            req.files.map((archivo) => subirImagenCloudinary(archivo.buffer))
        );
    }

    return datos;
};

const borrarImagenesCloudinary = async (imagenes = []) => {
    await Promise.all(
        imagenes.map((img) => cloudinary.uploader.destroy(img.publicId).catch(() => {}))
    );
};

export const crear = async (req, res) => {
    try {
        const datos = await construirDatosProducto(req);
        const resultado = await productoService.crearProducto(datos);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await productoService.listarProducto(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await productoService.buscarProductoId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const actualizar = async (req, res) => {
    try {
        const datos = await construirDatosProducto(req);

        if (req.files && req.files.length > 0) {
            const productoActual = await productoService.buscarProductoId(req.params.id);
            if (productoActual?.imagenes?.length > 0) {
                await borrarImagenesCloudinary(productoActual.imagenes);
            }
        }

        const resultado = await productoService.modificarProducto(req.params.id, datos);
        if (!resultado) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await productoService.eliminarProducto(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};