"use client"

import Link from "next/link"
import { ChefHat, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function AuthNavbar() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between p-6">
      
      {/* LOGO: Redirige al Home */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="bg-orange-600 p-2 rounded-lg group-hover:bg-orange-700 transition-colors">
            <ChefHat className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-white drop-shadow-md">Panely</span>
      </Link>

      {/* BOTÓN DE TEMA */}
      {mounted && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Cambiar tema</span>
        </Button>
      )}
    </nav>
  )
}