"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// AJUSTA ESTA URL SI TU BACKEND CORRE EN OTRO PUERTO
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function InventarioPage() {
  const { toast } = useToast()
  const [insumos, setInsumos] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    presentacion: "",
    cantidadCompra: "",
    unidadMedida: "kg",
    valorCompra: "",
  })

  // Cargar desde BD
  const fetchInsumos = async () => {
    try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`${API_URL}/insumos`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            const data = await res.json()
            setInsumos(data)
        }
    } catch (error) {
        console.error("Error al cargar inventario", error)
    }
  }

  useEffect(() => {
    fetchInsumos()
  }, [])

  const handleSave = async () => {
    if (!formData.nombre || !formData.cantidadCompra || !formData.valorCompra) {
        toast({ title: "Error", description: "Completa los campos requeridos", variant: "destructive" })
        return
    }

    setIsLoading(true)
    try {
        const token = localStorage.getItem("accessToken")
        // El backend hará la conversión matemática
        const res = await fetch(`${API_URL}/insumos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            toast({ title: "Éxito", description: "Insumo guardado correctamente" })
            setFormData({ nombre: "", presentacion: "", cantidadCompra: "", unidadMedida: "kg", valorCompra: "" })
            setIsAddOpen(false)
            fetchInsumos()
        } else {
            toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
        }
    } catch (error) {
        console.error(error)
    } finally {
        setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if(!confirm("¿Eliminar este insumo?")) return;
    try {
        const token = localStorage.getItem("accessToken")
        await fetch(`${API_URL}/insumos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        fetchInsumos()
        toast({ title: "Eliminado", description: "Insumo borrado exitosamente" })
    } catch (error) {
        console.error(error)
    }
  }

  const filteredInsumos = insumos.filter(i => 
    i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventario de Insumos</h1>
          <p className="text-muted-foreground">Gestiona tu materia prima (Todo estandarizado a gramos)</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" /> Agregar Insumo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Insumo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input 
                  placeholder="Ej: Harina Selecta" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Presentación</Label>
                  <Input 
                    placeholder="Ej: Saco" 
                    value={formData.presentacion}
                    onChange={(e) => setFormData({...formData, presentacion: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Compra ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ej: 25000" 
                    value={formData.valorCompra}
                    onChange={(e) => setFormData({...formData, valorCompra: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input 
                    type="number" 
                    placeholder="Ej: 25" 
                    value={formData.cantidadCompra}
                    onChange={(e) => setFormData({...formData, cantidadCompra: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Select 
                    value={formData.unidadMedida} 
                    onValueChange={(val) => setFormData({...formData, unidadMedida: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                      <SelectItem value="gr">Gramos (gr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Previsualización simple */}
              {formData.cantidadCompra && (
                <div className="bg-muted p-3 rounded-md text-sm text-center">
                   Se guardará como: <strong>
                     {formData.unidadMedida === 'kg' 
                        ? (parseFloat(formData.cantidadCompra) * 1000).toLocaleString() 
                        : parseFloat(formData.cantidadCompra).toLocaleString()} gramos
                   </strong>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={isLoading} className="bg-orange-600">
                {isLoading ? "Guardando..." : "Guardar en Inventario"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 bg-background/50 p-2 rounded-lg border w-full md:w-1/3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar insumo..." 
          className="border-0 bg-transparent focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Presentación</TableHead>
                <TableHead className="text-right">Stock (Gramos)</TableHead>
                <TableHead className="text-right">Costo x Gramo</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsumos.map((insumo) => (
                <TableRow key={insumo.id}>
                  <TableCell className="font-medium">{insumo.nombre}</TableCell>
                  <TableCell>{insumo.presentacion} ({insumo.cantidadCompra} {insumo.unidadMedida})</TableCell>
                  <TableCell className="text-right font-mono text-blue-600">
                    {insumo.stockGramos.toLocaleString()} gr
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    ${insumo.costoPorGramo.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(insumo.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInsumos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay insumos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}