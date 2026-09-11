import mongoose from "mongoose";

const EnvioSchema = new mongoose.Schema({
    pedidoId: { type: mongoose.Schema.Types.ObjectId, ref: "Pedido", required: true },
    tipo: {
        type: String,
        enum: ["retiro_tienda", "zona_cubierta", "fuera_zona"],
        required: true
    },
    costoEnvio: { type: Number, default: 0 },
}, { timestamps: true });

const envioModel = mongoose.models.Envio || mongoose.model("Envio", EnvioSchema);

export default envioModel;