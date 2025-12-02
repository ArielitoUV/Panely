import { Request, Response } from 'express';
import { prisma } from './database';

export const getRecetas = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const recetas = await prisma.receta.findMany({
      where: { userId },
      include: {
        ingredientes: {
          include: { insumo: true }
        }
      }
    });
    res.json(recetas);
  } catch (error) {
    res.status(500).json({ error: 'Error cargando recetas' });
  }
};

export const createReceta = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombre, cantidadBase, ingredientes } = req.body;

    const receta = await prisma.receta.create({
      data: {
        nombre,
        cantidadBase: Number(cantidadBase),
        userId,
        ingredientes: {
          create: ingredientes.map((ing: any) => ({
            insumoId: Number(ing.insumoId),
            cantidadGramos: Number(ing.cantidadGramos)
          }))
        }
      },
      include: { ingredientes: true }
    });
    res.json(receta);
  } catch (error) {
    res.status(500).json({ error: 'Error creando receta' });
  }
};

export const deleteReceta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.receta.delete({ where: { id: Number(id) } });
        res.json({ message: 'Receta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando receta' });
    }
}

export const createPedido = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombreCliente, cantidadPanes, montoTotal, recetaId, resumen } = req.body;

    const pedido = await prisma.pedido.create({
      data: {
        nombreCliente,
        cantidadPanes: Number(cantidadPanes),
        montoTotal: Number(montoTotal),
        recetaId: Number(recetaId),
        resumen,
        userId
      }
    });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Error guardando pedido' });
  }
};