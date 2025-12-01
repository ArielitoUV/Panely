// backend/services/auth-service/src/insumoController.ts

import { Request, Response } from "express";
import { prisma } from "./database"; // asegúrate de que esta ruta sea correcta

export const crearInsumo = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  const {
    nombre,
    presentacion,
    cantidadCompra,   // ← nuevo: cuántos kg/lt compraste
    unidadMedida,     // ← kg, lt, unidad
    valorCompra       // ← precio total que pagaste
  } = req.body;

  // Validación
  if (!nombre || !presentacion || !cantidadCompra || !unidadMedida || !valorCompra) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const cantidad = parseFloat(cantidadCompra);
  const precioTotal = parseInt(valorCompra);

  if (cantidad <= 0 || precioTotal <= 0) {
    return res.status(400).json({ error: "Cantidad y precio deben ser mayores a 0" });
  }

  // Calculamos el costo por kg/lt/unidad
  const costoPorUnidad = Math.round(precioTotal / cantidad);

  try {
    const insumo = await prisma.insumo.create({
      data: {
        nombre,
        presentacion,
        cantidadCompra: cantidad,
        unidadMedida,
        valorCompra: precioTotal,
        costoPorUnidad,        // ← guardamos el cálculo automático
        userId: userId!,
      },
    });

    res.status(201).json({
      success: true,
      insumo: {
        ...insumo,
        costoPorUnidad: insumo.costoPorUnidad // para que lo muestre bonito
      }
    });
  } catch (err: any) {
    console.error("Error creando insumo:", err);
    res.status(500).json({ error: "Error al guardar el insumo" });
  }
};

export const listarInsumos = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const insumos = await prisma.insumo.findMany({
      where: { userId },
      select: {
        id: true,
        nombre: true,
        presentacion: true,
        cantidadCompra: true,
        unidadMedida: true,
        valorCompra: true,
        costoPorUnidad: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, insumos });
  } catch (err: any) {
    console.error("Error listando insumos:", err);
    res.status(500).json({ error: "Error al cargar insumos" });
  }
};