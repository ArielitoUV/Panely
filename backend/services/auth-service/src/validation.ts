import Joi from 'joi';

// Regex para permitir letras, números y espacios (y tildes básicas si se desea, aquí simplificado a alfanumérico + espacios)
const nameRegex = /^[a-zA-Z0-9\s\u00C0-\u017F]+$/;

export const registerSchema = Joi.object({
    email: Joi.string().email().max(50).required().messages({
        'string.email': 'Debe ser un correo válido',
        'string.max': 'El correo no puede exceder 50 caracteres',
        'any.required': 'El correo es obligatorio',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es obligatoria',
    }),
    nombre: Joi.string().pattern(nameRegex).max(20).required().messages({
        'string.pattern.base': 'El nombre no debe contener símbolos especiales',
        'string.max': 'El nombre máximo 20 caracteres',
        'any.required': 'El nombre es obligatorio',
    }),
    apellido: Joi.string().pattern(nameRegex).max(20).required().messages({
        'string.pattern.base': 'El apellido no debe contener símbolos especiales',
        'string.max': 'El apellido máximo 20 caracteres',
        'any.required': 'El apellido es obligatorio',
    }),
    nombreEmpresa: Joi.string().pattern(nameRegex).max(20).required().messages({
        'string.pattern.base': 'El nombre de empresa no debe contener símbolos',
        'string.max': 'Nombre empresa máximo 20 caracteres',
        'any.required': 'Nombre de empresa es obligatorio',
    }),
    // Teléfono es opcional, puede ser string o null
    telefono: Joi.string().allow(null, '').optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'El correo es obligatorio',
    }),
    password: Joi.string().required().messages({
        'any.required': 'La contraseña es obligatoria',
    }),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});