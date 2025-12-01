// src/types/express.d.ts
import "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
      };
    }
  }
}