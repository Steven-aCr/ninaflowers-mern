import * as categoriaService from "../services/categoriaService.js";

// agregar registro de categoría.
export const crear = async (req, res) => {
    try {
        const resultado = await categoriaService.crearCategoria(req.body);
        res.status(201).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const obtenerTodos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.page) || 1;
        const limite = parseInt(req.query.limite) || 20;
        const resultado = await categoriaService.listarCategoria(req.query, pagina, limite);
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const obtenerUno = async (req, res) => {
    try {
        const resultado = await categoriaService.buscarCategoriaId(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

export const actualizar = async (req, res) => {
    try {
        const resultado = await categoriaService.modificarCategoria(req.params.id, req.body);
        if (!resultado) return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(400).json({ error: error.message }); }
};

export const eliminar = async (req, res) => {
    try {
        const resultado = await categoriaService.eliminarCategoria(req.params.id);
        if (!resultado) return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
        res.status(200).json(resultado);
    } catch (error) { res.status(500).json({ error: error.message }); }
};