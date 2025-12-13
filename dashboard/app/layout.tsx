import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/context/app-context" 
import { Toaster } from "@/components/ui/sonner" 

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Panely Dashboard",
  description: "Gestión inteligente para panaderías",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
             {children}
          </AppProvider>
          
          {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
          {/* richColors: Pone el fondo verde/rojo intenso e iconos */}
          {/* position="top-center": Lo pone arriba al medio para que la profe lo vea */}
          {/* duration={4000}: Dura 4 segundos en pantalla */}
          <Toaster position="top-center" richColors duration={4000} closeButton />
          
        </ThemeProvider>
      </body>
    </html>
  )
}