import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar, cancelar } from "../controllers/pedidoController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();
// Endpoints protegidos exclusivamente para ADMINISTADORES.
router.use(verificarToken, permitirRoles('administrador'));

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.patch("/:id/cancelar", cancelar);

export default router;