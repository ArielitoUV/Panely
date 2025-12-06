import { Request, Response } from 'express';
import { prisma } from './database';

// 1. REGISTRAR INGRESO (Venta)
export const registrarIngreso = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { monto, descripcion, metodo } = req.body;
    const montoInt = parseInt(monto);

    const nuevoIngreso = await prisma.ingreso.create({
      data: { monto: montoInt, descripcion, metodoPago: metodo, userId }
    });

    const cajaAbierta = await prisma.cajaDiaria.findFirst({ where: { userId, estado: "ABIERTA" } });
    if (cajaAbierta) {
      const dataToUpdate: any = { totalFinal: { increment: montoInt } };
      if (metodo === 'EFECTIVO') dataToUpdate.efectivo = { increment: montoInt };
      if (metodo === 'TARJETA') dataToUpdate.tarjeta = { increment: montoInt };
      if (metodo === 'TRANSFERENCIA') dataToUpdate.transferencia = { increment: montoInt };
      await prisma.cajaDiaria.update({ where: { id: cajaAbierta.id }, data: dataToUpdate });
    }
    res.json(nuevoIngreso);
  } catch (error) { res.status(500).json({ error: 'Error' }); }
};

// 2. REGISTRAR EGRESO (Gasto Manual con Categoría)
export const registrarEgreso = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { monto, descripcion, categoria } = req.body; // <--- Recibimos categoría
    const montoInt = parseInt(monto);

    if (isNaN(montoInt) || montoInt <= 0) {
        return res.status(400).json({ error: "Monto inválido" });
    }

    // A. Validar Caja Abierta
    const cajaAbierta = await prisma.cajaDiaria.findFirst({
        where: { userId, estado: "ABIERTA" }
    });

    if (!cajaAbierta) {
        return res.status(400).json({ error: "Debes abrir la caja para registrar gastos." });
    }

    // B. Transacción
    await prisma.$transaction(async (tx) => {
        // Crear registro con la categoría seleccionada
        await tx.egreso.create({
            data: {
                monto: montoInt,
                descripcion,
                categoria: categoria || "GASTO_GENERAL", // Usamos la que viene o default
                fecha: new Date(),
                userId
            }
        });

        // Restar de la caja
        await tx.cajaDiaria.update({
            where: { id: cajaAbierta.id },
            data: {
                totalFinal: { decrement: montoInt },
                efectivo: { decrement: montoInt }
            }
        });
    });

    res.json({ message: "Gasto registrado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar egreso' });
  }
};

export const getMovimientosHoy = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        // SOLO BUSCAMOS EN LA TABLA DE INGRESOS, ignorando egresos completamente para este módulo
        const movimientos = await prisma.ingreso.findMany({ 
            where: { 
                userId, 
                fecha: { gte: hoy } 
            }, 
            orderBy: { fecha: 'desc' } 
        });
        res.json(movimientos);
    } catch (e) { res.status(500).json({ error: "Error" }); }
}

export const getEgresos = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const egresos = await prisma.egreso.findMany({
            where: { userId },
            orderBy: { fecha: 'desc' },
            take: 50 
        });
        res.json(egresos);
    } catch (e) {
        res.status(500).json({ error: "Error al cargar egresos" });
    }
}