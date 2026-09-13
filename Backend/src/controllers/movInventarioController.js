import * as movInventarioService from "../services/movInventarioService.js";

export const crear = async (req, res) => {
    try {
        const resultado = await movInventarioService.crearMovimiento(req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await movInventarioService.listarMovimientos(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await movInventarioService.buscarMovimientoId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Movimiento no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};