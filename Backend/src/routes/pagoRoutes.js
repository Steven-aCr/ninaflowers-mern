import { Router } from "express";
import { crear, obtenerTodos, obtenerUno, obtenerPorPedido, actualizarEstado, reporte } from "../controllers/pagoController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();
// Endpoints protegidos exclusivamente para ADMINISTADORES.
router.use(verificarToken, permitirRoles('administrador'));

router.get("/", obtenerTodos);
router.get("/reporte", reporte);             // ⚠️ debe ir ANTES de "/:id"
router.get("/pedido/:pedidoId", obtenerPorPedido);
router.get("/:id", obtenerUno);
router.post("/", crear);
router.patch("/:id/estado", actualizarEstado);

export default router;