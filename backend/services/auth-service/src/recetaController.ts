import { Request, Response } from 'express';
import { prisma } from './database';

export const getRecetas = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const recetas = await prisma.receta.findMany({
      where: { userId },
      include: {
        ingredientes: {
          include: {
            insumo: true
          }
        }
      }
    });
    res.json(recetas);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar recetas' });
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
    res.status(500).json({ error: 'Error al crear receta' });
  }
};

export const updateReceta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, cantidadBase, ingredientes } = req.body;

        const update = await prisma.$transaction([
            prisma.ingredienteReceta.deleteMany({ where: { recetaId: Number(id) } }),
            prisma.receta.update({
                where: { id: Number(id) },
                data: {
                    nombre,
                    cantidadBase: Number(cantidadBase),
                    ingredientes: {
                        create: ingredientes.map((ing: any) => ({
                            insumoId: Number(ing.insumoId),
                            cantidadGramos: Number(ing.cantidadGramos)
                        }))
                    }
                },
                include: { ingredientes: true }
            })
        ]);

        res.json(update[1]);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar receta" });
    }
}

export const deleteReceta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.receta.delete({ where: { id: Number(id) } });
        res.json({ message: 'Receta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando receta' });
    }
}

// --- NUEVO: OBTENER HISTORIAL DE PEDIDOS ---
export const getPedidos = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const pedidos = await prisma.pedido.findMany({
            where: { userId },
            orderBy: { fecha: 'desc' },
            include: { receta: true } // Incluimos datos de la receta para ver el nombre
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar historial" });
    }
}

// CREAR PEDIDO Y DESCONTAR STOCK
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

    // Descontar Stock
    const resumenObj = JSON.parse(resumen);
    const ingredientesUsados = resumenObj.ingredientes || [];

    if (ingredientesUsados.length > 0) {
        await prisma.$transaction(
            ingredientesUsados.map((ing: any) => {
                if (ing.insumoId) {
                    return prisma.insumo.update({
                        where: { id: ing.insumoId },
                        data: { stockGramos: { decrement: ing.cantidad } }
                    });
                } else {
                    return prisma.insumo.updateMany({
                         where: { userId, nombre: ing.nombre },
                         data: { stockGramos: { decrement: ing.cantidad } }
                    });
                }
            })
        );
    }

    res.json(pedido);
  } catch (error) {
    console.error("Error en pedido:", error);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  }
};