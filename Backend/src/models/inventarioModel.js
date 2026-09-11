import mongoose from "mongoose";

const InventarioSchema = new mongoose.Schema({
    productoId:          { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true, unique: true },
    stock:               { type: Number, required: true, min: 0, default: 0 },
    stockMinimo:         { type: Number, required: true, min: 0, default: 0 },
    ultimaActualizacion: { type: Date, default: Date.now },
});

const inventarioModel = mongoose.models.Inventario || mongoose.model("Inventario", InventarioSchema);

export default inventarioModel;