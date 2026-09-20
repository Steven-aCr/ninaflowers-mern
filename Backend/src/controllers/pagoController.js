import * as pagoService from "../services/pagoService.js";

export const crear = async (req, res) => {
    try {
        const resultado = await pagoService.crearPago(req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await pagoService.listarPagos(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await pagoService.buscarPagoId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Pago no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerPorPedido = async (req, res) => {
    try {
        const resultado = await pagoService.buscarPagoPorPedido(req.params.pedidoId);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const actualizarEstado = async (req, res) => {
    try {
        const { estado, referenciaTransaccion } = req.body;
        const resultado = await pagoService.actualizarEstadoPago(req.params.id, estado, referenciaTransaccion);
        if (!resultado) return res.status(404).json({ mensaje: 'Pago no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const reporte = async (req, res) => {
    try {
        const resultado = await pagoService.reportePagos(req.query);
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};