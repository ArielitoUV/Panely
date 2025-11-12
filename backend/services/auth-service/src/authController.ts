import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/middleware";
import { AuthService } from "./authService";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../../shared/utils";

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const tokens = await authService.register(email, password);

  res
    .status(201)
    .json(createSuccessResponse(tokens, "Usuario registrado exitosamente"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const tokens = await authService.login(email, password);

  res
    .status(200)
    .json(createSuccessResponse(tokens, "Usuario logueado exitosamente"));
});

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);

    res
      .status(200)
      .json(createSuccessResponse(tokens, "Token refrescado exitosamente"));
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);

  res
    .status(200)
    .json(createSuccessResponse(null, "Usuario deslogueado exitosamente"));
});

export const validateToken = asyncHandler(
  async (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json(createErrorResponse("No token proporcionado"));
    }

    const payload = await authService.validateToken(token);

    res.status(200).json(createSuccessResponse(payload, "Token is valid"));
  }
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse("Unauthorized"));
  }

  const user = await authService.getUserById(userId);

  if (!user) {
    return res.status(404).json(createErrorResponse("Usuario no encontrado"));
  }

  return res
    .status(200)
    .json(createSuccessResponse(user, "Perfil de usuario recuperado"));
});

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    await authService.deleteUser(userId);

    return res
      .status(200)
      .json(createSuccessResponse(null, "Cuenta eliminada exitosamente"));
  }
);
