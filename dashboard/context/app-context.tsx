"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Store, Info, LogOut } from "lucide-react" // Agregamos icono LogOut
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  removeNotification: (id: number) => void
  isCheckingCaja: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cajaAbierta, setCajaAbierta] = useState<boolean>(false)
  const [isCheckingCaja, setIsCheckingCaja] = useState<boolean>(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showRestrictedDialog, setShowRestrictedDialog] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()

  const protectedRoutes = [
      "/dashboard/egresos", 
      "/dashboard/inventario", 
      "/dashboard/calculoInsumo"
  ]

  const addNotification = (title: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const newNotif = { id: Date.now(), title, message, type, timestamp: new Date() }
    setNotifications(prev => [newNotif, ...prev])
  }

  const removeNotification = (id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const refreshCajaStatus = useCallback(async () => {
    setIsCheckingCaja(true) 
    const token = localStorage.getItem("accessToken")
    
    if (!token) {
        setCajaAbierta(false)
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
        if (estaAbierta) setShowRestrictedDialog(false)
      } else {
         setCajaAbierta(false)
      }
    } catch (e) {
      console.error("Error verificando caja", e)
      setCajaAbierta(false)
    } finally {
        setIsCheckingCaja(false) 
    }
  }, [])

  useEffect(() => {
    refreshCajaStatus()
  }, [refreshCajaStatus])

  // Lógica de bloqueo
  useEffect(() => {
    if (isCheckingCaja) return
    const esRutaProtegida = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (esRutaProtegida && !cajaAbierta) {
        setShowRestrictedDialog(true)
    } else {
        setShowRestrictedDialog(false)
    }
  }, [pathname, cajaAbierta, isCheckingCaja])

  const handleRedirectToCaja = () => {
      setShowRestrictedDialog(false)
      router.push("/dashboard") 
  }

  const handleLogout = () => {
      // Lógica de cierre de sesión
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      document.cookie = "panely_session=; path=/; max-age=0";
      router.push("/")
  }

  return (
    <AppContext.Provider value={{ cajaAbierta, refreshCajaStatus, notifications, addNotification, removeNotification, isCheckingCaja }}>
      {children}

      {/* 1. Eliminamos modal={false} para que sea bloqueante (overlay oscuro).
          2. Eliminamos las clases de posición fija (bottom-10 right-10) para que se centre por defecto.
      */}
      <Dialog open={showRestrictedDialog} onOpenChange={(open) => !open && setShowRestrictedDialog(true)}>
        <DialogContent 
            className="border-l-4 border-l-blue-600 max-w-md [&>button]:hidden" // Ocultamos la X de cierre
            onPointerDownOutside={(e) => e.preventDefault()} // Evita cerrar clicando fuera
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()} // Evita cerrar con ESC
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-blue-700 text-xl">
                <div className="bg-blue-100 p-2 rounded-full">
                    <Store className="h-6 w-6 text-blue-600" />
                </div>
                Caja Abierta Requerida
            </DialogTitle>
            <DialogDescription asChild className="text-base text-slate-600 pt-2">
              <div className="flex flex-col gap-2">
                  <p>
                    Para acceder a este módulo, es obligatorio tener la <strong>Caja Diaria abierta</strong>.
                  </p>
                  <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md text-sm text-blue-800 border border-blue-100 mt-2">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <span>Esto garantiza la integridad de los datos financieros del turno.</span>
                  </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-red-600"
            >
                <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
            <Button 
                onClick={handleRedirectToCaja} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md sm:flex-1"
            >
              Ir a Abrir Caja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) throw new Error("useApp must be used within an AppProvider")
  return context
}