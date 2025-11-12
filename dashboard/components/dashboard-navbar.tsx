"use client"

import { Bell, Search, Menu, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

interface DashboardNavbarProps {
  onMenuClick: () => void
}

export function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8 shrink-0">
      <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 shrink-0" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1 max-w-md lg:max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 h-10 w-full bg-muted/50 border-0 focus-visible:bg-background text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-5 w-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold"
          >
            3
          </Badge>
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}
