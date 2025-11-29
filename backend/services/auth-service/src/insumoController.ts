import { Request, Response } from "express";
import { prisma } from "./database";

export const crearInsumo = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { nombre, presentacion, unidadMedida, valorCompra, stockActual, stockMinimo } = req.body;

  if (!nombre || !presentacion || !unidadMedida || !valorCompra) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const insumo = await prisma.insumo.create({
      data: {
        nombre,
        presentacion,
        unidadMedida,
        valorCompra: parseInt(valorCompra),
        stockActual: parseInt(stockActual) || 0,
        stockMinimo: parseInt(stockMinimo) || 10,
        userId,
      },
    });

    res.status(201).json({ success: true, insumo });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const listarInsumos = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const insumos = await prisma.insumo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, insumos });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};