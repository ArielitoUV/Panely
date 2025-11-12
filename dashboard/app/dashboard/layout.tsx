"use client"

import type React from "react"
import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="h-full w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
