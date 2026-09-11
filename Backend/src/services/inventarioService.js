import inventarioModel from "../models/inventarioModel.js";

export const crearInventario = async (datosInventario) => {
    const yaExiste = await inventarioModel.findOne({ productoId: datosInventario.productoId });
    if (yaExiste) {
        throw new Error("Ya existe un registro de inventario para este producto.");
    }
    const nuevoInventario = new inventarioModel(datosInventario);
    return await nuevoInventario.save();
};

export const listarInventario = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.productoId) {
        filtros.productoId = parametrosQuery.productoId;
    }
    // Filtro útil para el negocio: ver qué productos están por debajo del mínimo.
    if (parametrosQuery.bajoMinimo === 'true') {
        filtros.$expr = { $lte: ["$stock", "$stockMinimo"] };
    }

    const [total, inventarios] = await Promise.all([
        inventarioModel.countDocuments(filtros),
        inventarioModel.find(filtros).skip(desde).limit(limite).sort({ ultimaActualizacion: -1 })
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: inventarios
    };
};

export const buscarInventarioId = async (id) => {
    return await inventarioModel.findById(id);
};

export const modificarInventario = async (id, datosActualizados) => {
    // Cualquier cambio de stock o stockMinimo actualiza la marca de tiempo.
    datosActualizados.ultimaActualizacion = new Date();
    return await inventarioModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
};

export const eliminarInventario = async (id) => {
    return await inventarioModel.findByIdAndDelete(id);
};