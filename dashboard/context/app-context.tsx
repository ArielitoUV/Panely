"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

// Importamos componentes de UI para el diálogo de bloqueo
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
}

interface AppContextType {
  cajaAbierta: boolean
  refreshCajaStatus: () => Promise<void>
  notifications: Notification[]
  addNotification: (title: string, message: string, type?: "info" | "success" | "warning" | "error") => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cajaAbierta, setCajaAbierta] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false) 
  const router = useRouter()
  const pathname = usePathname()

  // Rutas que requieren caja abierta
  const protectedRoutes = ["/dashboard/egresos", "/dashboard/inventario", "/dashboard/calculoInsumo"]

  const addNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
      const newNotif = { id: Date.now(), title, message, type, timestamp: new Date() }
      setNotifications(prev => [newNotif, ...prev])
  }

  const refreshCajaStatus = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) return
      try {
          const res = await fetch(`${API_URL}/caja/hoy`, { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
              const data = await res.json()
              const estaAbierta = data && data.estado === "ABIERTA"
              setCajaAbierta(estaAbierta)
          } else {
              setCajaAbierta(false)
          }
      } catch (e) { console.error(e) }
  }

  useEffect(() => {
      refreshCajaStatus()
  }, [])

  // VERIFICACIÓN DE ACCESO 
  useEffect(() => {
    if (protectedRoutes.includes(pathname)) {
        if (!cajaAbierta) {
            setShowRestrictedDialog(true)
        } else {
            setShowRestrictedDialog(false)
        }
    } else {
        setShowRestrictedDialog(false)
    }
  }, [pathname, cajaAbierta])

  const handleRedirectToCaja = () => {
      setShowRestrictedDialog(false)
      router.push("/dashboard/ingresos")
  }

  return (
    <AppContext.Provider value={{ cajaAbierta, refreshCajaStatus, notifications, addNotification }}>
      {children}

      {/* DIÁLOGO DE RESTRICCIÓN GLOBAL */}
      <AlertDialog open={showRestrictedDialog} onOpenChange={setShowRestrictedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🚫 Acceso Restringido</AlertDialogTitle>
            <AlertDialogDescription>
              Para acceder a este módulo (Inventario, Egresos o Cálculo), primero debes <strong>ABRIR LA CAJA</strong> del día.
              <br /><br />
              Esto es necesario para registrar correctamente los movimientos de dinero.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRedirectToCaja} className="bg-blue-600 hover:bg-blue-700">
              Ir a Abrir Caja
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) throw new Error("useApp must be used within an AppProvider")
  return context
}