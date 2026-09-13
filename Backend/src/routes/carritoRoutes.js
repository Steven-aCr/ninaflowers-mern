import { Router } from "express";
import { obtener, agregarItem, actualizarCantidad, eliminarItem, vaciar } from "../controllers/carritoController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();

// Endpoints protegidos exclusivamente para ADMINISTADORES.
router.use(verificarToken, permitirRoles('administrador'));

router.get("/:usuarioId", obtener);
router.post("/:usuarioId/items", agregarItem);
router.put("/:usuarioId/items/:productoId", actualizarCantidad);
router.delete("/:usuarioId/items/:productoId", eliminarItem);
router.delete("/:usuarioId", vaciar);

export default router;