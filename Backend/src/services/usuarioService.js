import usuarioModel from "../models/usuarioModel.js";

export const crearUsuario = async (datosUsuario) => {
    const nuevoUsuario = new usuarioModel(datosUsuario);
    return await nuevoUsuario.save();
};

export const listarUsuario = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.nombre) {
        filtros.nombre = { $regex: parametrosQuery.nombre, $options: 'i' };
    }
    if (parametrosQuery.apellido) {
        filtros.apellido = { $regex: parametrosQuery.apellido, $options: 'i' };
    }
    if (parametrosQuery.correo) {
        filtros.correo = { $regex: parametrosQuery.correo, $options: 'i' };
    }
    if (parametrosQuery.telefono) {
        filtros.telefono = { $regex: parametrosQuery.telefono, $options: 'i' };
    }
    if (parametrosQuery.activo !== undefined) {
        filtros.activo = parametrosQuery.activo === 'true';
    }

    const [total, usuarios] = await Promise.all([
        usuarioModel.countDocuments(filtros),
        usuarioModel.find(filtros).select('-password').skip(desde).limit(limite).sort({ createdAt: -1 })
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: usuarios
    };
};

export const buscarUsuarioId = async (id) => {
    return await usuarioModel.findById(id).select('-password');
};

export const modificarUsuario = async (id, datosActualizados) => {
    return await usuarioModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
};

export const eliminarUsuario = async (id) => {
    return await usuarioModel.findByIdAndUpdate(
        id,
        { activo: false },
        { new: true, runValidators: true }
    );
};