import { JWTPayload, ServiceResponse } from "../../../shared/types";
import { createServiceError } from "../../../shared/utils";
import axios from "axios";

export class AuthClient {
  private readonly authServiceUrl: string;

  constructor() {
    this.authServiceUrl =
      process.env.AUTH_SERVICE_URL || "http://localhost:3001";
  }

  async validateToken(token: string): Promise<JWTPayload> {
    try {
      const response = await axios.post<ServiceResponse<JWTPayload>>(
        `${this.authServiceUrl}/auth/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        }
      );

      if (!response.data.success || !response.data.data) {
        throw createServiceError(
          "Invalid token response from auth service",
          401
        );
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw createServiceError("Token inválido", 401);
      }
      if (error.code === "ECONNRREFUSED") {
        throw createServiceError("El servicio de autenticación no está disponible", 503);
      }
      throw createServiceError("Ocurrió un error inesperado", 500);
    }
  }
}
