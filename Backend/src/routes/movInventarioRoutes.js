import { Router } from "express";
import { crear, obtenerTodos, obtenerUno } from "../controllers/movInventarioController.js";

// NOTA: proteger TODAS estas rutas con verificarToken + verificarRol("administrador")
// una vez exista el middleware.
// No existen rutas de actualizar/eliminar: un movimiento es un registro histórico,
// no debe modificarse ni borrarse una vez creado.

const router = Router();

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);

export default router;