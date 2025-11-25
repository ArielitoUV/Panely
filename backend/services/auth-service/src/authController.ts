// backend/services/auth-service/src/authController.ts
import { Request, Response } from "express";
import { prisma } from "./database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "temporal123";
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
  res.json({ message: "Login listo (lo hacemos después)" });
};