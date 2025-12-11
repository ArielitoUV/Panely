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

    if (String(cantidadBase).replace(/\D/g, "").length > 5) {
        return res.status(400).json({ error: "El rendimiento base no puede exceder los 5 dígitos." });
    }
    for (const ing of ingredientes) {
        if (String(ing.cantidadGramos).replace(/\D/g, "").length > 7) {
            return res.status(400).json({ error: "La cantidad en gramos no puede exceder los 7 dígitos." });
        }
    }

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

        if (String(cantidadBase).replace(/\D/g, "").length > 5) {
            return res.status(400).json({ error: "El rendimiento base no puede exceder los 5 dígitos." });
        }
        for (const ing of ingredientes) {
            if (String(ing.cantidadGramos).replace(/\D/g, "").length > 7) {
                return res.status(400).json({ error: "La cantidad en gramos no puede exceder los 7 dígitos." });
            }
        }

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

// --- HISTORIAL DE PEDIDOS ---
export const getPedidos = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.id;
        const pedidos = await prisma.pedido.findMany({
            where: { userId },
            orderBy: { fecha: 'desc' },
            include: { receta: true } 
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar historial" });
    }
}

// --- CREAR PEDIDO + INGRESO + CAJA + STOCK ---
export const createPedido = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombreCliente, cantidadPanes, montoTotal, recetaId, resumen } = req.body;

    // VALIDACIONES
    if (String(cantidadPanes).replace(/\D/g, "").length > 5) {
        return res.status(400).json({ error: "La cantidad de panes no puede exceder los 5 dígitos." });
    }
    if (nombreCliente) {
        if (nombreCliente.length > 15) {
            return res.status(400).json({ error: "El nombre del cliente no puede exceder los 15 caracteres." });
        }
        if (/\d/.test(nombreCliente)) {
            return res.status(400).json({ error: "El nombre del cliente no puede contener números." });
        }
    }

    const resumenObj = JSON.parse(resumen);
    const ingredientesUsados = resumenObj.ingredientes || [];
    const montoFinal = Number(montoTotal);

    // TRANSACCIÓN BASE DE DATOS
    const result = await prisma.$transaction(async (tx) => {
        
        // 1. Crear el Pedido
        const pedido = await tx.pedido.create({
            data: {
                nombreCliente,
                cantidadPanes: Number(cantidadPanes),
                montoTotal: montoFinal,
                recetaId: Number(recetaId),
                resumen,
                userId
            }
        });

        // 2. Crear el Ingreso (para que aparezca en el historial de Ingresos)
        await tx.ingreso.create({
            data: {
                monto: montoFinal,
                descripcion: `Venta Pedido: ${nombreCliente} (${cantidadPanes} un.)`,
                metodoPago: "EFECTIVO", 
                fecha: new Date(),
                userId
            }
        });

        // 3. Actualizar CAJA DIARIA (Total, Efectivo, Ventas y Ganancia)
        // Buscamos si hay caja abierta
        const cajaAbierta = await tx.cajaDiaria.findFirst({
            where: { userId, estado: "ABIERTA" }
        });

        if (cajaAbierta) {
            // AQUÍ ESTABA EL ERROR: Faltaba sumar a totalVentas y gananciaNeta
            await tx.cajaDiaria.update({
                where: { id: cajaAbierta.id },
                data: {
                    totalFinal: { increment: montoFinal },
                    efectivo: { increment: montoFinal },
                    totalVentas: { increment: montoFinal }, // <--- CLAVE PARA QUE APAREZCA EN VENTAS
                    gananciaNeta: { increment: montoFinal } // <--- CLAVE PARA QUE SUME GANANCIA
                }
            });
        }

        // 4. Descontar Stock de Insumos
        if (ingredientesUsados.length > 0) {
            for (const ing of ingredientesUsados) {
                if (ing.insumoId) {
                    await tx.insumo.update({
                        where: { id: ing.insumoId },
                        data: { stockGramos: { decrement: ing.cantidad } }
                    });
                }
            }
        }

        return pedido;
    });

    res.json(result);

  } catch (error) {
    console.error("Error en pedido:", error);
    res.status(500).json({ error: 'Error al procesar el pedido.' });
  }
};