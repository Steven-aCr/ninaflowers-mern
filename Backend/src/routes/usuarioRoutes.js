import { Router } from "express";
import { login, crear, obtenerTodos, obtenerUno, actualizar, eliminar } from "../controllers/usuarioController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";
import { opcionalHttpOnlyCooki } from "../middleware/cookieMiddleware.js";

const router = Router();

//Endpoint Publico
router.post("/login", opcionalHttpOnlyCooki, login);

// Endpoints protegidos exclusivamente para ADMINISTADORES.
router.use(verificarToken, permitirRoles('administrador'));

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;