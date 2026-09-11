import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar, eliminar } from "../controllers/proveedorController.js";

// NOTA: proteger con verificarToken + verificarRol("administrador") una vez exista el middleware
// (Proveedor es información interna, ninguna ruta debe ser pública)

const router = Router();

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

export default router;