import inventarioModel from "../models/inventarioModel.js";
import { crearMovimiento } from "./movInventarioService.js";

export const crearInventario = async (datosInventario) => {
    const { productoId, stock = 0, stockMinimo, usuarioId, proveedorId } = datosInventario;

    const yaExiste = await inventarioModel.findOne({ productoId });
    if (yaExiste) {
        throw new Error("Ya existe un registro de inventario para este producto.");
    }

    // El inventario siempre nace en 0; si hay stock inicial, se carga
    // mediante un movimiento de entrada para dejar rastro de auditoría.
    const nuevoInventario = new inventarioModel({ productoId, stock: 0, stockMinimo });
    await nuevoInventario.save();

    if (stock > 0) {
        await crearMovimiento({
            productoId,
            usuarioId,
            proveedorId,
            tipo: "entrada",
            motivo: "compra",
            cantidad: stock
        });
    }

    return await inventarioModel.findById(nuevoInventario._id).populate('productoId', 'nombre sku');
};

export const listarInventario = async (parametrosQuery = {}, pagina = 1, limite = 10) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.productoId) {
        filtros.productoId = parametrosQuery.productoId;
    }
    if (parametrosQuery.bajoMinimo === 'true') {
        filtros.$expr = { $lte: ["$stock", "$stockMinimo"] };
    }

    const [total, inventarios] = await Promise.all([
        inventarioModel.countDocuments(filtros),
        inventarioModel.find(filtros)
            .populate('productoId', 'nombre sku')
            .skip(desde).limit(limite).sort({ ultimaActualizacion: -1 })
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: inventarios
    };
};

export const buscarInventarioId = async (id) => {
    return await inventarioModel.findById(id).populate('productoId', 'nombre sku');
};

export const modificarInventario = async (id, datosActualizados) => {
    // El stock NUNCA se modifica directo desde aquí: solo pasa por movimientos.
    // Aunque el administrador mande "stock" en el body, se ignora a propósito.
    return await inventarioModel.findByIdAndUpdate(
        id,
        { stockMinimo: datosActualizados.stockMinimo, ultimaActualizacion: new Date() },
        { new: true, runValidators: true }
    ).populate('productoId', 'nombre sku');
};

// eliminarInventario se elimina a propósito: por auditoría, un registro
// de inventario nunca se borra una vez creado.