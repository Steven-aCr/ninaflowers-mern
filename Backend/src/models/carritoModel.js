import mongoose from "mongoose";

const ItemCarritoSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true }
}, { _id: false });

const CarritoSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, unique: true },
    items: { type: [ItemCarritoSchema], default: [] }
}, { timestamps: true });

const carritoModel = mongoose.models.Carrito || mongoose.model("Carrito", CarritoSchema);

export default carritoModel;