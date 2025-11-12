import { asyncHandler } from "../../../shared/middleware";
import { Request, Response } from "express";
import { UserService } from "./userService";
import { createErrorResponse, createSuccessResponse } from "../../../shared/utils";

const userService = new UserService();

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse("Usuario no autenticado"));
  }

  const profile = await userService.getProfile(userId);

  res
    .status(200)
    .json(
      createSuccessResponse(profile, "Perfil de usuario recuperado con éxito")
    );
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse("Usuario no autenticado"));
    }

    const profile = await userService.updateProfile(userId, req.body);

    res
      .status(200)
      .json(
        createSuccessResponse(profile, "Perfil de usuario actualizado con éxito")
      );
  }
);

export const deleteProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse("User not authenticated"));
    }

    await userService.deleteProfile(userId);

    res.status(204).json(createSuccessResponse(null, "Profile deleted")); // No content response
  }
);
