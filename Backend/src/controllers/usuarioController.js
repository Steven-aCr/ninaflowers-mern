import * as usuarioService from "../services/usuarioService.js";

//Login
export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;
        const resultado =  await usuarioService.login(correo, password);
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

// agregar registro de usuario.
export const crear = async (req, res) => {
    try {
        const resultado = await usuarioService.crearUsuario(req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

//Obtener la lista de usuarios completa
export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await usuarioService.listarUsuario(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

//Obtener usuarios por ID
export const obtenerUno = async (req, res) => {
    try {
        const resultado = await usuarioService.buscarUsuarioId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

//Actualizar datos del usuario
export const actualizar = async (req, res) => {
    try {
        const resultado = await usuarioService.modificarUsuario(req.params.id, req.body);
        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

//Eliminar documento.
export const eliminar = async (req, res) => {
    try {
        const resultado = await usuarioService.eliminarUsuario(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};