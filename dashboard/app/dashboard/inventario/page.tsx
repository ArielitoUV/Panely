"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Insumo {
  id: number
  nombre: string
  presentacion: string
  cantidadCompra: number
  unidadMedida: string
  valorCompra: number
  costoPorUnidad: number
}

export default function InventarioPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [form, setForm] = useState({
    nombre: "",
    presentacion: "",
    cantidadCompra: "",
    unidadMedida: "",
    valorCompra: "",
  })

  useEffect(() => {
    const u = localStorage.getItem("user")
    if (u) setUser(JSON.parse(u))
    cargarInsumos()
  }, [])

  const cargarInsumos = async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return

    const res = await fetch("http://localhost:3001/insumos", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    if (data.success) setInsumos(data.insumos || [])
  }

  const guardarInsumo = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("accessToken")
    if (!token) return

    await fetch("http://localhost:3001/insumos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: form.nombre,
        presentacion: form.presentacion,
        cantidadCompra: parseFloat(form.cantidadCompra),
        unidadMedida: form.unidadMedida,
        valorCompra: parseInt(form.valorCompra),
      })
    })

    setIsOpen(false)
    setForm({ nombre: "", presentacion: "", cantidadCompra: "", unidadMedida: "", valorCompra: "" })
    cargarInsumos()
  }

  const filtered = insumos.filter(i => 
    i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario de Insumos</h1>
          <p className="text-muted-foreground">Bienvenido, {user?.nombre || "Panadero"}</p>
        </div>

        {/* BOTÓN AGREGAR - CORREGIDO */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-5 w-5" /> Agregar Insumo
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Insumo</DialogTitle>
            </DialogHeader>
            <form onSubmit={guardarInsumo} className="space-y-4">
              <Input placeholder="Nombre (ej: Harina)" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
              
              <Input placeholder="Presentación (ej: Bolsa 25kg)" required value={form.presentacion} onChange={e => setForm({...form, presentacion: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="Cantidad comprada (ej: 25)" 
                  required 
                  value={form.cantidadCompra} 
                  onChange={e => setForm({...form, cantidadCompra: e.target.value})} 
                />
                <Input 
                  placeholder="Unidad (kg, lt, unidad)" 
                  required 
                  value={form.unidadMedida} 
                  onChange={e => setForm({...form, unidadMedida: e.target.value})} 
                />
              </div>

              <Input 
                type="number" 
                placeholder="Precio total pagado ($)" 
                required 
                value={form.valorCompra} 
                onChange={e => setForm({...form, valorCompra: e.target.value})} 
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Insumo</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Buscar insumo..." 
          className="pl-10" 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>

      {/* TABLA */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4">Insumo</th>
              <th className="text-left p-4">Presentación</th>
              <th className="text-left p-4">Costo por unidad</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12 text-muted-foreground">
                  No hay insumos registrados aún
                </td>
              </tr>
            ) : (
              filtered.map(i => (
                <tr key={i.id} className="border-t hover:bg-muted/50">
                  <td className="p-4 font-medium">{i.nombre}</td>
                  <td className="p-4 text-muted-foreground">{i.presentacion}</td>
                  <td className="p-4 font-semibold text-orange-600">
                    ${Math.round(i.costoPorUnidad).toLocaleString()} / {i.unidadMedida}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}