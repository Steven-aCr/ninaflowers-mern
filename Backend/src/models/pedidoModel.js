import mongoose from "mongoose";
import { DireccionSchema } from "./usuarioModel.js";

const ItemPedidoSchema = new mongoose.Schema({
    productoId:     { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
    nombreProducto: { type: String, required: true },
    cantidad:       { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true },
    subtotal:       { type: Number, required: true }
}, { _id: false });

const HistorialEstadoSchema = new mongoose.Schema({
    estado: {
        type: String,
        enum: ["pendiente", "pendiente_cotizacion", "confirmado", "en_preparacion", "listo_entrega", "entregado", "cancelado"],
        required: true
    },
    fecha:      { type: Date, default: Date.now },
    usuarioId:  { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    comentario: { type: String }
}, { _id: false });

const PedidoSchema = new mongoose.Schema({
    usuarioId:            { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    productos:            { type: [ItemPedidoSchema], required: true },
    direccionEntrega:     { type: DireccionSchema, required: true },
    historialEstados:     { type: [HistorialEstadoSchema], default: [] },
    subtotal:             { type: Number, required: true },
    descuento:            { type: Number, default: 0 },
    codigoCuponAplicado:  { type: String },
    impuesto:             { type: Number, default: 0 }, 
    total:                { type: Number, required: true },
    estadoPedido: {
        type: String,
        enum: ["pendiente", "pendiente_cotizacion", "confirmado", "en_preparacion", "listo_entrega", "entregado", "cancelado"],
        default: "confirmado"
    },
    fechaPedido:          { type: Date, default: Date.now },
    fechaEntregaEstimada: { type: Date, required: true }
}, { timestamps: true });

const pedidoModel = mongoose.models.Pedido || mongoose.model("Pedido", PedidoSchema);

export default pedidoModel;