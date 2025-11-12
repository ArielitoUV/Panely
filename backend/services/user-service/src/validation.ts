import Joi from "joi";

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional().messages({
    "string.min": "El nombre debe tener al menos 1 carácter",
    "string.max": "El nombre no debe exceder 50 caracteres",
  }),
  lastName: Joi.string().min(1).max(50).optional().messages({
    "string.min": "El apellido debe tener al menos 1 carácter",
    "string.max": "El apellido no debe exceder 50 caracteres",
  }),
  bio: Joi.string().max(500).optional().allow("").messages({
    "string.max": "La biografía no debe exceder 500 caracteres",
  }),
  avatarUrl: Joi.string().uri().optional().allow("").messages({
    "string.uri": "La URL del avatar debe ser una URL válida",
  }),
  preferences: Joi.object().optional().messages({
    "object.base": "Las preferencias deben ser un objeto válido",
  }),
});

export const createProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional().messages({
    "string.min": "El nombre debe tener al menos 1 carácter",
    "string.max": "El nombre no debe exceder 50 caracteres",
  }),
  lastName: Joi.string().min(1).max(50).optional().messages({
    "string.min": "El apellido debe tener al menos 1 carácter",
    "string.max": "El apellido no debe exceder 50 caracteres",
  }),
  bio: Joi.string().max(500).optional().allow("").messages({
    "string.max": "La biografía no debe exceder 500 caracteres",
  }),
  avatarUrl: Joi.string().uri().optional().allow("").messages({
    "string.uri": "La URL del avatar debe ser una URL válida",
  }),
  preferences: Joi.object().optional().default({}).messages({
    "object.base": "Las preferencias deben ser un objeto válido",
  }),
});
