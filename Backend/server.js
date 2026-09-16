import dotenv from "dotenv"
dotenv.config()

import express from "express"
import { connectDB } from "./src/config/bd.js"

import app from "./src/app.js"

app.use(express.json())

app.get("/", (req, res) => {
    res.send("API en ejecucion.")
})

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en: http://localhost:${PORT}`)
    })
}).catch((error) => {
    console.error("Error al conectar a la base de datos:", error.message);
    process.exit(1);
});