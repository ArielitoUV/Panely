"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  FileBarChart, 
  Settings, 
  X, 
  LogOut,
  Calculator,
  LayoutDashboard
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Ingresos", href: "/dashboard/ingresos", icon: TrendingUp },
  { name: "Egresos", href: "/dashboard/egresos", icon: TrendingDown },
  { name: "Inventario", href: "/dashboard/inventario", icon: Package },
  { name: "Cálculo Insumos", href: "/dashboard/calculoInsumo", icon: Calculator },
  { name: "Reportes", href: "/dashboard/reportes", icon: FileBarChart },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

interface DashboardSidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function DashboardSidebar({ open, setOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 1024)
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente" })
    router.push("/")
  }

  return (
    <>
      {/* Overlay móvil */}
      {open && isMobile && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-card border-r transition-transform duration-300 ease-in-out flex flex-col",
          // Lógica de ancho: 
          // Móvil: Oculto (-translate-x-full) o Visible (translate-0 w-64)
          // Escritorio: Siempre visible y ancho fijo w-64 (para ver nombres)
          open ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-64"
        )}
      >
        {/* Header Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary"> 
            <LayoutDashboard className="h-6 w-6 text-orange-500" />
            <span>Panely</span>
          </Link>
          
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => isMobile && setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm",
                    isActive 
                      ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-medium shadow-sm border border-orange-100 dark:border-orange-900" 
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-orange-600 dark:text-orange-400")} />
                  {/* Nombre siempre visible porque el ancho es fijo w-64 */}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t bg-muted/10">
          <Button variant="outline" className="w-full gap-2 border-dashed text-muted-foreground hover:text-destructive hover:border-destructive justify-start px-4" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  )
}