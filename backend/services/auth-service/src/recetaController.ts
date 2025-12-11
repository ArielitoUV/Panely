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

// --- CREAR PEDIDO + INGRESO + CAJA + STOCK (CORREGIDO TIMEOUT) ---
export const createPedido = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Usuario no identificado" });

    const { nombreCliente, cantidadPanes, montoTotal, recetaId, resumen } = req.body;

    // 1. Validaciones
    if (String(cantidadPanes).replace(/\D/g, "").length > 5) {
        return res.status(400).json({ error: "La cantidad de panes no puede exceder los 5 dígitos." });
    }
    if (nombreCliente && nombreCliente.length > 15) {
        return res.status(400).json({ error: "El nombre del cliente no puede exceder los 15 caracteres." });
    }

    // 2. Preparar Datos (Conversión estricta de tipos)
    let ingredientesUsados = [];
    try {
        const resumenObj = resumen ? JSON.parse(resumen) : {};
        ingredientesUsados = resumenObj.ingredientes || [];
    } catch (e) {
        console.warn("Error parseando resumen:", e);
    }

    // Aseguramos que sea entero para evitar errores en la DB
    const montoFinal = Math.round(Number(montoTotal) || 0);
    const cantidadPanesInt = parseInt(cantidadPanes);
    const recetaIdInt = parseInt(recetaId);

    // 3. Transacción Atómica CON TIMEOUT AUMENTADO
    const result = await prisma.$transaction(async (tx) => {
        
        // A. Crear el Pedido
        const pedido = await tx.pedido.create({
            data: {
                nombreCliente,
                cantidadPanes: cantidadPanesInt,
                montoTotal: montoFinal,
                recetaId: recetaIdInt,
                resumen: resumen || "",
                userId
            }
        });

        // B. Crear el Ingreso (Registro histórico para que aparezca en Ingresos)
        await tx.ingreso.create({
            data: {
                monto: montoFinal,
                descripcion: `Venta Pedido: ${nombreCliente} (${cantidadPanesInt} un.)`,
                metodoPago: "EFECTIVO", 
                fecha: new Date(),
                userId
            }
        });

        // C. Actualizar Caja Diaria (Si está abierta)
        const cajaAbierta = await tx.cajaDiaria.findFirst({
            where: { userId, estado: "ABIERTA" }
        });

        if (cajaAbierta) {
            await tx.cajaDiaria.update({
                where: { id: cajaAbierta.id },
                data: {
                    totalFinal: { increment: montoFinal },
                    efectivo: { increment: montoFinal },
                    totalVentas: { increment: montoFinal }, // Sumamos a ventas
                    gananciaNeta: { increment: montoFinal } // Sumamos a ganancia
                }
            });
        }

        // D. Descontar Stock (Esta es la parte que tardaba mucho)
        if (ingredientesUsados.length > 0) {
            for (const ing of ingredientesUsados) {
                if (ing.insumoId) {
                    const idInsumo = Number(ing.insumoId);
                    const cantidadDescontar = Number(ing.cantidad); 

                    // Verificamos que el insumo exista antes de descontar
                    const insumoExiste = await tx.insumo.findUnique({ where: { id: idInsumo } });
                    if (insumoExiste) {
                        await tx.insumo.update({
                            where: { id: idInsumo },
                            data: { stockGramos: { decrement: cantidadDescontar } }
                        });
                    }
                }
            }
        }

        return pedido;
    }, {
        maxWait: 5000, // Tiempo de espera para iniciar
        timeout: 20000 // AUMENTADO: 20 segundos para completar toda la operación
    });

    res.json(result);

  } catch (error: any) {
    console.error("Error crítico en createPedido:", error);
    const mensajeError = error.meta?.cause || error.message || "Error desconocido al procesar pedido";
    res.status(500).json({ error: `Fallo al procesar pedido: ${mensajeError}` });
  }
};