"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AuthNavbar } from "@/components/AuthNavbar" // <--- IMPORTAMOS EL NUEVO NAVBAR

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function IniciarSesionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (searchParams.get("registro") === "exito") {
      toast({ title: "Cuenta creada", description: "Inicia sesión con tus credenciales.", className: "bg-green-600 text-white" })
    }
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas")
        toast({ variant: "destructive", title: "Acceso Denegado", description: data.error || "Revisa tus datos" })
        return
      }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken)
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user))
        toast({ title: "¡Bienvenido!", description: "Ingresando al sistema...", className: "bg-blue-600 text-white" })
        setTimeout(() => router.push("/dashboard"), 500)
      }
    } catch (err: any) {
      setError("Error de conexión con el servidor")
      toast({ variant: "destructive", title: "Error", description: "No se pudo conectar al servidor" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 relative bg-background transition-colors duration-300">
      
      {/* NAVBAR DE AUTENTICACIÓN */}
      <AuthNavbar />
      
      {/* IMAGEN DE FONDO */}
      <div className="absolute inset-0 z-0">
         <Image 
            src="/pancito2.jpg" 
            alt="Fondo Panadería" 
            fill 
            className="object-cover blur-[2px] brightness-[0.6] dark:brightness-[0.3] transition-all duration-500"
            priority
         />
      </div>

      <div className="w-full max-w-md z-10 relative mt-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Bienvenido</h1>
          <p className="text-zinc-100 mt-2 font-medium drop-shadow-md">Ingresa tus credenciales para continuar</p>
        </div>

        <Card className="border-2 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-orange-600 dark:text-orange-500">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="tu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 pr-10" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
              {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 text-center animate-in fade-in">{error}</div>}
              <Button type="submit" className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white shadow-md mt-2" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Ingresando...</> : <><LogIn className="mr-2 h-5 w-5" /> Ingresar</>}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta? <Link href="/auth/registro" className="text-orange-600 font-medium hover:underline">Regístrate gratis</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}