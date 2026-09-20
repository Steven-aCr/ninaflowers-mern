import productoModel from "../models/productoModel.js";

// NUEVO: convierte el texto que escribe el usuario en un patrón seguro para usarlo en $regex.
// Sin esto, escribir "(" o "[" en el buscador rompía la consulta y devolvía error 500.
// String(...) evita otro error si alguien manda algo raro en la URL (ej. ?nombre[a]=1).
const escaparRegex = (texto) => String(texto).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// NUEVO: lista blanca de órdenes. Solo estos valores se aceptan desde la URL (?orden=...),
// así nadie puede mandar un campo cualquiera para ordenar.
// El "_id" al final desempata: si dos productos cuestan lo mismo, la paginación
// no repite ni se salta productos entre una página y otra.
const ORDENES = {
    "nombre-asc":  { nombre: 1, _id: 1 },
    "precio-asc":  { precio: 1, _id: 1 },
    "precio-desc": { precio: -1, _id: 1 },
};

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

// CAMBIO: ahora recibe "esAdmin" como 4.º parámetro. Por defecto es false:
// si alguna vez se olvida pasarlo, la consulta se trata como visitante (lo más seguro).
export const listarProducto = async (parametrosQuery = {}, pagina = 1, limite = 10, esAdmin = false) => {
    const desde = (pagina - 1) * limite;
    const filtros = {};

    if (parametrosQuery.nombre) {
        // CAMBIO: se escapa el texto antes de usarlo como regex (ver escaparRegex arriba).
        filtros.nombre = { $regex: escaparRegex(parametrosQuery.nombre), $options: 'i' };
    }
    if (parametrosQuery.sku) {
        // CAMBIO: igual que el nombre.
        filtros.sku = { $regex: escaparRegex(parametrosQuery.sku), $options: 'i' };
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

    // NUEVO: el público solo ve productos activos, sin importar lo que pida en la URL.
    // Va DESPUÉS del filtro "activo" de arriba a propósito: así un visitante no puede
    // saltárselo mandando ?activo=false.
    if (!esAdmin) {
        filtros.activo = true;
    }

    // NUEVO: elige el orden pedido en ?orden=... Si no viene o no está en la lista blanca,
    // se usa el orden que ya tenías (más recientes primero).
    const orden = Object.hasOwn(ORDENES, parametrosQuery.orden)
        ? ORDENES[parametrosQuery.orden]
        : { createdAt: -1, _id: -1 };

    // CAMBIO: la consulta se guarda en una variable para poder agregarle .select() según el rol.
    // Se mantiene tu populate de la categoría (categoriaId llega como { _id, nombre }).
    const consulta = productoModel.find(filtros)
        .populate('categoriaId', 'nombre')
        .collation({ locale: "es", strength: 2 }) // NUEVO: ordena A-Z ignorando mayúsculas y acentos
        .skip(desde).limit(limite).sort(orden);

    // NUEVO: el costo es información interna del negocio (su margen de ganancia).
    // Solo el administrador lo recibe; al público se le quita en la consulta misma.
    if (!esAdmin) {
        consulta.select("-costo");
    }

    const [total, productos] = await Promise.all([
        productoModel.countDocuments(filtros),
        consulta
    ]);

    return {
        totalDoc: total,
        pagActual: Number(pagina),
        totalPag: Math.ceil(total / limite),
        datos: productos
    };
};

// CAMBIO: también recibe "esAdmin" (por defecto false), por la misma razón que listarProducto.
export const buscarProductoId = async (id, esAdmin = false) => {
    const consulta = productoModel.findById(id).populate('categoriaId', 'nombre');

    // NUEVO: ocultar el costo al público.
    if (!esAdmin) {
        consulta.select("-costo");
    }
    const producto = await consulta;

    // NUEVO: un visitante no puede ver un producto desactivado, ni siquiera
    // conociendo su id. Se responde como si no existiera (el controller da 404).
    if (!esAdmin && producto && !producto.activo) return null;

    return producto;
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