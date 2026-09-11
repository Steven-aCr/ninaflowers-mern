import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar, eliminar } from "../controllers/productoController.js";

// NOTA: proteger con verificarToken + verificarRol("administrador") una vez exista el middleware
// (crear, actualizar, eliminar deberían ser solo de administrador;
//  obtenerTodos y obtenerUno pueden quedar públicas para el catálogo)

const router = Router();

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;