import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, obtenerPorPedido, actualizar, eliminar } from "../controllers/envioController.js";

const router = Router();

router.get("/", obtenerTodos);
router.get("/pedido/:pedidoId", obtenerPorPedido);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;