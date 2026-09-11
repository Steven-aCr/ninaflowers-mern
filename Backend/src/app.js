import express from "express"
import usuarioRoutes from "./routes/usuarioRoutes.js";
import productoRoutes from "./routes/productoRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import inventarioRoutes from "./routes/inventarioRoutes.js";
import proveedorRoutes from "./routes/proveedorRoutes.js";

const app = express();
app.use(express.json());

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/categorias", categoriaRoutes);
app.use("/api/inventarios", inventarioRoutes);
app.use("/api/proveedores", productoRoutes);



export default app;