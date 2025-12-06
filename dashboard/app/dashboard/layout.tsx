"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      router.push("/auth/iniciar-sesion")
    } else {
      setIsAuthorized(true)
    }
  }, [router])

  if (!isAuthorized) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Margen izquierdo de 64 (256px) en desktop para dejar espacio al sidebar fijo */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:pl-64" : "lg:pl-64"}`}>
        
        {/* Pasamos la función para abrir/cerrar el sidebar */}
        <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/10 p-4 md:p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  )
}