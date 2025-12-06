"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, Moon, Sun } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes" // Importamos el hook de tema
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const pathNames: Record<string, string> = {
  dashboard: "Inicio",
  calculoInsumo: "Cálculo de Insumos",
  ingresos: "Ingresos",
  egresos: "Egresos",
  inventario: "Inventario",
  reportes: "Reportes",
  configuracion: "Configuración",
}

interface DashboardNavbarProps {
  onMenuClick?: () => void;
}

export function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme() // Hook para manejar el tema
  const [mounted, setMounted] = useState(false)

  // Evitar hidratación incorrecta
  useEffect(() => {
    setMounted(true)
  }, [])

  const segments = pathname.split("/").filter(Boolean)
  const currentPage = segments[segments.length - 1]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/95 backdrop-blur z-10 justify-between">
      
      <div className="flex items-center gap-2">
        {/* BOTÓN MENÚ MÓVIL (IZQUIERDA) */}
        <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 shrink-0 mr-2" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
        </Button>

        <Separator orientation="vertical" className="mr-2 h-4 hidden lg:block" />
        
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Panely</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{pathNames[currentPage] || "Panel"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* BOTÓN CAMBIO DE TEMA (DERECHA) */}
      <div className="flex items-center gap-2">
         {mounted && (
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === "dark" ? (
                  <Sun className="h-5 w-5 transition-all" />
              ) : (
                  <Moon className="h-5 w-5 transition-all" />
              )}
              <span className="sr-only">Cambiar tema</span>
            </Button>
         )}
      </div>
    </header>
  )
}