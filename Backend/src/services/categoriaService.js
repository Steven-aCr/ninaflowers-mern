import categoriaModel from "../models/categoriaModel.js";

export const crearCategoria = async (datosCategoria) => {
    const nuevaCategoria = new categoriaModel(datosCategoria);
    return await nuevaCategoria.save();
};

export const listarCategoria = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.nombre) {
        filtros.nombre = { $regex: parametrosQuery.nombre, $options: 'i' };
    }
    if (parametrosQuery.activo !== undefined) {
        filtros.activo = parametrosQuery.activo === 'true';
    }

    const [total, categorias] = await Promise.all([
        categoriaModel.countDocuments(filtros),
        categoriaModel.find(filtros).skip(desde).limit(limite).sort({ createdAt: -1 })
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: categorias
    };
};

export const buscarCategoriaId = async (id) => {
    return await categoriaModel.findById(id);
};

export const modificarCategoria = async (id, datosActualizados) => {
    return await categoriaModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
};

export const eliminarCategoria = async (id) => {
    return await categoriaModel.findByIdAndUpdate(
        id,
        { activo: false },
        { new: true, runValidators: true }
    );
};