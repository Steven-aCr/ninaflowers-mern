import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar, eliminar } from "../controllers/inventarioController.js";

// NOTA: proteger TODAS estas rutas con verificarToken + verificarRol("administrador")
// una vez exista el middleware. A diferencia del catálogo, el inventario
// no debe ser público en ningún caso.

const router = Router();

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;