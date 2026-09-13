import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import usuarioModel from "../models/usuarioModel.js";

const crearUsuarioInicial = async () => {
    try {
        // Conectar a MongoDB Atlas
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Conectado a MongoDB Atlas para la creación de usuario inicial.");

        // Verificar si ya existe un usuario administrador
        const usuarioExistente = await usuarioModel.findOne({
            rol: "administrador"
        });

        if (usuarioExistente) {
            console.log("El usuario administrador ya existe en la base de datos.");
            return;
        }

        // Crear usuario administrador
        const usuarioAdmin = new usuarioModel({
            nombre: "Nina",
            apellido: "Campos Franco",
            correo: "nina@flowers.com",
            password: "Nina503",
            telefono: '1234-5678',
            rol: "administrador"
        });

        await usuarioAdmin.save();

        console.log("Usuario Administrador creado con éxito.");
        console.log("Correo: nina@flowers.com");
        console.log("Contra: Nina503");

    } catch (error) {
        console.error("Error al crear el usuario inicial:", error.message);

    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

crearUsuarioInicial();