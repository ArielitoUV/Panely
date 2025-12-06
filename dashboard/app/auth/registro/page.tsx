"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card" // Asegúrate de importar CardFooter
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { AuthNavbar } from "@/components/AuthNavbar" // <--- IMPORTAMOS EL NUEVO NAVBAR

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function RegistroPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    nombreEmpresa: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono || null,
          nombreEmpresa: form.nombreEmpresa,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const mensaje = data.error || "Error al registrarse"
        setError(mensaje)
        toast({
          variant: "destructive",
          title: "No se pudo registrar",
          description: mensaje,
        })
        return
      }

      toast({
        title: "¡Registro Exitoso!",
        description: "Bienvenido a Panely.",
        className: "bg-green-600 text-white",
      })

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user))
        setTimeout(() => router.push("/dashboard"), 1000)
      } else {
        router.push("/auth/iniciar-sesion?registro=exito")
      }
    } catch (err: any) {
      console.error("Error crítico:", err)
      const mensaje = err.message || "Error de conexión"
      setError(mensaje)
      toast({ variant: "destructive", title: "Error", description: mensaje })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 relative bg-background transition-colors duration-300">
      
      {/* NAVBAR DE AUTENTICACIÓN (Logo + Botón Tema) */}
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

      {/* CONTENIDO (TARJETA) */}
      <div className="w-full max-w-5xl z-10 relative mt-16"> {/* mt-16 para dar espacio al navbar */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Únete a Panely</h1>
          <p className="text-zinc-100 mt-2 drop-shadow-md">Crea tu cuenta y comienza a gestionar tu panadería</p>
        </div>

        <Card className="border-2 shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Crear tu cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* COLUMNA 1: DATOS */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Datos Personales</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nombre</Label>
                      <Input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Apellido</Label>
                      <Input required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="h-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Correo Electrónico</Label>
                    <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Teléfono (opcional)</Label>
                    <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="+569..." className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nombre de tu Panadería</Label>
                    <Input required value={form.nombreEmpresa} onChange={(e) => setForm({ ...form, nombreEmpresa: e.target.value })} className="h-9" />
                  </div>
                </div>

                {/* COLUMNA 2: SEGURIDAD */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground border-b pb-2">Seguridad</h3>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Contraseña</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-9 pr-9" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Input type={showConfirm ? "text" : "password"} required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="h-9 pr-9" />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  {error && <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-md border border-red-200 animate-in fade-in">{error}</div>}

                  <Button type="submit" className="w-full h-10 mt-6 bg-orange-600 hover:bg-orange-700 text-white" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</> : <><UserPlus className="mr-2 h-4 w-4" /> Crear cuenta</>}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    ¿Ya tienes cuenta? <Link href="/auth/iniciar-sesion" className="text-orange-600 font-medium hover:underline">Inicia sesión aquí</Link>
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}