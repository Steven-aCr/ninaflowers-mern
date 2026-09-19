import * as productoService from "../services/productoService.js";

// Los datos llegan como multipart/form-data (por las imágenes), así que
// vienen todos como texto — aquí se convierten a sus tipos reales.
const construirDatosProducto = (req) => {
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

    // Si llegaron archivos nuevos, reemplazan el arreglo de imágenes completo.
    // Si no llegó ningún archivo, "imagenes" ni se toca (se conservan las actuales).
    if (req.files && req.files.length > 0) {
        datos.imagenes = req.files.map((archivo) => `/uploads/productos/${archivo.filename}`);
    }

    return datos;
};

export const crear = async (req, res) => {
    try {
        const datos = construirDatosProducto(req);
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
        const datos = construirDatosProducto(req);
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