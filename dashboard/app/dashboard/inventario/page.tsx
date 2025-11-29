"use client"

import { useState, useEffect } from "react"
import { Package, AlertTriangle, CheckCircle, Search, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Insumo {
  id: number
  nombre: string
  presentacion: string
  unidadMedida: string
  valorCompra: number
  stockActual: number
  stockMinimo: number
}

export default function InventarioPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [form, setForm] = useState({
    nombre: "",
    presentacion: "",
    unidadMedida: "",
    valorCompra: "",
    stockActual: "",
    stockMinimo: "10",
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("accessToken")
    if (storedUser) setUser(JSON.parse(storedUser))

    const cargarInsumos = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch("http://localhost:3001/insumos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        
        if (res.ok && data.success) {
          setInsumos(data.insumos || [])
        } else {
          console.log("Respuesta del servidor:", data)
          if (data.error === "Invalid token") {
            alert("Sesión expirada. Vuelve a iniciar sesión.")
            localStorage.clear()
            window.location.href = "/auth/iniciar-sesion"
          }
        }
      } catch (err) {
        console.error("Error de red:", err)
      } finally {
        setIsLoading(false)
      }
    }

    cargarInsumos()
  }, [])

  const crearInsumo = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("accessToken")
    if (!token) return

    try {
      const res = await fetch("http://localhost:3001/insumos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombre,
          presentacion: form.presentacion,
          unidadMedida: form.unidadMedida,
          valorCompra: parseInt(form.valorCompra) || 0,
          stockActual: parseInt(form.stockActual) || 0,
          stockMinimo: parseInt(form.stockMinimo) || 10,
        }),
      })

      if (res.ok) {
        setIsModalOpen(false)
        setForm({ nombre: "", presentacion: "", unidadMedida: "", valorCompra: "", stockActual: "", stockMinimo: "10" })
        window.location.reload() // recarga rápida para ver el nuevo insumo
      } else {
        const error = await res.json()
        alert("Error: " + (error.error || "No se pudo guardar"))
      }
    } catch (err) {
      alert("Error de conexión")
    }
  }

  const filtered = insumos.filter(i => i.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  const bajos = insumos.filter(i => i.stockActual < i.stockMinimo).length

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-10 w-10 animate-spin" /></div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.nombre || "Usuario"}</p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2" /> Agregar Insumo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Insumo</DialogTitle>
            </DialogHeader>
            <form onSubmit={crearInsumo} className="space-y-4">
              <Input placeholder="Nombre del insumo" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Presentación (ej: Bolsa 25kg)" required value={form.presentacion} onChange={e => setForm({...form, presentacion: e.target.value})} />
                <Input placeholder="Unidad (kg, un, lt)" required value={form.unidadMedida} onChange={e => setForm({...form, unidadMedida: e.target.value})} />
              </div>
              <Input type="number" placeholder="Valor compra ($)" required value={form.valorCompra} onChange={e => setForm({...form, valorCompra: e.target.value})} />
              <Input type="number" placeholder="Stock mínimo" value={form.stockMinimo} onChange={e => setForm({...form, stockMinimo: e.target.value})} />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Insumos</p>
          <p className="text-3xl font-bold">{insumos.length}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Stock Normal</p>
          <p className="text-3xl font-bold text-green-600">{insumos.length - bajos}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <p className="text-sm text-muted-foreground">Stock Bajo</p>
          <p className="text-3xl font-bold text-red-600">{bajos}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar insumo..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">Insumo</th>
              <th className="text-left p-4">Presentación</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-left p-4">Mínimo</th>
              <th className="text-left p-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-t">
                <td className="p-4 font-medium">{i.nombre}</td>
                <td className="p-4 text-sm text-muted-foreground">{i.presentacion}</td>
                <td className="p-4">{i.stockActual} {i.unidadMedida}</td>
                <td className="p-4 text-sm">{i.stockMinimo}</td>
                <td className="p-4">
                  {i.stockActual < i.stockMinimo ? (
                    <span className="text-red-600 font-medium">Stock Bajo</span>
                  ) : (
                    <span className="text-green-600 font-medium">Normal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay insumos registrados aún</p>
          </div>
        )}
      </div>
    </div>
  )
}