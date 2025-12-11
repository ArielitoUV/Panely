import { Request, Response } from 'express';
import { prisma } from './database';

export const getReporte = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const { rango, mesInicio, mesFin } = req.query; // Nuevos params

        const hoy = new Date();
        let fechaInicio = new Date();
        let fechaFin = new Date();

        if (rango === 'mensual') {
            // Rango de meses (Offsets: 0 es actual, 1 anterior, etc.)
            const startOffset = Number(mesInicio) || 0;
            const endOffset = Number(mesFin) || 0;

            // Fecha Inicio: 1er día del mes de inicio
            fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - startOffset, 1);
            
            // Fecha Fin: Último día del mes de fin
            fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() - endOffset + 1, 0, 23, 59, 59, 999);

        } else if (rango === 'semanal') {
            const dia = hoy.getDay(); 
            const diff = hoy.getDate() - dia + (dia === 0 ? -6 : 1); 
            fechaInicio = new Date(hoy.setDate(diff));
            fechaInicio.setHours(0,0,0,0);
            fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaInicio.getDate() + 6);
            fechaFin.setHours(23,59,59,999);
        } else {
            // Diario
            fechaInicio.setHours(0,0,0,0);
            fechaFin.setHours(23,59,59,999);
        }

        const [ingresos, egresos] = await Promise.all([
            prisma.ingreso.findMany({
                where: { userId, fecha: { gte: fechaInicio, lte: fechaFin } },
                orderBy: { fecha: 'desc' }
            }),
            prisma.egreso.findMany({
                where: { userId, fecha: { gte: fechaInicio, lte: fechaFin } },
                orderBy: { fecha: 'desc' }
            })
        ]);

        const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0);
        const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0);

        res.json({
            rango: { inicio: fechaInicio, fin: fechaFin },
            resumen: { totalIngresos, totalEgresos, ganancia: totalIngresos - totalEgresos },
            detalles: { ingresos, egresos }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error generando reporte" });
    }
};