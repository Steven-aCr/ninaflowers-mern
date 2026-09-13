import express from "express"
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

const app = express();
app.use(express.json());

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/inventarios", inventarioRoutes);
app.use("/api/proveedores", proveedorRoutes);
app.use("/api/pedidos", pedidoRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/envio", envioRoutes);
app.use("/api/pago", pagoRoutes);
app.use("/api/movimientos-inventario", movInventarioRoutes);

export default app;