import * as inventarioService from "../services/inventarioService.js";

export const crear = async (req, res) => {
    try {
        const datos = { ...req.body, usuarioId: req.usuario.id };
        const resultado = await inventarioService.crearInventario(datos);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await inventarioService.listarInventario(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await inventarioService.buscarInventarioId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Inventario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const actualizar = async (req, res) => {
    try {
        const resultado = await inventarioService.modificarInventario(req.params.id, req.body);
        if (!resultado) return res.status(404).json({ mensaje: 'Inventario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

// eliminar: se quitó a propósito (ver inventarioService.js)