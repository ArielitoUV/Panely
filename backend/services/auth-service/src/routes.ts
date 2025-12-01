// backend/services/auth-service/src/routes.ts

import { Router } from "express";
import { register, login } from "./authController";
import { crearInsumo, listarInsumos } from "./insumoController";
import { abrirCaja, obtenerCajaHoy, cerrarCaja } from "./cajaController";
import { authenticateToken } from "../../../shared/middleware";

const router = Router();

// AUTH
router.post("/register", register);
router.post("/login", login);

// INSUMOS
router.post("/insumos", authenticateToken, crearInsumo);
router.get("/insumos", authenticateToken, listarInsumos);

// CAJA DIARIA ← TIENE QUE ESTAR EXACTAMENTE ASÍ
router.get("/caja/hoy", authenticateToken, obtenerCajaHoy);
router.post("/caja/abrir", authenticateToken, abrirCaja);
router.put("/caja/cerrar/:id", authenticateToken, cerrarCaja);


export default router;