import * as pedidoService from "../services/pedidoService.js";

export const crear = async (req, res) => {
    try {
        const resultado = await pedidoService.crearPedido(req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await pedidoService.listarPedido(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await pedidoService.buscarPedidoId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Pedido no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const actualizar = async (req, res) => {
    try {
        const resultado = await pedidoService.modificarPedido(req.params.id, req.body);
        if (!resultado) return res.status(404).json({ mensaje: 'Pedido no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const cancelar = async (req, res) => {
    try {
        const { usuarioId, comentario } = req.body;
        const resultado = await pedidoService.cancelarPedido(req.params.id, usuarioId, comentario);
        if (!resultado) return res.status(404).json({ mensaje: 'Pedido no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};