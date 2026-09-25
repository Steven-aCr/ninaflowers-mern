import * as pagoService from "../services/pagoService.js";

export const crear = async (req, res) => {
  try {
    const { pedidoId, metodo } = req.body;
    const resultado = await pagoService.crearPagoCliente(pedidoId, metodo, req.usuario);
    res.status(201).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerTodos = async (req, res) => {
  try {
    const pagina = parseInt(req.query.page) || 1;
    const limite = parseInt(req.query.limite) || 20;
    const resultado = await pagoService.listarPagos(req.query, pagina, limite);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerUno = async (req, res) => {
  try {
    const resultado = await pagoService.buscarPagoId(req.params.id);

    if (!resultado) {
      return res.status(404).json({ mensaje: "Pago no encontrado." });
    }

    if (
      req.usuario.rol !== "administrador" &&
      resultado.usuarioId._id.toString() !== req.usuario.id.toString()
    ) {
      return res.status(403).json({ mensaje: "No tienes acceso a este pago." });
    }

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerPorPedido = async (req, res) => {
  try {
    const resultado = await pagoService.buscarPagoPedidoCliente(req.params.pedidoId, req.usuario);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const confirmar = async (req, res) => {
  try {
    const resultado = await pagoService.confirmarPagoManual(req.params.id, req.body.referenciaTransaccion);
    res.status(200).json({ mensaje: "Pago confirmado correctamente.", pago: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const reembolsar = async (req, res) => {
  try {
    const resultado = await pagoService.reembolsarPago(req.params.id);
    res.status(200).json({ mensaje: "Reembolso procesado correctamente.", pago: resultado });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const reporte = async (req, res) => {
  try {
    const resultado = await pagoService.reportePagos(req.query);
    res.status(200).json(resultado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};