"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, Moon, Sun, Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { useApp } from "@/context/app-context" 
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
import { cn } from "@/lib/utils"

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
  const { notifications, removeNotification } = useApp() // <--- TRAEMOS LA FUNCIÓN
  const [mounted, setMounted] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
      if (notifications.length > 0) {
          setHasUnread(true)
      }
  }, [notifications])

  const segments = pathname.split("/").filter(Boolean)
  const currentPage = segments[segments.length - 1]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getNotificationIcon = (type: string) => {
      switch(type) {
          case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
          case 'error': return <X className="h-4 w-4 text-red-600" />;
          case 'warning': return <AlertCircle className="h-4 w-4 text-orange-600" />;
          default: return <Info className="h-4 w-4 text-blue-600" />;
      }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background/95 backdrop-blur z-20 justify-between w-full shadow-sm">
      
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
              <BreadcrumbPage className="font-semibold">{pathNames[currentPage] || "Panel"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3">
         
         <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                        "relative rounded-full transition-all duration-300",
                        hasUnread ? "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400" : ""
                    )}
                    onClick={() => setHasUnread(false)} 
                >
                    <Bell className={cn("h-5 w-5 transition-transform", hasUnread ? "rotate-12 scale-110" : "")} />
                    
                    {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-md ring-2 ring-background">
                            {notifications.length > 9 ? '9+' : notifications.length}
                        </span>
                    )}
                    <span className="sr-only">Notificaciones</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 shadow-xl border-t-4 border-t-orange-500">
                <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold leading-none">Centro de Alertas</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            Haz clic para marcar como leído.
                        </p>
                    </div>
                    {notifications.length > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                            {notifications.length} Nuevas
                        </span>
                    )}
                </div>
                <ScrollArea className="h-[350px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-center p-4 text-muted-foreground space-y-2">
                            <Bell className="h-8 w-8 opacity-20" />
                            <p className="text-sm">No hay notificaciones recientes.</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notif) => (
                                <div key={notif.id} 
                                    className={cn(
                                    "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-l-4 cursor-pointer active:bg-muted/80",
                                    notif.type === 'success' ? 'border-l-green-500' : 
                                    notif.type === 'error' ? 'border-l-red-500' : 
                                    notif.type === 'warning' ? 'border-l-orange-500' : 'border-l-blue-500'
                                    )}
                                    // ALERTA AL USUARIO QUE SE PUEDE BORRAR
                                    title="Clic para descartar"
                                    // ACCIÓN DE BORRADO
                                    onClick={() => removeNotification(notif.id)}
                                >
                                    <div className="mt-0.5">
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-semibold leading-none">{notif.title}</p>
                                            <span className="text-[10px] text-muted-foreground tabular-nums">
                                                {notif.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {notif.message}
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
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === "dark" ? <Sun className="h-5 w-5 transition-all text-yellow-500" /> : <Moon className="h-5 w-5 transition-all text-slate-700" />}
              <span className="sr-only">Cambiar Tema</span>
            </Button>
         )}
      </div>
    </header>
  )
}