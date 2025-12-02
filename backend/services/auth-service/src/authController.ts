import { Request, Response } from 'express';
import { prisma } from './database';
import { registerUser, loginUser } from './authService';

export const register = async (req: Request, res: Response) => {
    try {
        const result = await registerUser(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Error al registrar' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const result = await loginUser(req.body);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ error: error.message || 'Error al iniciar sesión' });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
};