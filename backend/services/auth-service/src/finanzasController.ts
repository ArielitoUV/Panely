import { Request, Response } from 'express';
import { prisma } from './database';

// ... (registrarIngreso, registrarEgreso, getMovimientosHoy, getEgresos IGUAL QUE ANTES) ...
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

export const registrarEgreso = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { monto, descripcion, categoria } = req.body;
    const montoInt = parseInt(monto);

    if (isNaN(montoInt) || montoInt <= 0) return res.status(400).json({ error: "Monto inválido" });

    const cajaAbierta = await prisma.cajaDiaria.findFirst({ where: { userId, estado: "ABIERTA" } });
    if (!cajaAbierta) return res.status(400).json({ error: "Debes abrir la caja." });

    await prisma.$transaction(async (tx) => {
        await tx.egreso.create({
            data: { monto: montoInt, descripcion, categoria: categoria || "GASTO_GENERAL", userId }
        });
        await tx.cajaDiaria.update({
            where: { id: cajaAbierta.id },
            data: { totalFinal: { decrement: montoInt }, efectivo: { decrement: montoInt } }
        });
    });
    res.json({ message: "Gasto registrado" });
  } catch (error) { res.status(500).json({ error: 'Error' }); }
};

export const getMovimientosHoy = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        const movimientos = await prisma.ingreso.findMany({ where: { userId, fecha: { gte: hoy } }, orderBy: { fecha: 'desc' } });
        res.json(movimientos);
    } catch (e) { res.status(500).json({ error: "Error" }); }
}

export const getEgresos = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const egresos = await prisma.egreso.findMany({ where: { userId }, orderBy: { fecha: 'desc' }, take: 50 });
        res.json(egresos);
    } catch (e) { res.status(500).json({ error: "Error" }); }
}

// --- DASHBOARD TIEMPO REAL ---
export const getDashboardData = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        
        // Semana actual
        const hoy = new Date();
        const diaSemana = hoy.getDay(); 
        const diff = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); 
        const lunes = new Date(hoy.setDate(diff)); lunes.setHours(0,0,0,0);
        const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6); domingo.setHours(23,59,59,999);

        // Consultar Tablas Reales
        const ingresos = await prisma.ingreso.findMany({ where: { userId, fecha: { gte: lunes, lte: domingo } } });
        const egresos = await prisma.egreso.findMany({ where: { userId, fecha: { gte: lunes, lte: domingo } } });

        // Cálculos
        const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
        const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0);
        const gananciaNeta = totalIngresos - totalEgresos;

        // Gráfico
        const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        const grafico = diasSemana.map((nombreDia, index) => {
            const fechaDia = new Date(lunes); fechaDia.setDate(lunes.getDate() + index);
            const fechaInicio = new Date(fechaDia); fechaInicio.setHours(0,0,0,0);
            const fechaFin = new Date(fechaDia); fechaFin.setHours(23,59,59,999);

            const ing = ingresos.filter(i => i.fecha >= fechaInicio && i.fecha <= fechaFin).reduce((s, i) => s + i.monto, 0);
            const egr = egresos.filter(e => e.fecha >= fechaInicio && e.fecha <= fechaFin).reduce((s, e) => s + e.monto, 0);

            return { name: nombreDia, ingresos: ing, egresos: egr };
        });

        res.json({
            ingresosSemana: totalIngresos,
            egresosSemana: totalEgresos,
            ganancia: gananciaNeta,
            grafico
        });

    } catch (error) { res.status(500).json({ error: "Error dashboard" }); }
}