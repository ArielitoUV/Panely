"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// --- CONSTANTE API ---
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
      toast({
        title: "Cuenta creada",
        description: "Por favor inicia sesión con tus credenciales.",
        className: "bg-green-600 text-white"
      })
    }
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log(`📡 Conectando a: ${API_URL}/auth/login`);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      // Validación de seguridad para evitar errores de parseo
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Error de conexión: El servidor no devolvió JSON.");
      }

      const data = await res.json()

      // --- CAMBIO CLAVE PARA LA DEFENSA ---
      // Manejamos el error de credenciales manualmente sin lanzar 'throw'
      // Esto evita que aparezca un error rojo feo en la consola del navegador.
      if (!res.ok) {
        const mensajeError = data.error || "Credenciales incorrectas";
        setError(mensajeError);
        toast({
            variant: "destructive",
            title: "Acceso Denegado",
            description: mensajeError,
        });
        return; // Salimos limpiamente
      }

      // ÉXITO: Guardar sesión
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
        
        if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken)
        }
        
        if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user))
        }

        toast({
            title: "¡Bienvenido!",
            description: "Ingresando al sistema...",
            className: "bg-blue-600 text-white"
        })

        setTimeout(() => router.push("/dashboard"), 500)
      } else {
        throw new Error("Token no recibido del servidor.")
      }

    } catch (err: any) {
      // Este catch solo captura errores reales de red o servidor (crash)
      console.error("🔥 Error Crítico Login:", err)
      const msg = err.message || "Error al conectar con el servidor";
      setError(msg)
      toast({
        variant: "destructive",
        title: "Error del Sistema",
        description: msg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Bienvenido de nuevo</h1>
          <p className="text-muted-foreground mt-2">Ingresa a tu panel de control</p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200 text-center animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Ingresar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/registro" className="text-primary font-medium hover:underline">
                Regístrate gratis
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}