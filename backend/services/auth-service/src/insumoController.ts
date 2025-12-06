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

// --- OBTENER PRESENTACIONES (CATÁLOGO) ---
export const getTiposPresentacion = async (req: Request, res: Response) => {
    try {
        let tipos = await prisma.tipoPresentacion.findMany({ orderBy: { nombre: 'asc' } });
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

// --- CREAR O ACTUALIZAR INSUMO + REGISTRAR EGRESO (LÓGICA INTELIGENTE) ---
export const createInsumo = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;

    const cantidadNueva = parseFloat(cantidadCompra);
    const valorNuevo = parseInt(valorCompra);
    
    // 1. Convertir todo a GRAMOS
    let gramosNuevos = 0;
    if (unidadMedida === 'kg' || unidadMedida === 'lt') {
        gramosNuevos = cantidadNueva * 1000;
    } else {
        gramosNuevos = cantidadNueva;
    }

    const costoPorGramoNuevo = gramosNuevos > 0 ? (valorNuevo / gramosNuevos) : 0;

    // 2. TRANSACCIÓN: Insumo + Egreso
    await prisma.$transaction(async (tx) => {
        
        // A. Gestionar Insumo (Crear o Actualizar)
        const insumoExistente = await tx.insumo.findFirst({
            where: { userId, nombre } 
        });

        if (insumoExistente) {
            // Actualizar existente
            const valorStockActual = insumoExistente.stockGramos * insumoExistente.costoPorGramo;
            const stockTotal = insumoExistente.stockGramos + gramosNuevos;
            const nuevoCosto = stockTotal > 0 ? ((valorStockActual + valorNuevo) / stockTotal) : 0;

            await tx.insumo.update({
                where: { id: insumoExistente.id },
                data: {
                    stockGramos: stockTotal,
                    costoPorGramo: nuevoCosto,
                    presentacion,
                    cantidadCompra: insumoExistente.cantidadCompra + cantidadNueva,
                    valorCompra: valorNuevo
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
        // Esto es lo que faltaba: crear el registro en la tabla Egreso
        await tx.egreso.create({
            data: {
                monto: valorNuevo,
                descripcion: `Compra Insumo: ${nombre} (${cantidadNueva} ${unidadMedida})`,
                categoria: "COMPRA_INSUMO", // Categoría especial para identificar compras
                fecha: new Date(),
                userId
            }
        });

        // C. Opcional: Descontar de Caja Diaria si está abierta (Si quieres que afecte el efectivo del día)
        /*
        const cajaAbierta = await tx.cajaDiaria.findFirst({ where: { userId, estado: "ABIERTA" } });
        if (cajaAbierta) {
            // Aquí podrías restar, pero depende de si usas dinero de la caja chica o no.
            // Para este ejemplo, solo registramos el egreso contable.
        }
        */
    });

    res.json({ message: "Insumo y Egreso registrados correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar insumo' });
  }
};

// --- MODIFICAR INSUMO (Corrección manual) ---
export const updateInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // ... (lógica de update igual que antes, sin generar egreso porque es corrección) ...
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