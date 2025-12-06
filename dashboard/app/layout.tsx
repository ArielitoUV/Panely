import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/context/app-context" // <--- IMPORTAR ESTO
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
          {/* EL PROVIDER DEBE ENVOLVER TODO */}
          <AppProvider>
             {children}
          </AppProvider>
          
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}