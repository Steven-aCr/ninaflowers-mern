import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar, producir } from "../controllers/inventarioController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.use(verificarToken, permitirRoles("administrador"));

// La ruta de producción debe declararse antes de "/:id" para que
// Express no la interprete como un identificador de inventario.
router.post("/produccion", producir);

router.get("/", obtenerTodos);
router.post("/", crear);
router.get("/:id", obtenerUno);
router.put("/:id", actualizar);

export default router;