import { Request, Response } from 'express';
import { prisma } from './database';

export const getCajaDiaria = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        
        const caja = await prisma.cajaDiaria.findFirst({
            where: { userId, fecha: { gte: hoy } }
        });
        res.json(caja || null);
    } catch (e) { res.status(500).json({error: "Error"}); }
};

export const abrirCaja = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const { montoInicial } = req.body;
        
        // Cerrar cajas previas abiertas por seguridad
        await prisma.cajaDiaria.updateMany({
            where: { userId, estado: "ABIERTA" },
            data: { estado: "CERRADA" }
        });

        const caja = await prisma.cajaDiaria.create({
            data: {
                userId,
                montoInicial: Number(montoInicial),
                fecha: new Date(),
                totalFinal: Number(montoInicial),
                estado: "ABIERTA"
            }
        });
        res.json(caja);
    } catch (e) { res.status(500).json({error: "Error"}); }
};

export const cerrarCaja = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const caja = await prisma.cajaDiaria.findFirst({
            where: { userId, estado: "ABIERTA" }
        });
        if(!caja) return res.status(400).json({error: "No hay caja abierta"});

        const cerrada = await prisma.cajaDiaria.update({
            where: { id: caja.id },
            data: { estado: "CERRADA" }
        });
        res.json(cerrada);
    } catch (e) { res.status(500).json({error: "Error"}); }
};

export const registrarMovimiento = async (req: Request, res: Response) => {
    res.json({ message: "OK" });
};

export const getHistorialCajas = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    const historial = await prisma.cajaDiaria.findMany({
        where: { userId },
        orderBy: { fecha: 'desc' }
    });
    res.json(historial);
};