// shared/middleware.ts  (o donde tengas authenticateToken)

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
}

// Esto es clave: extender el tipo Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    // AQUÍ ESTÁ LA CLAVE: agregamos el user al req
    req.user = decoded as JwtPayload;
    next();
  });
};