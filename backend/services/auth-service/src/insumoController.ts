import { Request, Response } from 'express';
import { prisma } from './database';

// --- OBTENER TIPOS DE INSUMO (CATÁLOGO BASE) ---
export const getTiposInsumo = async (req: Request, res: Response) => {
    try {
        let tipos = await prisma.tipoInsumo.findMany({ orderBy: { nombre: 'asc' } });
        
        // Si no hay datos, inicializamos SOLO con lo permitido
        if (tipos.length === 0) {
            await prisma.tipoInsumo.createMany({
                data: [
                    { nombre: "Azúcar" },
                    { nombre: "Harina" },
                    { nombre: "Levadura" },
                    { nombre: "Manteca" },
                    { nombre: "Mejorador" }, 
                    { nombre: "Sal" },
                    // Maicena ELIMINADA
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

// --- CREAR O ACTUALIZAR INSUMO + REGISTRAR EGRESO ---
export const createInsumo = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;

    // --- VALIDACIONES DE SEGURIDAD (BACKEND) ---
    // 1. Validar longitud de cantidad (Max 5 dígitos)
    if (String(cantidadCompra).replace(/\D/g, "").length > 5) {
        return res.status(400).json({ error: "La cantidad no puede exceder los 5 dígitos." });
    }

    // 2. Validar que no sea Maicena (por si intentan inyectarlo)
    if (nombre.toLowerCase().includes("maicena")) {
         return res.status(400).json({ error: "Este insumo ya no está permitido." });
    }
    // ------------------------------------------

    const cantidadNueva = parseFloat(cantidadCompra);
    const valorNuevo = parseInt(valorCompra);
    
    // Convertir todo a GRAMOS para estandarizar el stock interno
    let gramosNuevos = 0;
    if (unidadMedida === 'kg' || unidadMedida === 'lt') {
        gramosNuevos = cantidadNueva * 1000;
    } else {
        gramosNuevos = cantidadNueva;
    }

    const costoPorGramoNuevo = gramosNuevos > 0 ? (valorNuevo / gramosNuevos) : 0;

    // TRANSACCIÓN: Insumo + Egreso
    await prisma.$transaction(async (tx) => {
        
        // A. Gestionar Insumo (Crear o Actualizar)
        const insumoExistente = await tx.insumo.findFirst({
            where: { userId, nombre, presentacion } // Buscamos coincidencia exacta de nombre Y presentación
        });

        if (insumoExistente) {
            // Actualizar existente (Promedio Ponderado)
            const valorStockActual = insumoExistente.stockGramos * insumoExistente.costoPorGramo;
            const stockTotal = insumoExistente.stockGramos + gramosNuevos;
            const nuevoCosto = stockTotal > 0 ? ((valorStockActual + valorNuevo) / stockTotal) : 0;

            await tx.insumo.update({
                where: { id: insumoExistente.id },
                data: {
                    stockGramos: stockTotal,
                    costoPorGramo: nuevoCosto,
                    // Sumamos la cantidad histórica de compra para referencia
                    cantidadCompra: insumoExistente.cantidadCompra + cantidadNueva,
                    valorCompra: valorNuevo // Guardamos el último valor de compra referencia
                }
            });
        } else {
            // Crear nuevo
            await tx.insumo.create({
                data: {
                    nombre, presentacion, cantidadCompra: cantidadNueva, unidadMedida,
                    valorCompra: valorNuevo, stockGramos: gramosNuevos, costoPorGramo: costoPorGramoNuevo, userId
                }
            });
        }

        // B. Registrar el Egreso Automáticamente
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

    res.json({ message: "Stock ingresado y egreso registrado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar insumo' });
  }
};

export const updateInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const actualizado = await prisma.insumo.update({
            where: { id: Number(id) },
            data: req.body
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