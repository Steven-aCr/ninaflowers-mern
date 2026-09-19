import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // .../src/middleware

// Ruta absoluta a src/uploads/productos, sin importar desde dónde se
// ejecute el comando "npm run server".
const carpetaDestino = path.join(__dirname, "..", "uploads", "productos");

if (!fs.existsSync(carpetaDestino)) {
    fs.mkdirSync(carpetaDestino, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, carpetaDestino),
    filename: (req, file, cb) => {
        const sufijo = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, sufijo + path.extname(file.originalname));
    }
});

const filtroArchivo = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos de imagen."), false);
    }
};

export const uploadImagenesProducto = multer({
    storage,
    fileFilter: filtroArchivo,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array("imagenes", 5);