import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createErrorResponse } from "../../../shared/utils";


declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const publicRoutes = [
  "/health",
  "/status",
  "/",
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/refresh",
];


export function isPublicRoute(path: string): boolean {
  return publicRoutes.some((route) => {
    if (route.endsWith("*")) {
      return path.startsWith(route.slice(0, -1));
    }
    return path === route || path.startsWith(route + "/");
  });
}

export function gatewayAuth(req: Request, res: Response, next: NextFunction) {
  if (isPublicRoute(req.path)) {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json(createErrorResponse("Access token required"));
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET not configured in API Gateway");
    return res
      .status(500)
      .json(createErrorResponse("Server configuration error"));
  }

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res
        .status(403)
        .json(createErrorResponse("Invalid or expired token"));
    }

    // Add user info to request for forwarding to services
    req.user = decoded;

    // Add user info to headers for service communication
    req.headers["x-user-id"] = decoded.userId;
    req.headers["x-user-email"] = decoded.email;

    next();
  });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return next();
  }

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (!err) {
      req.user = decoded;
      req.headers["x-user-id"] = decoded.userId;
      req.headers["x-user-email"] = decoded.email;
    }
    next();
  });
}
