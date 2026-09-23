import mongoose from "mongoose";

const PagoSchema = new mongoose.Schema({
    pedidoId:  { type: mongoose.Schema.Types.ObjectId, ref: "Pedido", required: true },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    monto:     { type: Number, required: true },
    referenciaTransaccion: { type: String },
    metodo: {
        type: String,
        enum: ["tarjeta", "efectivo", "transferencia"],
        required: true
    },
    estado: {
        type: String,
        enum: ["pendiente", "completado", "fallido", "reembolsado"],
        default: "pendiente"
    }
}, { timestamps: true });

const pagoModel = mongoose.models.Pago || mongoose.model("Pago", PagoSchema);

export default pagoModel;