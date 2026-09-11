import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, actualizar, cancelar } from "../controllers/pedidoController.js";

const router = Router();

router.get("/", obtenerTodos);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.put("/:id", actualizar);
router.patch("/:id/cancelar", cancelar);

export default router;