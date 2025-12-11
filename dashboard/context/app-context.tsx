"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Store, Info, LogOut } from "lucide-react"
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
    
    // --- 1. LECTURA OPTIMISTA INMEDIATA (Solución F5) ---
    // Recuperamos el estado visualmente antes de esperar a la API
    if (typeof window !== 'undefined') {
        const estadoGuardado = localStorage.getItem("cajaAbierta") === "true"
        if (estadoGuardado) {
            setCajaAbierta(true)
        }
    }
    // ----------------------------------------------------

    const token = localStorage.getItem("accessToken")
    
    if (!token) {
        setCajaAbierta(false)
        localStorage.removeItem("cajaAbierta")
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
        
        // Actualizamos con la verdad del servidor
        setCajaAbierta(estaAbierta)
        
        // Sincronizamos localStorage
        if (estaAbierta) {
            localStorage.setItem("cajaAbierta", "true")
            setShowRestrictedDialog(false) // Forzamos cierre si estaba abierto
        } else {
            localStorage.removeItem("cajaAbierta")
        }
        
      } else {
         // Si falla la respuesta lógica (no 200 OK), asumimos cerrada
         setCajaAbierta(false)
         localStorage.removeItem("cajaAbierta")
      }
    } catch (e) {
      console.error("Error verificando caja", e)
      // Si hay error de red, MANTENEMOS el estado optimista (no cerramos la caja en la UI)
      // Esto evita que se bloquee la pantalla si se cae el internet momentáneamente
    } finally {
        setIsCheckingCaja(false) 
    }
  }, [])

  useEffect(() => {
    refreshCajaStatus()
  }, [refreshCajaStatus])

  // Lógica de Bloqueo de Pantalla
  useEffect(() => {
    // Si estamos verificando, NO hacemos nada (evita parpadeo)
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
      localStorage.clear()
      document.cookie = "panely_session=; path=/; max-age=0";
      router.push("/")
  }

  return (
    <AppContext.Provider value={{ cajaAbierta, refreshCajaStatus, notifications, addNotification, removeNotification, isCheckingCaja }}>
      {children}

      <Dialog open={showRestrictedDialog} onOpenChange={(open) => !open && setShowRestrictedDialog(true)}>
        <DialogContent 
            className="border-l-4 border-l-blue-600 max-w-md [&>button]:hidden" 
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-blue-700 text-xl">
                <div className="bg-blue-100 p-2 rounded-full">
                    <Store className="h-6 w-6 text-blue-600" />
                </div>
                Gestión de Turno Requerida
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