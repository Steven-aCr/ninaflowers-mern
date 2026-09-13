import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, obtenerPorPedido, actualizar, eliminar } from "../controllers/envioController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();
// Endpoints protegidos exclusivamente para ADMINISTADORES.
router.use(verificarToken, permitirRoles('administrador'));

router.get("/", obtenerTodos);
router.get("/pedido/:pedidoId", obtenerPorPedido);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;