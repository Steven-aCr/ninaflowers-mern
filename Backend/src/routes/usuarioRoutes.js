import { Router } from "express";
import { login, crear, obtenerTodos, obtenerUno, actualizar, eliminar, yo, cerrarSesion, actualizarPerfilPropio } from "../controllers/usuarioController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";
import { opcionalHttpOnlyCooki } from "../middleware/cookieMiddleware.js";

const router = Router();

// Endpoints públicos
router.post("/login", opcionalHttpOnlyCooki, login);
router.post("/", crear);
router.post("/logout", cerrarSesion);

// Endpoint protegido, para CUALQUIER rol autenticado (no solo admin)
router.get("/me", verificarToken, yo);
router.put("/me", verificarToken, actualizarPerfilPropio);

// Endpoints protegidos exclusivamente para ADMINISTRADORES.
router.use(verificarToken, permitirRoles('administrador'));

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;