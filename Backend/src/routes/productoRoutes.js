import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar, eliminar } from "../controllers/productoController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";
import { uploadImagenesProducto } from "../middleware/uploadMiddleware.js";

const router = Router();
router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
// Endpoints protegidos exclusivamente para ADMINISTADORES.

router.use(verificarToken, permitirRoles('administrador'));

router.post("/", uploadImagenesProducto, crear);
router.put("/:id", uploadImagenesProducto, actualizar);
router.delete("/:id", eliminar);

export default router;