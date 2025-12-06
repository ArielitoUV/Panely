import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/context/app-context" // <--- IMPORTAR ESTO

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
          {/* ENVOLVEMOS CON EL PROVIDER */}
          <AppProvider>
             {children}
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}