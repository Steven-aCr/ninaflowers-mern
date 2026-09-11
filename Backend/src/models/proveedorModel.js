import mongoose from "mongoose";

const ProveedorSchema = new mongoose.Schema({
    nombre:    { type: String, required: true, trim: true },
    telefono:  { type: String, required: true },
    correo:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    direccion: { type: String, required: true },
    activo:    { type: Boolean, default: true },
});

const proveedorModel = mongoose.models.Proveedor || mongoose.model("Proveedor", ProveedorSchema);

export default proveedorModel;