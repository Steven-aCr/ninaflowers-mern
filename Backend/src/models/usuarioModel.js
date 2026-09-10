import mongoose, { Schema } from "mongoose";

// Define la estructura de cada dirección del usuario, 
// validando los datos esenciales y evitando un _id independiente.
const DireccionSchema = new mongoose.Schema({
    etiqueta:   { type: String, required: true },
    linea1:     { type: String, required: true },
    linea2:     { type: String },
    ciudad:     { type: String, required: true },
    referencia: { type: String },
}, { _id: false });

const UsuarioSchema = new mongoose.Schema({
    nombre:      { type: String, required: true },
    apellido:    { type: String, required: true },
    correo:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, required: true },
    telefono:    { type: String, required: true },
    rol:         { type: String, enum: ["cliente", "administrador"], default: "cliente" },
    direcciones: { type: [DireccionSchema], default: [] },
    activo:      { type: Boolean, default: true },
}, { timestamps: true });

const usuarioModel = mongoose.models.Usuario || mongoose.model("Usuario", UsuarioSchema);

export default usuarioModel;