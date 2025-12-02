import { Request, Response } from 'express';
import { prisma } from './database';

// OBTENER
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

// CREAR (Con lógica de gramos)
export const createInsumo = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;

    const cantidad = parseFloat(cantidadCompra);
    const valor = parseInt(valorCompra);
    
    // Conversión
    let stockGramos = 0;
    if (unidadMedida === 'kg') {
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

// ELIMINAR
export const deleteInsumo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.insumo.delete({ where: { id: Number(id) } });
    res.json({ message: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};