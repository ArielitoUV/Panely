// backend/services/auth-service/src/routes.ts
import { Router } from "express";
import { register, login } from "./authController";
import { crearInsumo, listarInsumos } from "./insumoController";
import { authenticateToken } from "../../../shared/middleware";

const router = Router();

// RUTAS SIN PREFIJO (porque el gateway las pone)
router.post("/register", register);
router.post("/login", login);

router.post("/insumos", authenticateToken, crearInsumo);
router.get("/insumos", authenticateToken, listarInsumos);

export default router;