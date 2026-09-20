import * as carritoService from "../services/carritoService.js";

export const obtener = async (req, res) => {
    try {
        const resultado = await carritoService.obtenerCarrito(req.params.usuarioId);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const agregarItem = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;
        const resultado = await carritoService.agregarItem(req.params.usuarioId, productoId, cantidad);
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const actualizarCantidad = async (req, res) => {
    try {
        const { cantidad } = req.body;
        const resultado = await carritoService.actualizarCantidadItem(req.params.usuarioId, req.params.productoId, cantidad);
        if (!resultado) return res.status(404).json({ mensaje: 'Carrito o producto no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const eliminarItem = async (req, res) => {
    try {
        const resultado = await carritoService.eliminarItem(req.params.usuarioId, req.params.productoId);
        if (!resultado) return res.status(404).json({ mensaje: 'Carrito no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const vaciar = async (req, res) => {
    try {
        const resultado = await carritoService.vaciarCarrito(req.params.usuarioId);
        if (!resultado) return res.status(404).json({ mensaje: 'Carrito no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};