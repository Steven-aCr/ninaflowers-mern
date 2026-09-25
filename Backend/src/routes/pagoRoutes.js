import { Router } from "express";
import {
  crear,
  obtenerTodos,
  obtenerUno,
  obtenerPorPedido,
  confirmar,
  reembolsar,
  reporte
} from "../controllers/pagoController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.use(verificarToken);

router.post("/", permitirRoles("cliente", "administrador"), crear);
router.get("/pedido/:pedidoId", permitirRoles("cliente", "administrador"), obtenerPorPedido);
router.get("/reporte", permitirRoles("administrador"), reporte);
router.get("/", permitirRoles("administrador"), obtenerTodos);

// El administrador no cambia estados directamente: confirma
// específicamente la recepción de efectivo o transferencia.
router.patch("/:id/confirmar", permitirRoles("administrador"), confirmar);

// Única modificación permitida después de completar una transacción.
router.post("/:id/reembolsar", permitirRoles("administrador"), reembolsar);

router.get("/:id", permitirRoles("cliente", "administrador"), obtenerUno);

export default router;