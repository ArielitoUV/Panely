import { Request, Response } from 'express';
import { prisma } from './database';

// --- OBTENER TODAS LAS RECETAS ---
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
            insumo: true // Traemos info del insumo (costo, nombre)
          }
        }
      }
    });
    res.json(recetas);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar recetas' });
  }
};

// --- CREAR RECETA ---
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
      include: { ingredientes: true } // typo fix: ingredientes
    });

    res.json(receta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear receta' });
  }
};

// --- ACTUALIZAR RECETA (Nuevo) ---
export const updateReceta = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const { id } = req.params;
        const { nombre, cantidadBase, ingredientes } = req.body;

        // Usamos una transacción: Borramos ingredientes viejos y ponemos los nuevos
        // Es más fácil que intentar actualizar uno por uno
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

        res.json(update[1]); // Devolvemos la receta actualizada
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar receta" });
    }
}

// --- BORRAR RECETA ---
export const deleteReceta = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.receta.delete({ where: { id: Number(id) } });
        res.json({ message: 'Receta eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando receta' });
    }
}

// --- GUARDAR PEDIDO ---
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
    console.error(error);
    res.status(500).json({ error: 'Error al guardar pedido' });
  }
};