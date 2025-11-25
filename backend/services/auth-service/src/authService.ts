// backend/services/auth-service/src/authService.ts
import { AuthTokens, JWTPayload, ServiceError } from "../../../shared/types";
import { prisma } from "./database";
import { createServiceError } from "../../../shared/utils";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue } from "ms";

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      throw new Error("JWT secrets are not defined in environment variables");
    }
  }

  async register(
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    telefono?: string,
    nombreEmpresa?: string
  ): Promise<AuthTokens> {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw createServiceError("El email ya está registrado", 409);

    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        apellido,
        telefono,
        nombreEmpresa,
      },
    });

    return this.generateTokens(user.id); // ← id es number
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw createServiceError("Credenciales inválidas", 401);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw createServiceError("Credenciales inválidas", 401);

    return this.generateTokens(user.id); // ← number
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as JWTPayload;

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw createServiceError("Token inválido o expirado", 401);
      }

      await prisma.refreshToken.delete({ where: { id: storedToken.id } });

      return this.generateTokens(storedToken.user.id); // ← number
    } catch (error) {
      throw createServiceError("Token inválido", 401);
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async validateToken(token: string): Promise<JWTPayload> {
    const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw createServiceError("Usuario no encontrado", 404);
    return decoded;
  }

  async getUserById(userId: string | number) {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }, // ← convertimos por si viene string
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        nombreEmpresa: true,
        createdAt: true,
      },
    });

    if (!user) throw createServiceError("Usuario no encontrado", 404);
    return user;
  }

  async deleteUser(userId: string | number): Promise<void> {
    await prisma.user.delete({ where: { id: Number(userId) } });
  }

  // CLAVE: userId es number
  private async generateTokens(userId: number): Promise<AuthTokens> {
    const payload = { userId }; // ← userId es number

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as StringValue,
    });

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn as StringValue,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: userId, // ← number
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}