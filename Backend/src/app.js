import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import inventarioRoutes from "./routes/inventarioRoutes.js";
import proveedorRoutes from "./routes/proveedorRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import carritoRoutes from "./routes/carritoRoutes.js";
import envioRoutes from "./routes/envioRoutes.js";
import pagoRoutes from "./routes/pagoRoutes.js";
import movInventarioRoutes from "./routes/movInventarioRoutes.js";

const corsOptions = {
    origin: process.env.CLIENT_URL || '*', // Especificar URL utilizada en Frontend.
    credential: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

const app = express();

app.use(cors(corsOptions)); // Aplica cors globalmente.
app.use(express.json());
app.use(cookieParser());

//Registro de rutas
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/inventarios", inventarioRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/envio", envioRoutes);
app.use("/api/pago", pagoRoutes);
app.use("/api/movimientosInventario", movInventarioRoutes);

export default app;