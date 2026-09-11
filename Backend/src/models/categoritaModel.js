import mongoose from "mongoose";

const CategoriaSchema = new mongoose.Schema({
    nombre:      { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String },
    activo:      { type: Boolean, default: true },
}, { timestamps: true });

const categoriaModel = mongoose.models.Categoria || mongoose.model("Categoria", CategoriaSchema);

export default categoriaModel;