import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// LEE EL SECRETO DESDE EL .env DEL auth-service (¡ESTO ES LA CLAVE!)
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_never_used";

export interface AuthRequest extends Request {
  user?: { userId: number };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && (authHeader as string).split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      console.log("Token inválido:", err.message);
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = { userId: decoded.userId };
    next();
  });
};