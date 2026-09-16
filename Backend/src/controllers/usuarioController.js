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

// Devuelve los datos del usuario autenticado (según el token/cookie)
export const yo = async (req, res) => {
    try {
        const resultado = await usuarioService.obtenerUsuarioActual(req.usuario.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// Cierra la sesión eliminando la cookie del token en el navegador.
export const cerrarSesion = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: process.env.COOKIE_SAMESITE || 'none'
    });
    res.status(200).json({ mensaje: 'Sesión cerrada correctamente.' });
};

// Actualiza el perfil del usuario autenticado.
export const actualizarPerfilPropio = async (req, res) => {
    try {
        const resultado = await usuarioService.modificarPerfilPropio(req.usuario.id, req.body);
        if (!resultado) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};