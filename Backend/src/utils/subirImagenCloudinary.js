import cloudinary from "../config/cloudinaryConfig.js";

// Cloudinary v2 sube por streams, no acepta un buffer directo — esto
// envuelve ese stream en una Promise para poder usar await donde se llame.
export const subirImagenCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "ninaflowers/productos" },
            (error, resultado) => {
                if (error) return reject(error);
                resolve({ url: resultado.secure_url, publicId: resultado.public_id });
            }
        );
        stream.end(buffer);
    });
};