import mongoose from "mongoose";

const MovimientoInventarioSchema = new mongoose.Schema({
    productoId:      { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
    usuarioId:       { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    proveedorId:     { type: mongoose.Schema.Types.ObjectId, ref: "Proveedor" },
    pedidoId:        { type: mongoose.Schema.Types.ObjectId, ref: "Pedido" },
    tipo: {
        type: String,
        enum: ["entrada", "salida"],
        required: true
    },
    motivo: {
        type: String,
        enum: ["compra", "venta", "merma", "ajuste", "devolucion"],
        required: true
    },
    cantidad:        { type: Number, required: true, min: 1 },
    stockResultante: { type: Number, required: true },
    fecha:           { type: Date, default: Date.now },
});

const movInventarioModel = mongoose.models.MovimientoInventario || mongoose.model("MovimientoInventario", MovimientoInventarioSchema);

export default movInventarioModel;