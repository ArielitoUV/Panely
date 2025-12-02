import { Request, Response, NextFunction } from 'express';
import { prisma } from './database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_defensa';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';

// Middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    // @ts-ignore
    req.user = user;
    next();
  });
};

export const generateTokens = async (userId: number) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  await prisma.refreshToken.deleteMany({ where: { userId } });
  
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return { accessToken, refreshToken };
};

// --- AQUÍ ESTABA EL ERROR: AHORA DEVOLVEMOS EL USUARIO ---
export const registerUser = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error("El email ya está registrado");

  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      nombre: data.nombre,
      apellido: data.apellido,
      nombreEmpresa: data.nombreEmpresa,
      telefono: data.telefono
    },
  });
  
  const tokens = await generateTokens(user.id);
  // Devolvemos tokens Y el objeto usuario
  return { ...tokens, user }; 
};

export const loginUser = async (data: any) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error("Credenciales inválidas");

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) throw new Error("Credenciales inválidas");

  const tokens = await generateTokens(user.id);
  return { ...tokens, user };
};