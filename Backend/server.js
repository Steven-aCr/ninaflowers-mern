import express from "express"
import cors from "cors"
import { connectDB } from "./config/bd.js"
import dotenv from "dotenv"

//Configuracion App
const app = express()

//Middleware
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.send("API en ejecucion.")
})

//Conexion a DB
const PORT =  process.env.PORT || 3000;

dotenv.config();

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en: http://localhost:${PORT}`)
    })
})