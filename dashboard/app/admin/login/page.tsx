"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AdminLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
        const res = await fetch(`${API_URL}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        })
        const data = await res.json()

        if (res.ok) {
            // Guardamos token de admin
            localStorage.setItem("accessToken", data.accessToken)
            localStorage.setItem("user", JSON.stringify(data.user))
            toast({ title: "Bienvenido Administrador" })
            router.push("/admin/dashboard")
        } else {
            toast({ title: "Error", description: data.error, variant: "destructive" })
        }
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-200">
        <CardHeader className="text-center">
            <div className="mx-auto bg-orange-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Acceso Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Correo Admin</Label>
                    <Input className="bg-slate-800 border-slate-700" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Contraseña</Label>
                    <Input type="password" className="bg-slate-800 border-slate-700" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin"/> : "Ingresar al Panel"}
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  )
}