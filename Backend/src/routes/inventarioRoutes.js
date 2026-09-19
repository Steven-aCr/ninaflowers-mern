import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar } from "../controllers/inventarioController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();
router.use(verificarToken, permitirRoles('administrador'));

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);

export default router;