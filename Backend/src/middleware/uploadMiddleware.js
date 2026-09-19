import multer from "multer";

// Guarda el archivo en memoria (buffer), nunca en disco — desde ahí
// lo subimos directo a Cloudinary en el controller.
export const uploadImagenesProducto = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten archivos de imagen."), false);
        }
    }
}).array("imagenes", 5);