import { Request, Response } from 'express';
import { prisma } from './database';
import bcrypt from 'bcryptjs';
import { generateTokens } from './authService'; // Solo importamos generateTokens

// REGISTRO DE USUARIO
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, nombre, apellido, telefono, nombreEmpresa } = req.body;

    // 1. Verificar si ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // 2. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Crear usuario en la Base de Datos
    const user = await prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        nombre, 
        apellido, 
        telefono, 
        nombreEmpresa,
        role: "USER" // Por defecto es usuario normal
      }
    });

    // 4. Generar Tokens
    const tokens = await generateTokens(user);

    // 5. Responder
    res.json({ 
      ...tokens, 
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } 
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// LOGIN DE USUARIO
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const tokens = await generateTokens(user);
    
    res.json({ 
      ...tokens, 
      user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } 
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// OBTENER PERFIL
export const me = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.sendStatus(404);
    
    // No devolvemos la contraseña
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (e) {
    res.sendStatus(500);
  }
};