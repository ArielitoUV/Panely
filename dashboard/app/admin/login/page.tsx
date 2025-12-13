"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, ShieldCheck, Lock } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("user", JSON.stringify(data.user))
        document.cookie = `panely_session=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`
        
        toast.success("Acceso Administrativo Concedido")
        router.push("/admin/dashboard")
      } else {
        toast.error(data.error || "Acceso denegado")
      }
    } catch (err) {
      toast.error("Error del sistema")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      
      {/* Fondo decorativo abstracto */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-lg z-10 p-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-12">
            
            <div className="flex flex-col items-center mb-8 text-center">
                <div className="bg-blue-600/20 p-4 rounded-full mb-4 ring-1 ring-blue-500/50">
                    <ShieldCheck className="h-10 w-10 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Portal Administrativo</h1>
                <p className="text-slate-400 mt-2 text-sm">
                    Acceso restringido únicamente a personal autorizado de Panely.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-slate-300">Credencial de Acceso (Email)</Label>
                    <div className="relative">
                        <Input 
                            type="email" 
                            required 
                            className="bg-slate-950/50 border-slate-700 text-white pl-10 h-11 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Contraseña Maestra</Label>
                    <div className="relative">
                        <Input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            className="bg-slate-950/50 border-slate-700 text-white pl-10 h-11 focus:ring-blue-500 focus:border-blue-500"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-11 w-11 text-slate-400 hover:text-white hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-900/20 transition-all mt-4">
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar al Sistema"}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    ← Volver al sitio público
                </Link>
            </div>
        </div>
      </div>
    </div>
  )
}