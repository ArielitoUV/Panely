import jwt from 'jsonwebtoken';
import { prisma } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

// Middleware para proteger rutas
export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Función para generar tokens (Login/Registro)
export const generateTokens = async (user: any) => {
  const userId = Number(user.id); // Aseguramos que sea número

  // Incluimos el rol en el token
  const accessToken = jwt.sign(
    { id: userId, role: user.role, email: user.email }, 
    JWT_SECRET, 
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: userId }, 
    JWT_REFRESH_SECRET, 
    { expiresIn: '7d' }
  );

  try {
    // Borrar tokens viejos del usuario para no acumular basura
    await prisma.refreshToken.deleteMany({
      where: { userId: userId }
    });

    // Guardar el nuevo refresh token
    await prisma.refreshToken.create({
      data: {
        userId: userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error("Error guardando tokens:", error);
    // Continuamos aunque falle el guardado del refresh para no bloquear el login
  }

  return { accessToken, refreshToken };
};