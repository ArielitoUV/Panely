"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  Home,
  TrendingUp,
  TrendingDown,
  Package,
  Calculator,
  FileBarChart,
  Settings,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Ingresos", href: "/dashboard/ingresos", icon: TrendingUp },
  { name: "Egresos", href: "/dashboard/egresos", icon: TrendingDown },
  { name: "Inventario", href: "/dashboard/inventario", icon: Package },
    { name: "Cálculo Insumos", href: "/dashboard/calculoInsumo", icon: Calculator }, // <--- Módulo Nuevo
  { name: "Reportes", href: "/dashboard/reportes", icon: FileBarChart },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

interface User {
  nombre: string
  apellido: string
  email: string
  nombreEmpresa?: string
}

interface DashboardSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function DashboardSidebar({ isOpen, setIsOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  // CARGAR USUARIO DESDE localStorage AL MONTAR
  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    router.push("/")
  }

  // Iniciales para el avatar
  const initials = user ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase() : "US"

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">P</span>
            </div>
            <div>
              <span className="font-bold text-lg">Panely</span>
              <p className="text-xs text-muted-foreground">Gestión de Panadería</p>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              )
            })}
          </div>
        </nav>

        <Separator />

        {/* Perfil + Cerrar sesión */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
            <Avatar className="h-11 w-11 border-2 border-background">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.nombreEmpresa || user?.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
