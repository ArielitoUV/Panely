import { Request, Response } from 'express';
import { prisma } from './database';

// Registrar un ingreso y actualizar la caja automáticamente
export const registrarIngreso = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { monto, descripcion, metodo } = req.body;

    const montoInt = parseInt(monto);

    // 1. Guardar el registro individual (Historial)
    const nuevoIngreso = await prisma.ingreso.create({
      data: {
        monto: montoInt,
        descripcion,
        metodoPago: metodo,
        userId
      }
    });

    // 2. Buscar si hay una caja abierta para sumar el dinero
    const cajaAbierta = await prisma.cajaDiaria.findFirst({
      where: { userId, estado: "ABIERTA" }
    });

    if (cajaAbierta) {
      // Actualizar los montos de la caja
      const dataToUpdate: any = {
        totalFinal: { increment: montoInt } // Siempre sube el total
      };

      // Sumar al método específico
      if (metodo === 'EFECTIVO') dataToUpdate.efectivo = { increment: montoInt };
      if (metodo === 'TARJETA') dataToUpdate.tarjeta = { increment: montoInt };
      if (metodo === 'TRANSFERENCIA') dataToUpdate.transferencia = { increment: montoInt };

      await prisma.cajaDiaria.update({
        where: { id: cajaAbierta.id },
        data: dataToUpdate
      });
    }

    res.json(nuevoIngreso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar ingreso' });
  }
};

// Obtener movimientos de hoy
export const getMovimientosHoy = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const hoy = new Date();
        hoy.setHours(0,0,0,0);

        const movimientos = await prisma.ingreso.findMany({
            where: { 
                userId, 
                fecha: { gte: hoy }
            },
            orderBy: { fecha: 'desc' }
        });
        res.json(movimientos);
    } catch (e) {
        res.status(500).json({ error: "Error cargando movimientos" });
    }
}