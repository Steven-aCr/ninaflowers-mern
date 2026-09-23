import { Router } from "express";
import { crear, crearDesdeCarrito, misPedidos, obtenerTodos, obtenerUno, actualizar, cancelar, actualizarEstado } from "../controllers/pedidoController.js";
import { verificarToken, permitirRoles } from "../middleware/authMiddleware.js";

const router = Router();
router.use(verificarToken);

// Clientes y administradores.
router.post("/desde-carrito", permitirRoles("cliente", "administrador"), crearDesdeCarrito);
router.get("/mis-pedidos", permitirRoles("cliente", "administrador"), misPedidos);
router.get("/:id", permitirRoles("cliente", "administrador"), obtenerUno);

// Solo administradores.
router.get("/", permitirRoles("administrador"), obtenerTodos);
router.post("/", permitirRoles("administrador"), crear);
router.put("/:id", permitirRoles("administrador"), actualizar);
router.patch("/:id/estado", permitirRoles("administrador"), actualizarEstado);
router.patch("/:id/cancelar", permitirRoles("administrador"), cancelar);

export default router;