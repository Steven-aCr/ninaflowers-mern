import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Conexion a Base de Datos exitosa!')
    } catch (error) {
        console.error('Error critico de conexion a la Base de Datos!', error.message);
        process.exit(1);
    }
};