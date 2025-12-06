import { Request, Response } from 'express';
import { prisma } from './database';

// --- OBTENER TIPOS DE INSUMO (CATÁLOGO SIMPLIFICADO) ---
export const getTiposInsumo = async (req: Request, res: Response) => {
    try {
        let tipos = await prisma.tipoInsumo.findMany({ orderBy: { nombre: 'asc' } });
        
        // Si está vacío, creamos SOLO los sólidos solicitados
        if (tipos.length === 0) {
            await prisma.tipoInsumo.createMany({
                data: [
                    { nombre: "Azúcar" },
                    { nombre: "Harina" },
                    { nombre: "Levadura" },
                    { nombre: "Maicena" },
                    { nombre: "Manteca" },
                    { nombre: "Mejorador de Pan" },
                    { nombre: "Sal" }
                ]
            });
            tipos = await prisma.tipoInsumo.findMany({ orderBy: { nombre: 'asc' } });
        }
        res.json(tipos);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar tipos" });
    }
};

// --- OBTENER PRESENTACIONES (CATÁLOGO SIMPLIFICADO) ---
export const getTiposPresentacion = async (req: Request, res: Response) => {
    try {
        let tipos = await prisma.tipoPresentacion.findMany({ orderBy: { nombre: 'asc' } });
        
        // Si está vacío, creamos SOLO las presentaciones solicitadas
        if (tipos.length === 0) {
            await prisma.tipoPresentacion.createMany({
                data: [
                    { nombre: "Bolsa Individual" },
                    { nombre: "Caja" },
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

// --- CREAR O ACTUALIZAR INSUMO (LÓGICA INTELIGENTE) ---
export const createInsumo = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user?.id;
    const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;

    const cantidadNueva = parseFloat(cantidadCompra);
    const valorNuevo = parseInt(valorCompra);
    
    // 1. Convertir todo a GRAMOS (Solo trabajamos sólidos ahora)
    let gramosNuevos = 0;
    
    // Aunque solo sean sólidos, mantenemos la conversión básica por si el usuario elige "kg"
    if (unidadMedida === 'kg') {
        gramosNuevos = cantidadNueva * 1000;
    } else {
        gramosNuevos = cantidadNueva; // Asumimos gramos
    }

    const costoPorGramoNuevo = gramosNuevos > 0 ? (valorNuevo / gramosNuevos) : 0;

    // 2. BUSCAR SI YA EXISTE EL INSUMO (Por nombre exacto)
    const insumoExistente = await prisma.insumo.findFirst({
        where: { userId, nombre } 
    });

    if (insumoExistente) {
        // ACTUALIZAR EXISTENTE (PROMEDIO PONDERADO)
        const valorStockActual = insumoExistente.stockGramos * insumoExistente.costoPorGramo;
        const stockTotalGramos = insumoExistente.stockGramos + gramosNuevos;
        
        let nuevoCostoPromedio = insumoExistente.costoPorGramo;
        if (stockTotalGramos > 0) {
            nuevoCostoPromedio = (valorStockActual + valorNuevo) / stockTotalGramos;
        }

        const insumoActualizado = await prisma.insumo.update({
            where: { id: insumoExistente.id },
            data: {
                stockGramos: stockTotalGramos,
                costoPorGramo: nuevoCostoPromedio,
                presentacion, // Actualizamos la referencia
                cantidadCompra: insumoExistente.cantidadCompra + cantidadNueva,
                valorCompra: valorNuevo
            }
        });
        return res.json(insumoActualizado);
    } else {
        // CREAR NUEVO
        const insumo = await prisma.insumo.create({
            data: {
                nombre, 
                presentacion,
                cantidadCompra: cantidadNueva,
                unidadMedida,
                valorCompra: valorNuevo,
                stockGramos: gramosNuevos,
                costoPorGramo: costoPorGramoNuevo,
                userId
            }
        });
        return res.json(insumo);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar insumo' });
  }
};

// --- MODIFICAR INSUMO ---
export const updateInsumo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nombre, presentacion, cantidadCompra, unidadMedida, valorCompra } = req.body;

        const cantidad = parseFloat(cantidadCompra);
        const valor = parseInt(valorCompra);
        
        let stockGramos = 0;
        if (unidadMedida === 'kg') {
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