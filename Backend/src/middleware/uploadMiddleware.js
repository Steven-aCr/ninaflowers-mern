import multer from "multer";
import path from "path";
import fs from "fs";

const carpetaDestino = "uploads/productos";

// Crea la carpeta si no existe (evita el error de multer al arrancar en limpio).
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

// Middleware listo para usar directo en la ruta: hasta 5 imágenes, 5MB c/u.
export const uploadImagenesProducto = multer({
    storage,
    fileFilter: filtroArchivo,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array("imagenes", 5);