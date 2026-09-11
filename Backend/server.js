import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import { connectDB } from "./src/config/bd.js"
import usuarioRouter from "./src/routes/usuarioRoutes.js"
import productoRouter from "./src/routes/productoRoutes.js"
import categoriaRouter from "./src/routes/categoriaRoutes.js"
import inventarioRouter from "./src/routes/inventarioRoutes.js"
import proveedorRouter from "./src/routes/proveedorRoutes.js"

//Configuracion App
const app = express()

//Middleware
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("API en ejecucion.")
})

//Endpoints API
app.use("/api/usuarios", usuarioRouter);
app.use("/api/productos", productoRouter);
app.use("/api/categorias", categoriaRouter);
app.use("/api/inventarios", inventarioRouter);
app.use("/api/proveedores", proveedorRouter);

//Conexion a DB
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en: http://localhost:${PORT}`)
    })
}).catch((error) => {
    console.error("Error al conectar a la base de datos:", error.message);
    process.exit(1);
});