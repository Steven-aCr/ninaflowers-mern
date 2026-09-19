import mongoose from 'mongoose';

//Subdocumento embebido: representa un producto de form parte
// de un producto compuesto (ej. una rosa dentro de un ramo).
// No tiene _id propio porque no se consulta de forma independiente.
const ComponenteProductoSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
    cantidad: { type: Number, required: true, min: 1 },
}, { _id: false });

const ProductoSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String },
    categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: "Categoria", required: true },
    tipoProducto: { type: String, enum: ["simple", "compuesto"], default: "simple" },
    componentes: { type: [ComponenteProductoSchema], default: [] },
    precio: { type: Number, required: true, min: 0 },
    costo: { type: Number, min: 0 },
    imagenes: { type: [String], default: [] },
    activo: { type: Boolean, default: true },
}, { timestamps: true });

const productoModel = mongoose.models.Producto || mongoose.model("Producto", ProductoSchema);

export default productoModel;