import productoModel from "../models/productoModel.js";

// Si el producto es compuesto, debe tener al menos un componente.
export const crearProducto = async (datosProducto) => {
    if (datosProducto.tipoProducto === "compuesto" &&
        (!datosProducto.componentes || datosProducto.componentes.length === 0)) {
        throw new Error("Un producto compuesto debe tener al menos un componente.");
    }
    const nuevoProducto = new productoModel(datosProducto);
    await nuevoProducto.save();
    return await productoModel.findById(nuevoProducto._id).populate('categoriaId', 'nombre');
};

export const listarProducto = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.nombre) {
        filtros.nombre = { $regex: parametrosQuery.nombre, $options: 'i' };
    }
    if (parametrosQuery.sku) {
        filtros.sku = { $regex: parametrosQuery.sku, $options: 'i' };
    }
    if (parametrosQuery.categoriaId) {
        filtros.categoriaId = parametrosQuery.categoriaId;
    }
    if (parametrosQuery.tipoProducto) {
        filtros.tipoProducto = parametrosQuery.tipoProducto;
    }
    if (parametrosQuery.activo !== undefined) {
        filtros.activo = parametrosQuery.activo === 'true';
    }

    const [total, productos] = await Promise.all([
        productoModel.countDocuments(filtros),
        productoModel.find(filtros)
            .populate('categoriaId', 'nombre')
            .skip(desde).limit(limite).sort({ createdAt: -1 })
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: productos
    };
};

export const buscarProductoId = async (id) => {
    return await productoModel.findById(id).populate('categoriaId', 'nombre');
};

export const modificarProducto = async (id, datosActualizados) => {
    if (datosActualizados.tipoProducto === "compuesto" &&
        datosActualizados.componentes && datosActualizados.componentes.length === 0) {
        throw new Error("Un producto compuesto debe tener al menos un componente.");
    }
    return await productoModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true })
        .populate('categoriaId', 'nombre');
};

export const eliminarProducto = async (id) => {
    return await productoModel.findByIdAndUpdate(
        id,
        { activo: false },
        { new: true, runValidators: true }
    );
};