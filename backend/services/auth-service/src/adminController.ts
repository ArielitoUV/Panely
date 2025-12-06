import { Request, Response } from 'express';
import { prisma } from './database';
import bcrypt from 'bcryptjs';
import { generateTokens } from './authService';

// LOGIN ADMIN
export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: "Contraseña incorrecta" });

        // Validar Rol
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Acceso denegado: No eres administrador" });
        }

        const tokens = await generateTokens(user);
        
        res.json({ ...tokens, user: { id: user.id, nombre: user.nombre, role: user.role } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// OBTENER USUARIOS
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Requiere rol ADMIN" });

        const users = await prisma.user.findMany({
            where: { role: 'USER' },
            include: {
                _count: {
                    select: { insumos: true, recetas: true, pedidos: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar usuarios" });
    }
};

// BORRAR USUARIO
export const deleteUser = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Requiere rol ADMIN" });
        
        const { id } = req.params;
        await prisma.user.delete({ where: { id: Number(id) } });
        
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar usuario" });
    }
};