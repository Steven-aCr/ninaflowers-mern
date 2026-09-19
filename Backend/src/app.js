import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // .../src

const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-use-cookie']
};

const app = express();

app.set('etag', false);

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // <-- ruta absoluta a src/uploads

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