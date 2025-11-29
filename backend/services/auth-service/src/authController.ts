// backend/services/auth-service/src/authController.ts
import { Request, Response } from "express";
import { prisma } from "./database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_never_used";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh123";

export const register = async (req: Request, res: Response) => {
  const { email, password, nombre, apellido, telefono, nombreEmpresa } = req.body;

  if (!email || !password || !nombre || !apellido) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  try {
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) return res.status(409).json({ error: "Email ya existe" });

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash, nombre, apellido, telefono, nombreEmpresa },
    });

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email, nombre: user.nombre },
      tokens: { accessToken, refreshToken },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body; // identifier = email o teléfono

  if (!identifier || !password) {
    return res.status(400).json({ error: "Faltan credenciales" });
  }

  try {
    // Buscar por email o por teléfono
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { telefono: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: "7d" });

    // Guardar refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        nombreEmpresa: user.nombreEmpresa,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Error del servidor" });
  }
};
