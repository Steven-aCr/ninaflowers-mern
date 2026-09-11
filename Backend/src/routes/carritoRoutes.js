import { Router } from "express";
import { obtener, agregarItem, actualizarCantidad, eliminarItem, vaciar } from "../controllers/carritoController.js";

const router = Router();

router.get("/:usuarioId", obtener);
router.post("/:usuarioId/items", agregarItem);
router.put("/:usuarioId/items/:productoId", actualizarCantidad);
router.delete("/:usuarioId/items/:productoId", eliminarItem);
router.delete("/:usuarioId", vaciar);

export default router;