import { Router } from "express";
import { crearSesion, verificar } from "../controllers/stripeController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/checkout", verificarToken, permitirRoles("cliente", "administrador"), crearSesion);
router.get("/verificar/:pagoId", verificarToken, permitirRoles("cliente", "administrador"), verificar);

export default router;