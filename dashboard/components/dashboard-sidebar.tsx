"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, TrendingUp, TrendingDown, Package, FileBarChart, Settings, X, ChevronRight, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Ingresos", href: "/dashboard/ingresos", icon: TrendingUp },
  { name: "Egresos", href: "/dashboard/egresos", icon: TrendingDown },
  { name: "Inventario", href: "/dashboard/inventario", icon: Package },
  { name: "Reportes", href: "/dashboard/reportes", icon: FileBarChart },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

interface DashboardSidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function DashboardSidebar({ isOpen, setIsOpen }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 xl:w-72 bg-card border-r flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5 group min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base leading-tight truncate">Dashboard</span>
              <span className="text-xs text-muted-foreground leading-tight truncate">Admin Panel</span>
            </div>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 shrink-0" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Menu</p>
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 truncate">{item.name}</span>
                    {isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        <Separator />

        <div className="p-3 shrink-0 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
            <Avatar className="h-10 w-10 border-2 border-primary/20 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="text-sm">Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
