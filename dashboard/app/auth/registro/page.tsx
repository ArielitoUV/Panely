"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Eye, EyeOff, Loader2, Mail, Building2, User, Lock, Phone } from "lucide-react"
import { toast } from "sonner"
import { AuthNavbar } from "@/components/AuthNavbar"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

// --- CONFIGURACIÓN DE PAÍSES ---
const COUNTRIES_CONFIG = [
  { code: "+56", flag: "🇨🇱", name: "Chile", digits: 9, placeholder: "9 1234 5678" },
  { code: "+54", flag: "🇦🇷", name: "Argentina", digits: 10, placeholder: "11 1234 5678" },
  { code: "+51", flag: "🇵🇪", name: "Perú", digits: 9, placeholder: "987 654 321" },
  { code: "+57", flag: "🇨🇴", name: "Colombia", digits: 10, placeholder: "300 123 4567" },
  { code: "+52", flag: "🇲🇽", name: "México", digits: 10, placeholder: "55 1234 5678" },
]

export default function RegistroPage() {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [countryCode, setCountryCode] = useState("+56")

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    nombreEmpresa: "",
    password: "",
    confirmPassword: "",
  })

  // País seleccionado actual
  const selectedCountry = COUNTRIES_CONFIG.find((c) => c.code === countryCode) || COUNTRIES_CONFIG[0]

  // --- FUNCIONES DE VALIDACIÓN ---

  const handleTextChange = (field: string, value: string, maxLen = 20) => {
    if (/[^a-zA-Z0-9\s\u00C0-\u017F]/.test(value)) {
      toast.warning("Solo se permiten letras y números", { duration: 1500 })
    }
    const clean = value.replace(/[^a-zA-Z0-9\s\u00C0-\u017F]/g, "")

    if (clean.length > maxLen) {
      toast.warning(`Máximo ${maxLen} caracteres permitidos`, { duration: 1500 })
      setForm((prev) => ({ ...prev, [field]: clean.slice(0, maxLen) }))
    } else {
      setForm((prev) => ({ ...prev, [field]: clean }))
    }
  }

  const handleEmailChange = (value: string) => {
    if (value.length > 50) {
      toast.warning("El correo no puede exceder 50 caracteres")
      setForm((prev) => ({ ...prev, email: value.slice(0, 50) }))
    } else {
      setForm((prev) => ({ ...prev, email: value }))
    }
  }

  const handlePhoneChange = (value: string) => {
    if (/\D/.test(value)) {
      toast.warning("El teléfono solo debe contener números")
    }
    const soloNumeros = value.replace(/\D/g, "")

    if (soloNumeros.length > selectedCountry.digits) {
      setForm((prev) => ({ ...prev, telefono: soloNumeros.slice(0, selectedCountry.digits) }))
    } else {
      setForm((prev) => ({ ...prev, telefono: soloNumeros }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 1. Validar Contraseñas
    if (form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    // 2. VALIDACIÓN DE CORREO ESTRICTA (.com o .cl)
    // Regex explica: ^ (inicio) + chars + @ + chars + . + (com o cl) + $ (fin)
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|cl)$/i
    
    if (!emailRegex.test(form.email)) {
        toast.error("Correo inválido", {
            description: "El correo debe contener '@' y terminar en .com o .cl",
            duration: 4000
        })
        setIsLoading(false)
        return
    }

    // 3. Validar teléfono solo si se ingresó algo
    if (form.telefono) {
      if (form.telefono.length !== selectedCountry.digits) {
        toast.error(`El número para ${selectedCountry.name} debe tener ${selectedCountry.digits} dígitos.`, {
          description: `Has ingresado ${form.telefono.length} dígitos.`,
        })
        setIsLoading(false)
        return
      }
    }

    try {
      const payload = {
        ...form,
        // Formato final: "+56 912345678"
        telefono: form.telefono ? `${countryCode} ${form.telefono}` : null,
      }

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error al registrarse")
        return
      }

      toast.success("¡Registro Exitoso!", { description: "Bienvenido a Panely." })

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("refreshToken", data.refreshToken)
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user))

        document.cookie = `panely_session=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`

        setTimeout(() => router.push("/dashboard"), 1000)
      } else {
        router.push("/auth/iniciar-sesion")
      }
    } catch (err: any) {
      toast.error("Error de conexión con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden p-2 relative bg-background">
      <AuthNavbar />

      {/* Fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/pancito2.jpg"
          alt="Fondo"
          fill
          className="object-cover blur-[2px] brightness-[0.65] dark:brightness-[0.4]"
          priority
        />
      </div>

      <div className="w-full max-w-5xl z-10 relative mt-16 mb-4 px-2 h-[calc(100vh-5rem)] flex flex-col">
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl tracking-tight">Únete a Panely</h1>
          <p className="text-white/90 mt-1 text-sm md:text-base drop-shadow-lg font-medium">
            Crea tu cuenta y comienza a gestionar tu panadería
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-card/98 backdrop-blur-xl overflow-hidden flex-1 flex flex-col">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10 border-b border-primary/20 py-3">
            <CardTitle className="text-xl md:text-2xl text-center text-primary font-bold tracking-tight">
              Formulario de Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 overflow-y-auto flex-1">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* COLUMNA 1: INFORMACIÓN */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-primary/30">
                    <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                      1
                    </div>
                    <h3 className="font-bold text-base text-foreground">Información General</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <User className="w-3 h-3 text-primary" />
                        Nombre <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        value={form.nombre}
                        onChange={(e) => handleTextChange("nombre", e.target.value)}
                        placeholder="Ej: Juan"
                        className="h-9 border-2 focus:border-primary transition-colors text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <User className="w-3 h-3 text-primary" />
                        Apellido <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        value={form.apellido}
                        onChange={(e) => handleTextChange("apellido", e.target.value)}
                        placeholder="Ej: Pérez"
                        className="h-9 border-2 focus:border-primary transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-primary" />
                      Nombre de la Panadería <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      required
                      value={form.nombreEmpresa}
                      onChange={(e) => handleTextChange("nombreEmpresa", e.target.value)}
                      placeholder="Ej: La Espiga de Oro"
                      className="h-9 border-2 focus:border-primary transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-primary" />
                      Correo Electrónico <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="h-9 border-2 focus:border-primary transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-primary" />
                      Teléfono <span className="text-muted-foreground text-xs font-normal">(Opcional)</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={countryCode}
                        onValueChange={(val) => {
                          setCountryCode(val)
                          setForm((prev) => ({ ...prev, telefono: "" }))
                        }}
                      >
                        <SelectTrigger className="w-[110px] h-9 border-2 font-semibold">
                          <SelectValue>
                            <span className="flex items-center gap-1.5">
                              <span className="text-xl">{selectedCountry.flag}</span>
                              <span className="text-xs">{selectedCountry.code}</span>
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES_CONFIG.map((country) => (
                            <SelectItem key={country.code} value={country.code} className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{country.flag}</span>
                                <span className="font-medium text-sm">{country.code}</span>
                                <span className="text-muted-foreground text-xs">{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        value={form.telefono}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="flex-1 h-9 border-2 focus:border-primary transition-colors text-sm"
                        placeholder={selectedCountry.placeholder}
                        type="tel"
                        inputMode="numeric"
                      />
                    </div>
                    {form.telefono && (
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground">
                          {selectedCountry.name} requiere {selectedCountry.digits} dígitos
                        </p>
                        <p
                          className={`text-[10px] font-semibold ${
                            form.telefono.length === selectedCountry.digits
                              ? "text-green-600 dark:text-green-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {form.telefono.length} / {selectedCountry.digits}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMNA 2: SEGURIDAD */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-secondary/40">
                    <div className="bg-secondary text-secondary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                      2
                    </div>
                    <h3 className="font-bold text-base text-foreground">Seguridad de la Cuenta</h3>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-primary" />
                      Contraseña <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="pr-9 h-9 border-2 focus:border-primary transition-colors text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Mínimo 6 caracteres. Se recomienda usar mayúsculas, números y símbolos.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-primary" />
                      Confirmar Contraseña <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        required
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="pr-9 h-9 border-2 focus:border-primary transition-colors text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <Button
                      type="submit"
                      className="w-full h-10 text-base bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando cuenta...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Completar Registro
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3 mt-3">
                    <p className="text-xs text-center text-muted-foreground">
                      ¿Ya tienes cuenta?{" "}
                      <Link
                        href="/auth/iniciar-sesion"
                        className="text-primary font-bold hover:underline transition-all hover:text-primary/80"
                      >
                        Inicia sesión aquí
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}