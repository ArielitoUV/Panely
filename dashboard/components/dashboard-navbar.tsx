"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, Moon, Sun, Bell, CheckCircle, AlertCircle, Info } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useApp } from "@/context/app-context" // Usamos el contexto
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const { setTheme, theme } = useTheme()
  const { notifications } = useApp() // Obtenemos notificaciones
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const segments = pathname.split("/").filter(Boolean)
  const currentPage = segments[segments.length - 1]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/95 backdrop-blur z-10 justify-between w-full">
      
      <div className="flex items-center gap-2">
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

      <div className="flex items-center gap-2">
         
         {/* BOTÓN NOTIFICACIONES CON CONTADOR */}
         <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                    <span className="sr-only">Notificaciones</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="p-4 border-b">
                    <h4 className="font-medium leading-none">Notificaciones</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                        {notifications.length} alertas recientes.
                    </p>
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No tienes notificaciones.
                        </div>
                    ) : (
                        <div className="grid">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="flex items-start gap-3 p-4 border-b hover:bg-muted/50 transition-colors">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                                        notif.type === 'success' ? 'bg-green-500' : 
                                        notif.type === 'error' ? 'bg-red-500' : 
                                        notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                    }`} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{notif.title}</p>
                                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                                        <p className="text-[10px] text-muted-foreground/70">
                                            {notif.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
         </Popover>

         {mounted && (
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === "dark" ? <Sun className="h-5 w-5 transition-all" /> : <Moon className="h-5 w-5 transition-all" />}
              <span className="sr-only">Tema</span>
            </Button>
         )}
      </div>
    </header>
  )
}