// backend/services/auth-service/src/routes.ts
import { Router } from "express";
import { register, login } from "./authController";

const router = Router();

// RUTAS SIN PREFIJO (porque el gateway las pone)
router.post("/register", register);
router.post("/login", login);

export default router;