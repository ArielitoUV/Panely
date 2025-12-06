"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
// Importamos los componentes del diálogo de alerta
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
  isCheckingCaja: boolean // Nuevo estado para saber si estamos verificando
}

const AppContext = createContext<AppContextType | undefined>(undefined)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cajaAbierta, setCajaAbierta] = useState<boolean>(false)
  const [isCheckingCaja, setIsCheckingCaja] = useState<boolean>(true) // Inicialmente verificando
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()

  // Rutas que requieren caja abierta
  const protectedRoutes = [
      "/dashboard/egresos", 
      "/dashboard/inventario", 
      "/dashboard/calculoInsumo"
  ]

  const addNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const newNotif = { id: Date.now(), title, message, type, timestamp: new Date() }
    setNotifications(prev => [newNotif, ...prev])
  }

  const refreshCajaStatus = async () => {
    setIsCheckingCaja(true) // Empezamos a verificar
    const token = localStorage.getItem("accessToken")
    if (!token) {
        setIsCheckingCaja(false)
        return
    }

    try {
      const res = await fetch(`${API_URL}/caja/hoy`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        const estaAbierta = data && data.estado === "ABIERTA"
        setCajaAbierta(estaAbierta)
      } else {
          setCajaAbierta(false)
      }
    } catch (e) {
      console.error("Error verificando caja", e)
      setCajaAbierta(false)
    } finally {
        setIsCheckingCaja(false) // Terminamos de verificar
    }
  }

  // Verificar estado al cargar
  useEffect(() => {
    refreshCajaStatus()
  }, [])

  // BLOQUEO DE PANTALLA
  useEffect(() => {
    // Solo verificamos si ya terminamos de cargar el estado de la caja
    if (!isCheckingCaja) {
        const esRutaProtegida = protectedRoutes.some(route => pathname.startsWith(route))
        
        if (esRutaProtegida && !cajaAbierta) {
            setShowRestrictedDialog(true)
        } else {
            setShowRestrictedDialog(false)
        }
    }
  }, [pathname, cajaAbierta, isCheckingCaja])

  const handleRedirectToCaja = () => {
      setShowRestrictedDialog(false)
      router.push("/dashboard/ingresos")
  }

  return (
    <AppContext.Provider value={{ cajaAbierta, refreshCajaStatus, notifications, addNotification, isCheckingCaja }}>
      {children}

      {/* POP-UP DE BLOQUEO */}
      <AlertDialog open={showRestrictedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                🚫 Acceso Restringido
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Para acceder a este módulo, primero debes <strong>ABRIR LA CAJA</strong> del día.
              <br /><br />
              El sistema requiere una caja abierta para registrar cualquier movimiento de dinero o inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRedirectToCaja} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
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