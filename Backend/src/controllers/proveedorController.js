import * as proveedorService from "../services/proveedorService.js";

// agregar registro de proveedor.
export const crear = async (req, res) => {
    try {
        const resultado = await proveedorService.crearProveedor(req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await proveedorService.listarProveedor(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await proveedorService.buscarProveedorId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Proveedor no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const actualizar = async (req, res) => {
    try {
        const resultado = await proveedorService.modificarProveedor(req.params.id, req.body);
        if (!resultado) return res.status(404).json({ mensaje: 'Proveedor no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await proveedorService.eliminarProveedor(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Proveedor no encontrado.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};