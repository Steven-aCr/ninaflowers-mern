import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

// Define la estructura de cada dirección del usuario, 
// validando los datos esenciales y evitando un _id independiente.
export const DireccionSchema = new mongoose.Schema({
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

//HASH de password antes de guardar
UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//Metodo para comparar contra:
UsuarioSchema.methods.compararPassword = async function(passwordCandidata) {
    return await bcrypt.compare(passwordCandidata, this.password);
};

const usuarioModel = mongoose.models.Usuario || mongoose.model("Usuario", UsuarioSchema);

export default usuarioModel;