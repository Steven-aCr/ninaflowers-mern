import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, obtenerPorPedido, actualizarEstado } from "../controllers/pagoController.js";

const router = Router();

router.get("/", obtenerTodos);
router.get("/pedido/:pedidoId", obtenerPorPedido);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.patch("/:id/estado", actualizarEstado);

export default router;