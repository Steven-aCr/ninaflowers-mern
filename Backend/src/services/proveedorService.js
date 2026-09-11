import proveedorModel from "../models/proveedorModel.js";

export const crearProveedor = async (datosProveedor) => {
    const nuevoProveedor = new proveedorModel(datosProveedor);
    return await nuevoProveedor.save();
};

export const listarProveedor = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.nombre) {
        filtros.nombre = { $regex: parametrosQuery.nombre, $options: 'i' };
    }
    if (parametrosQuery.correo) {
        filtros.correo = { $regex: parametrosQuery.correo, $options: 'i' };
    }
    if (parametrosQuery.activo !== undefined) {
        filtros.activo = parametrosQuery.activo === 'true';
    }

    const [total, proveedores] = await Promise.all([
        proveedorModel.countDocuments(filtros),
        proveedorModel.find(filtros).skip(desde).limit(limite).sort({ nombre: 1 })
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: proveedores
    };
};

export const buscarProveedorId = async (id) => {
    return await proveedorModel.findById(id);
};

export const modificarProveedor = async (id, datosActualizados) => {
    return await proveedorModel.findByIdAndUpdate(id, datosActualizados, { new: true, runValidators: true });
};

export const eliminarProveedor = async (id) => {
    return await proveedorModel.findByIdAndUpdate(
        id,
        { activo: false },
        { new: true, runValidators: true }
    );
};