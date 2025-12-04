import { Request, Response } from 'express';
import { prisma } from './database';

// --- OBTENER TIPOS DE INSUMO (CATÁLOGO) ---
export const getTiposInsumo = async (req: Request, res: Response) => {
    try {
        let tipos = await prisma.tipoInsumo.findMany({ orderBy: { nombre: 'asc' } });
        if (tipos.length === 0) {
            await prisma.tipoInsumo.createMany({
                data: [
                    { nombre: "Azúcar" },
                    { nombre: "Harina" },
                    { nombre: "Levadura" },
                    { nombre: "Maicena" },
                    { nombre: "Manteca" },
                    { nombre: "Mejorador" }, 
                    { nombre: "Sal" },
                ]
            });
            tipos = await prisma.tipoInsumo.findMany({ orderBy: { nombre: 'asc' } });
        }
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar tipos" });
    }
};

// --- NUEVO: OBTENER PRESENTACIONES (CATÁLOGO) ---
export const getTiposPresentacion = async (req: Request, res: Response) => {
    try {
        let tipos = await prisma.tipoPresentacion.findMany({ orderBy: { nombre: 'asc' } });
        
        // Sembrar datos si está vacío
        if (tipos.length === 0) {
            await prisma.tipoPresentacion.createMany({
                data: [
                    { nombre: "Bolsa Individual" },
                    { nombre: "Caja" },
                    { nombre: "Saco" },
                    { nombre: "Tarro" },
                    { nombre: "Paquete" }
                ]
            });
            tipos = await prisma.tipoPresentacion.findMany({ orderBy: { nombre: 'asc' } });
        }
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar presentaciones" });
    }
};

export const getInsumos = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const insumos = await prisma.insumo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(insumos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener insumos' });
  }
};

export const createInsumo = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;

    const cantidad = parseFloat(cantidadCompra);
    const valor = parseInt(valorCompra);
    
    let stockGramos = 0;
    if (unidadMedida === 'kg' || unidadMedida === 'lt') {
      stockGramos = cantidad * 1000;
    } else {
      stockGramos = cantidad;
    }

    const costoPorGramo = stockGramos > 0 ? (valor / stockGramos) : 0;

    const insumo = await prisma.insumo.create({
      data: {
        nombre, 
        presentacion,
        cantidadCompra: cantidad,
        unidadMedida,
        valorCompra: valor,
        stockGramos,
        costoPorGramo,
        userId
      }
    });
    res.json(insumo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear insumo' });
  }
};

// --- NUEVO: ACTUALIZAR INSUMO ---
export const updateInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;

        const cantidad = parseFloat(cantidadCompra);
        const valor = parseInt(valorCompra);
        
        // Recalcular stock y costos
        let stockGramos = 0;
        if (unidadMedida === 'kg' || unidadMedida === 'lt') {
            stockGramos = cantidad * 1000;
        } else {
            stockGramos = cantidad;
        }
        const costoPorGramo = stockGramos > 0 ? (valor / stockGramos) : 0;

        const actualizado = await prisma.insumo.update({
            where: { id: Number(id) },
            data: {
                nombre,
                presentacion,
                cantidadCompra: cantidad,
                unidadMedida,
                valorCompra: valor,
                stockGramos,
                costoPorGramo
            }
        });
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
}

export const deleteInsumo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.insumo.delete({ where: { id: Number(id) } });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};