import usuarioModel from "../models/usuarioModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//Crear un nuevo usuario
export const crearUsuario = async (datosUsuario) => {
    // Se ignora cualquier rol enviado desde el registro público.
    // Todo registro público es forzosamente "cliente".
    const datosSeguro = { ...datosUsuario, rol: "cliente" };
    const nuevoUsuario = new usuarioModel(datosSeguro);
    return await nuevoUsuario.save();
};

//Mostrar lista de usuarios 
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
    if (parametrosQuery.rol) {
        filtros.rol = parametrosQuery.rol;
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

// Buscar usuarios por Id
export const buscarUsuarioId = async (id) => {
    return await usuarioModel.findById(id).select('-password');
};

// Obtener los datos del usuario actualmente autenticado (a partir del token)
export const obtenerUsuarioActual = async (id) => {
    return await usuarioModel.findById(id).select('-password');
};

//Modificar info de usuario
export const modificarUsuario = async (id, datosActualizados) => {
    if (datosActualizados.password) {
        const salt = await bcrypt.genSalt(10);
        datosActualizados.password = await bcrypt.hash(datosActualizados.password, salt);
    }
    return await usuarioModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true }).select('-password');
};

//Eliminar usuario
export const eliminarUsuario = async (id) => {
    return await usuarioModel.findByIdAndUpdate(
        id,
        { activo: false },
        { new: true, runValidators: true }
    );
};

// Login y generación de JWT
export const login = async (correo, password) => {

    const usuario = await usuarioModel.findOne({ correo });

    if (!usuario) {
        throw new Error("Correo Electrónico inválido");
    }

    const esValido = await usuario.compararPassword(password);

    if (!esValido) {
        throw new Error("Los datos proporcionados no coinciden.");
    }

    const token = jwt.sign(
        {
            id: usuario._id,
            rol: usuario.rol
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "8h"
        }
    );

    return {
        usuario: {
            id: usuario._id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            telefono: usuario.telefono,
            rol: usuario.rol
        },
        token
    };
};

// Actualiza el propio perfil del usuario autenticado.
// Solo permite modificar campos "seguros" — nunca rol ni activo.
export const modificarPerfilPropio = async (id, datosActualizados) => {
    const { nombre, apellido, telefono } = datosActualizados;
    const datosPermitidos = { nombre, apellido, telefono };
    return await usuarioModel.findByIdAndUpdate(id, datosPermitidos, { new: true, runValidators: true }).select('-password');
};

//ESTE METODO SE IMPLEMENTARA EN UN MODULO FUTURO PARA MODIFICAR CONTRA

// export const cambiarPassword = async (id, passwordActual, passwordNueva) => {
//     const usuario = await usuarioModel.findById(id);
//     const esValida = await usuario.compararPassword(passwordActual);
//     if (!esValida) throw new Error("La contraseña actual es incorrecta.");

//     const salt = await bcrypt.genSalt(10);
//     usuario.password = await bcrypt.hash(passwordNueva, salt);
//     return await usuario.save();
// }; 
// PARA DESCOMENTAR TODO, SELECCIONE  EL BLOQUE Y REALICE LA COMBINACION CTRL + K + U