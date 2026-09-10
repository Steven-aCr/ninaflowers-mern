import * as usuarioService from "../services/usuarioService.js";

// agregar registro de usuario.
export const crear = async (req, res) => {
    try {
        const resultado = await usuarioService.crearUsuario(req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await usuarioService.listarUsuario(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await usuarioService.buscarUsuarioId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const actualizar = async (req, res) => {
    try {
        const resultado = await usuarioService.modificarUsuario(req.params.id, req.body);
        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await usuarioService.eliminarUsuario(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};