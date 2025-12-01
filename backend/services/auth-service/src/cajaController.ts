// backend/services/auth-service/src/cajaController.ts

import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// ========================================
// ABRIR CAJA
// ========================================
export const abrirCaja = async (req: any, res: any) => {
  try {
    const { montoInicial } = req.body

    // ACEPTA CUALQUIERA DE LAS TRES FORMAS COMUNES QUE GUARDAN EL USER ID
    const userId = req.user?.id ?? req.user?.userId ?? req.userId

    if (!userId) {
      return res.status(401).json({ error: "No estás autenticado" })
    }

    if (!montoInicial || montoInicial < 0) {
      return res.status(400).json({ error: "Monto inicial inválido" })
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    // Verificar si ya existe caja hoy
    const existe = await prisma.cajaDiaria.findFirst({
      where: {
        userId,
        fecha: { gte: hoy }
      }
    })

    if (existe) {
      return res.status(400).json({ error: "Ya abriste caja hoy" })
    }

    const caja = await prisma.cajaDiaria.create({
      data: {
        fecha: hoy,
        montoInicial,
        totalFinal: montoInicial,
        estado: "ABIERTA",
        user: { connect: { id: userId } }
      }
    })

    return res.json({ caja })
  } catch (err: any) {
    console.error("Error abriendo caja:", err)
    return res.status(500).json({ error: "Error al abrir la caja" })
  }
}

// ========================================
// OBTENER CAJA DE HOY
// ========================================
export const obtenerCajaHoy = async (req: any, res: any) => {
  try {
    const userId = req.user?.id ?? req.user?.userId ?? req.userId

    if (!userId) {
      return res.status(401).json({ error: "No autenticado" })
    }

    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const caja = await prisma.cajaDiaria.findFirst({
      where: {
        userId,
        fecha: { gte: hoy }
      }
    })

    return res.json({ caja })
  } catch (err) {
    console.error("Error cargando caja:", err)
    return res.status(500).json({ error: "Error al cargar la caja" })
  }
}

// ========================================
// CERRAR CAJA
// ========================================
export const cerrarCaja = async (req: any, res: any) => {
  try {
    const cajaId = parseInt(req.params.id)
    const { efectivo = 0, tarjeta = 0, transferencia = 0 } = req.body

    const userId = req.user?.id ?? req.user?.userId ?? req.userId

    if (!userId) {
      return res.status(401).json({ error: "No autenticado" })
    }

    const caja = await prisma.cajaDiaria.findUnique({
      where: { id: cajaId }
    })

    if (!caja) {
      return res.status(404).json({ error: "Caja no encontrada" })
    }

    if (caja.userId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para cerrar esta caja" })
    }

    if (caja.estado === "CERRADA") {
      return res.status(400).json({ error: "La caja ya está cerrada" })
    }

    const totalFinal = caja.montoInicial + efectivo + tarjeta + transferencia

    const actualizada = await prisma.cajaDiaria.update({
      where: { id: cajaId },
      data: {
        efectivo,
        tarjeta,
        transferencia,
        totalFinal,
        estado: "CERRADA"
      }
    })

    return res.json({ caja: actualizada })
  } catch (err: any) {
    console.error("Error cerrando caja:", err)
    return res.status(500).json({ error: "Error al cerrar la caja" })
  }
}


