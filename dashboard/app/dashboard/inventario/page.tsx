"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function InventarioPage() {
  const [insumos, setInsumos] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    presentacion: "",
    cantidadCompra: "",
    unidadMedida: "kg", // Por defecto kg
    valorCompra: "",
  })

  // Simulación de carga (reemplazar con fetch real)
  useEffect(() => {
    const saved = localStorage.getItem("insumos_db")
    if (saved) setInsumos(JSON.parse(saved))
  }, [])

  const handleSave = () => {
    // 1. Validar
    if (!formData.nombre || !formData.cantidadCompra || !formData.valorCompra) return

    const cantidad = parseFloat(formData.cantidadCompra)
    const valor = parseInt(formData.valorCompra)
    
    // 2. Lógica de Conversión a Gramos (CORE DEL PEDIDO)
    let gramos = 0
    if (formData.unidadMedida === "kg") {
      gramos = cantidad * 1000
    } else {
      gramos = cantidad // Si son gramos, se queda igual
    }

    // 3. Calcular Costo por Gramo
    const costoGramo = valor / gramos

    const nuevoInsumo = {
      id: Date.now(),
      ...formData,
      cantidadCompra: cantidad,
      valorCompra: valor,
      stockGramos: gramos,      // Columna calculada
      costoPorGramo: costoGramo // Columna calculada
    }

    const updated = [...insumos, nuevoInsumo]
    setInsumos(updated)
    localStorage.setItem("insumos_db", JSON.stringify(updated)) // Guardar (simulado)
    
    setIsAddOpen(false)
    setFormData({ nombre: "", presentacion: "", cantidadCompra: "", unidadMedida: "kg", valorCompra: "" })
  }

  const handleDelete = (id: number) => {
    const updated = insumos.filter(i => i.id !== id)
    setInsumos(updated)
    localStorage.setItem("insumos_db", JSON.stringify(updated))
  }

  const filteredInsumos = insumos.filter(i => 
    i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario de Insumos</h1>
          <p className="text-muted-foreground">Gestiona tu materia prima (Todo estandarizado a gramos)</p>
        </div>
        
        {/* BOTÓN AGREGAR INSUMO */}
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
              
              {/* PREVISUALIZACIÓN DE LA CONVERSIÓN */}
              {formData.cantidadCompra && (
                <div className="bg-muted p-3 rounded-md text-sm text-center">
                   Se guardará como: <strong>
                     {formData.unidadMedida === 'kg' 
                        ? parseFloat(formData.cantidadCompra) * 1000 
                        : formData.cantidadCompra} gramos
                   </strong>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave} className="bg-orange-600">Guardar en Inventario</Button>
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
                <TableHead>Presentación Original</TableHead>
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
                    No hay insumos registrados
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