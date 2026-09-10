import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar, eliminar } from "../controllers/usuarioController.js";

// NOTA1: cuando exista el módulo de autenticación, se importara a esta seccion.
// import { verificarToken, verificarRol } from "../middleware/authMiddleware.js";

const router = Router();

// NOTA2: proteger con verificarToken + verificarRol("administrador") una vez exista el middleware
router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;