import * as envioService from "../services/envioService.js";

export const crear = async (req, res) => {
    try {
        const resultado = await envioService.crearEnvio(req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await envioService.listarEnvios(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await envioService.buscarEnvioId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Envío no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerPorPedido = async (req, res) => {
    try {
        const resultado = await envioService.buscarEnvioPorPedido(req.params.pedidoId);
        if (!resultado) return res.status(404).json({ mensaje: 'Este pedido no tiene envío registrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const actualizar = async (req, res) => {
    try {
        const resultado = await envioService.modificarEnvio(req.params.id, req.body);
        if (!resultado) return res.status(404).json({ mensaje: 'Envío no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await envioService.eliminarEnvio(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Envío no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};