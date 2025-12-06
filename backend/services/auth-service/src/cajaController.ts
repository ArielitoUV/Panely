import { Request, Response } from 'express';
import { prisma } from './database';

// OBTENER CAJA DE HOY
export const getCajaDiaria = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const caja = await prisma.cajaDiaria.findFirst({
      where: {
        userId,
        fecha: {
          gte: hoy,
          lt: manana
        }
      }
    });

    res.json(caja);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener caja' });
  }
};

// ABRIR CAJA
export const abrirCaja = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { montoInicial } = req.body;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Verificar si ya existe
    const existente = await prisma.cajaDiaria.findFirst({
        where: { userId, fecha: { gte: hoy } }
    });

    if (existente) {
        return res.status(400).json({ error: "Ya existe una caja para hoy" });
    }

    const nuevaCaja = await prisma.cajaDiaria.create({
      data: {
        userId,
        fecha: new Date(),
        montoInicial: Number(montoInicial),
        totalFinal: Number(montoInicial),
        estado: "ABIERTA"
      }
    });

    res.json(nuevaCaja);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al abrir caja' });
  }
};

// --- CERRAR CAJA Y CALCULAR GANANCIAS ---
export const cerrarCaja = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;

    // 1. Buscar caja abierta
    const caja = await prisma.cajaDiaria.findFirst({
      where: { userId, estado: "ABIERTA" }
    });

    if (!caja) return res.status(400).json({ error: "No hay caja abierta para cerrar" });

    // 2. Calcular totales reales desde las tablas de historial (para mayor precisión)
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    
    // Sumar Ingresos
    const ingresos = await prisma.ingreso.aggregate({
        _sum: { monto: true },
        where: { userId, fecha: { gte: hoy } }
    });
    const totalVentas = ingresos._sum.monto || 0;

    // Sumar Egresos
    const egresos = await prisma.egreso.aggregate({
        _sum: { monto: true },
        where: { userId, fecha: { gte: hoy } }
    });
    const totalEgresos = egresos._sum.monto || 0;

    // 3. Calcular Ganancia Neta
    const gananciaNeta = totalVentas - totalEgresos;

    // 4. Actualizar y Cerrar Caja
    const cajaCerrada = await prisma.cajaDiaria.update({
      where: { id: caja.id },
      data: {
        estado: "CERRADA",
        totalVentas,
        totalEgresos,
        gananciaNeta,
        // El totalFinal ya se fue actualizando en vivo, pero podemos recalcularlo si quieres "Arqueo":
        // totalFinal = MontoInicial + Ventas - Egresos (Asumiendo todo movimiento afecta caja)
        totalFinal: caja.montoInicial + totalVentas - totalEgresos
      }
    });

    res.json(cajaCerrada);
  } catch (error) {
    console.error("Error cerrando caja:", error);
    res.status(500).json({ error: 'Error al cerrar caja' });
  }
};

export const getHistorialCajas = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const historial = await prisma.cajaDiaria.findMany({
            where: { userId },
            orderBy: { fecha: 'desc' }
        });
        res.json(historial);
    } catch(e) { res.status(500).json({ error: "Error" }); }
}

// No se usa directamente pero necesario para que no rompa el router si lo importas
export const registrarMovimiento = async (req: Request, res: Response) => {
    res.json({ ok: true });
}