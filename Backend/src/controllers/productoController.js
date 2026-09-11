import * as productoService from "../services/productoService.js";

// agregar registro de producto.
export const crear = async (req, res) => {
    try {
        const resultado = await productoService.crearProducto(req.body);
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
        const resultado = await productoService.modificarProducto(req.params.id, req.body);
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