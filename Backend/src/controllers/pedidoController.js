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

        const esAdmin = req.usuario.rol === "administrador";
        if (!esAdmin && resultado.usuarioId?._id.toString() !== req.usuario.id) {
            return res.status(403).json({ mensaje: 'ACCESO DENEGADO: Este pedido no te pertenece.' });
        }
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

export const crearDesdeCarrito = async (req, res) => {
    try {
        // req.usuario viene del token (verificarToken), no del body.
        const resultado = await pedidoService.crearPedidoDesdeCarrito(req.usuario, req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const misPedidos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        // usuarioId SIEMPRE del token: no se pueden consultar pedidos ajenos.
        const filtros = { ...req.query, usuarioId: req.usuario.id };
        const resultado = await pedidoService.listarPedido(filtros, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};