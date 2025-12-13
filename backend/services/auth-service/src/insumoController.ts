import { Request, Response } from 'express';
import { prisma } from './database';

// --- OBTENER TIPOS DE INSUMO (CATÁLOGO BASE) ---
export const getTiposInsumo = async (req: Request, res: Response) => {
    try {
        let tipos = await prisma.tipoInsumo.findMany({ orderBy: { nombre: 'asc' } });
        
        if (tipos.length === 0) {
            await prisma.tipoInsumo.createMany({
                data: [
                    { nombre: "Azúcar" },
                    { nombre: "Harina" },
                    { nombre: "Levadura" },
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

// --- OBTENER PRESENTACIONES (CATÁLOGO BASE) ---
export const getTiposPresentacion = async (req: Request, res: Response) => {
    try {
        let tipos = await prisma.tipoPresentacion.findMany({ orderBy: { nombre: 'asc' } });
        
        if (tipos.length === 0) {
            await prisma.tipoPresentacion.createMany({
                data: [
                    { nombre: "Bolsa Individual" },
                    { nombre: "Paquete" },
                    { nombre: "Saco" },
                    { nombre: "Tarro" }
                ]
            });
            tipos = await prisma.tipoPresentacion.findMany({ orderBy: { nombre: 'asc' } });
        }
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar presentaciones" });
    }
};

// --- LISTAR INVENTARIO ---
export const getInsumos = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'No autorizado' });

    const insumos = await prisma.insumo.findMany({
      where: { userId },
      orderBy: { nombre: 'asc' }
    });
    res.json(insumos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener insumos' });
  }
};

// --- CREAR INSUMO + EGRESO ---
export const createInsumo = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;

    if (String(cantidadCompra).replace(/\D/g, "").length > 5) {
        return res.status(400).json({ error: "La cantidad no puede exceder los 5 dígitos." });
    }
    if (nombre.toLowerCase().includes("maicena")) {
         return res.status(400).json({ error: "Este insumo ya no está permitido." });
    }

    const cantidadNueva = parseFloat(cantidadCompra);
    const valorNuevo = parseInt(valorCompra);
    
    let gramosNuevos = 0;
    if (unidadMedida === 'kg' || unidadMedida === 'lt') {
        gramosNuevos = cantidadNueva * 1000;
    } else {
        gramosNuevos = cantidadNueva;
    }

    const costoPorGramoNuevo = gramosNuevos > 0 ? (valorNuevo / gramosNuevos) : 0;

    await prisma.$transaction(async (tx) => {
        
        const insumoExistente = await tx.insumo.findFirst({
            where: { userId, nombre, presentacion } 
        });

        if (insumoExistente) {
            const valorStockActual = insumoExistente.stockGramos * insumoExistente.costoPorGramo;
            const stockTotal = insumoExistente.stockGramos + gramosNuevos;
            const nuevoCosto = stockTotal > 0 ? ((valorStockActual + valorNuevo) / stockTotal) : 0;

            await tx.insumo.update({
                where: { id: insumoExistente.id },
                data: {
                    stockGramos: stockTotal,
                    costoPorGramo: nuevoCosto,
                    cantidadCompra: cantidadNueva,
                    valorCompra: valorNuevo
                }
            });
        } else {
            await tx.insumo.create({
                data: {
                    nombre, presentacion, cantidadCompra: cantidadNueva, unidadMedida,
                    valorCompra: valorNuevo, stockGramos: gramosNuevos, costoPorGramo: costoPorGramoNuevo, userId
                }
            });
        }

        await tx.egreso.create({
            data: {
                monto: valorNuevo,
                descripcion: `Compra Insumo: ${nombre} ${presentacion} (${cantidadNueva} ${unidadMedida})`,
                categoria: "COMPRA_INSUMO", 
                fecha: new Date(),
                userId
            }
        });
    });

    res.json({ message: "Stock ingresado y datos actualizados correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar insumo' });
  }
};

// --- ACTUALIZAR INSUMO + CORREGIR EGRESO ASOCIADO ---
export const updateInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;
        // @ts-ignore
        const userId = req.user?.id; // Necesario para buscar el egreso

        // 1. Conversión de Tipos
        const cantidadFloat = parseFloat(cantidadCompra);
        const valorInt = parseInt(valorCompra);

        if (isNaN(cantidadFloat) || isNaN(valorInt)) {
            return res.status(400).json({ error: "Los valores deben ser numéricos." });
        }

        // 2. Recalcular Stock y Costo
        let nuevoStockGramos = 0;
        if (unidadMedida === 'kg' || unidadMedida === 'lt') {
            nuevoStockGramos = cantidadFloat * 1000;
        } else {
            nuevoStockGramos = cantidadFloat;
        }
        const nuevoCostoPorGramo = nuevoStockGramos > 0 ? (valorInt / nuevoStockGramos) : 0;

        // 3. TRANSACCIÓN: Corrige Insumo Y busca/corrige el Egreso
        await prisma.$transaction(async (tx) => {
            
            // A. Obtener datos anteriores para buscar el egreso correcto
            const insumoAnterior = await tx.insumo.findUnique({ where: { id: Number(id) } });
            
            if (!insumoAnterior) throw new Error("Insumo no encontrado");

            // B. Actualizar el Insumo
            const insumoActualizado = await tx.insumo.update({
                where: { id: Number(id) },
                data: {
                    nombre,
                    presentacion,
                    unidadMedida,
                    cantidadCompra: cantidadFloat, // Corregimos visual
                    valorCompra: valorInt,         // Corregimos visual
                    stockGramos: nuevoStockGramos, // Corregimos stock físico
                    costoPorGramo: nuevoCostoPorGramo // Corregimos costo unitario
                }
            });

            // C. Buscar y Corregir el Egreso correspondiente
            // Buscamos el último egreso que coincida con el valor que tenía el insumo antes del error
            const egresoAjustar = await tx.egreso.findFirst({
                where: {
                    userId: insumoAnterior.userId,
                    categoria: "COMPRA_INSUMO",
                    monto: insumoAnterior.valorCompra, // Clave: Buscamos por el monto "erróneo" original
                },
                orderBy: { fecha: 'desc' } // El más reciente (asumiendo que fue el último error)
            });

            if (egresoAjustar) {
                await tx.egreso.update({
                    where: { id: egresoAjustar.id },
                    data: {
                        monto: valorInt, // Actualizamos al nuevo monto corregido
                        descripcion: `Compra Insumo: ${nombre} ${presentacion} (${cantidadFloat} ${unidadMedida}) (Corregido)`
                    }
                });
            }

            return insumoActualizado;
        });

        res.json({ message: "Insumo y Egreso corregidos exitosamente" });

    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ error: "No se pudo actualizar el insumo. Verifica los datos." });
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