import carritoModel from "../models/carritoModel";

export const crearCarrito = async (datosCarrito) => {
    const nuevoCarrito = new carritoModel(datosCarrito);
    return await nuevoCarrito.save();
};

//Si el usuario no tiene un carrito activo, se genera vacio.
export const obtenerCarrito = async (usuarioId) => {
    let carrito = await carritoModel.findOne({ usuarioId }).populate('items.productoId', 'nombre precio imagenes');
    if (!carrito) {
        carrito = await carritoModel.create({ usuarioId, items: [] });
    }
    return carrito;
};

//Si el producto ya esta en el carrito, suma la cantidad.
export const agregarItem = async (usuarioId, productoId, cantidad, precioUnitario) => {
    let carrito = await carritoModel.findOne({ usuarioId });
    if (!carrito) {
        carrito = new carritoModel({ usuarioId, items: [] });
    }

    const itemExistente = carrito.items.find(
        (item) => item.productoId.toString() === productoId.toString()
    );

    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        carrito.items.push({ productoId, cantidad, precioUnitario });
    }

    return await carrito.save();
};

//Cambia la cantidad de un producto ya existente.
export const actualizarCantidadItem = async (usuarioId, productoId, cantidad) => {
    const carrito = await carritoModel.findOne({ usuarioId });
    if (!carrito) return null;

    if (cantidad <= 0) {
        carrito.items = carrito.items.filter(
            (item) => item.productoId.toString() !== productoId.toString()
        );
    } else {
        const item = carrito.items.find(
            (item) => item.productoId.toString() === productoId.toString()
        );
        if (!item) return null;
        item.cantidad = cantidad;
    }

    return await carrito.save();
};

//Quita un producto especifico del carrito
export const eliminarItem = async (usuarioId, productoId) => {
    const carrito = await carritoModel.findOne({ usuarioId });
    if (!carrito) return null;

    carrito.items = carrito.items.filter(
        (item) => item.productoId.toString() !== productoId.toString()
    );

    return await carrito.save();
};

//Limpia todo el arreglo (se realiza esta accion despues de confirmar el pedido.)
export const vaciarCarrito = async (usuarioId) => {
    return await carritoModel.findOneAndUpdate(
        { usuarioId },
        { items: [] },
        { new: true }
    );
};