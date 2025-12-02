"use client"

import { useState, useEffect } from "react"
import { Calculator, Save, ChefHat, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Tipos
interface Insumo {
  id: number
  nombre: string
  stockGramos: number
  costoPorGramo: number
}

interface IngredienteReceta {
  insumoId: number
  nombre: string // Para mostrar en UI
  cantidadGramos: number
  costoPorGramo: number // Para calcular
}

interface Receta {
  id: number
  nombre: string
  cantidadBase: number // Para cuantos panes es esta receta (Ej: 16)
  ingredientes: IngredienteReceta[]
}

export default function CalculoInsumosPage() {
  // Datos
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([])
  const [recetas, setRecetas] = useState<Receta[]>([])
  
  // Estado Modal Receta
  const [isRecetaOpen, setIsRecetaOpen] = useState(false)
  const [newReceta, setNewReceta] = useState<{nombre: string, cantidadBase: string, ingredientes: IngredienteReceta[]}>({
    nombre: "",
    cantidadBase: "",
    ingredientes: []
  })
  const [selectedInsumoId, setSelectedInsumoId] = useState("")
  const [selectedInsumoGramos, setSelectedInsumoGramos] = useState("")

  // Estado Calculadora
  const [cantidadSolicitada, setCantidadSolicitada] = useState("")
  const [recetaSeleccionadaId, setRecetaSeleccionadaId] = useState("")
  const [resultado, setResultado] = useState<{ingredientes: any[], totalCosto: number, sugerido: number} | null>(null)

  // Cargar datos (Simulado - conectar con API real)
  useEffect(() => {
    const loadedInsumos = localStorage.getItem("insumos_db")
    if (loadedInsumos) setInsumosDisponibles(JSON.parse(loadedInsumos))

    const loadedRecetas = localStorage.getItem("recetas_db")
    if (loadedRecetas) setRecetas(JSON.parse(loadedRecetas))
  }, [])

  // --- LÓGICA GESTIÓN RECETAS ---
  
  const agregarIngredienteAReceta = () => {
    if (!selectedInsumoId || !selectedInsumoGramos) return
    
    const insumo = insumosDisponibles.find(i => i.id.toString() === selectedInsumoId)
    if (!insumo) return

    const nuevoIngrediente: IngredienteReceta = {
      insumoId: insumo.id,
      nombre: insumo.nombre,
      cantidadGramos: parseFloat(selectedInsumoGramos),
      costoPorGramo: insumo.costoPorGramo
    }

    setNewReceta(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, nuevoIngrediente]
    }))
    
    setSelectedInsumoId("")
    setSelectedInsumoGramos("")
  }

  const guardarReceta = () => {
    if (!newReceta.nombre || !newReceta.cantidadBase || newReceta.ingredientes.length === 0) {
      alert("Completa la receta (nombre, cantidad base y al menos 1 ingrediente)")
      return
    }

    const recetaGuardar: Receta = {
      id: Date.now(),
      nombre: newReceta.nombre,
      cantidadBase: parseInt(newReceta.cantidadBase),
      ingredientes: newReceta.ingredientes
    }

    const updatedRecetas = [...recetas, recetaGuardar]
    setRecetas(updatedRecetas)
    localStorage.setItem("recetas_db", JSON.stringify(updatedRecetas))
    
    setIsRecetaOpen(false)
    setNewReceta({ nombre: "", cantidadBase: "", ingredientes: [] })
  }

  // --- LÓGICA CÁLCULO DE PEDIDO ---

  const calcularPedido = () => {
    if (!recetaSeleccionadaId || !cantidadSolicitada) return

    const receta = recetas.find(r => r.id.toString() === recetaSeleccionadaId)
    if (!receta) return

    const cantidad = parseInt(cantidadSolicitada)
    const factor = cantidad / receta.cantidadBase // Ej: Quiero 100, Receta es para 16. Factor = 6.25

    let totalCosto = 0
    
    const ingredientesCalculados = receta.ingredientes.map(ing => {
      const cantidadNecesaria = ing.cantidadGramos * factor
      const costoIngrediente = cantidadNecesaria * ing.costoPorGramo
      
      totalCosto += costoIngrediente

      return {
        nombre: ing.nombre,
        cantidad: cantidadNecesaria,
        costo: costoIngrediente
      }
    })

    // Margen de ganancia (60% ejemplo)
    const precioVentaSugerido = totalCosto * 1.6 

    setResultado({
      ingredientes: ingredientesCalculados,
      totalCosto,
      sugerido: precioVentaSugerido
    })
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8 text-orange-500" />
            Cálculo de Insumos
          </h1>
          <p className="text-muted-foreground">Selecciona una receta y la cantidad de panes a producir.</p>
        </div>

        {/* --- POPUP GESTIONAR RECETA --- */}
        <Dialog open={isRecetaOpen} onOpenChange={setIsRecetaOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
              <ChefHat className="mr-2 h-4 w-4" /> Gestionar Recetas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Receta Maestra</DialogTitle>
              <DialogDescription>
                Define los ingredientes para una cantidad base (Ej: Receta para 16 panes).
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Pan</Label>
                  <Input 
                    placeholder="Ej: Hallulla Especial" 
                    value={newReceta.nombre}
                    onChange={(e) => setNewReceta({...newReceta, nombre: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rendimiento Base (Unidades)</Label>
                  <Input 
                    type="number" 
                    placeholder="Ej: 16" 
                    value={newReceta.cantidadBase}
                    onChange={(e) => setNewReceta({...newReceta, cantidadBase: e.target.value})}
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="text-sm font-medium mb-3">Agregar Ingredientes</h4>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Insumo (Inventario)</Label>
                    <Select value={selectedInsumoId} onValueChange={setSelectedInsumoId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {insumosDisponibles.map(i => (
                          <SelectItem key={i.id} value={i.id.toString()}>{i.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-xs">Gramos</Label>
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={selectedInsumoGramos}
                      onChange={(e) => setSelectedInsumoGramos(e.target.value)}
                    />
                  </div>
                  <Button size="icon" onClick={agregarIngredienteAReceta} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de ingredientes agregados a la receta */}
                <div className="mt-4 space-y-2">
                  {newReceta.ingredientes.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-background p-2 rounded border">
                      <span>{ing.nombre}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono">{ing.cantidadGramos} gr</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => {
                             const filtered = newReceta.ingredientes.filter((_, i) => i !== idx)
                             setNewReceta({...newReceta, ingredientes: filtered})
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={guardarReceta} className="bg-orange-600">Guardar Receta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PANEL IZQUIERDO: FORMULARIO CÁLCULO */}
        <Card>
          <CardHeader>
             <CardTitle>Generar Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label>Seleccionar Receta</Label>
                <Select value={recetaSeleccionadaId} onValueChange={setRecetaSeleccionadaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Qué vamos a hornear?" />
                  </SelectTrigger>
                  <SelectContent>
                    {recetas.map(r => (
                      <SelectItem key={r.id} value={r.id.toString()}>
                        {r.nombre} (Base: {r.cantidadBase} un.)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
             
             <div className="space-y-2">
                <Label>Cantidad a Producir</Label>
                <Input 
                  type="number" 
                  placeholder="Ej: 100" 
                  value={cantidadSolicitada}
                  onChange={(e) => setCantidadSolicitada(e.target.value)}
                />
             </div>

             <Button onClick={calcularPedido} className="w-full bg-orange-600 hover:bg-orange-700">
               Calcular Insumos y Costos
             </Button>
          </CardContent>
        </Card>

        {/* PANEL DERECHO: RESULTADOS */}
        {resultado ? (
           <Card className="border-l-4 border-l-blue-500">
             <CardHeader>
               <CardTitle>Detalle de Producción</CardTitle>
               <CardDescription>
                 Insumos necesarios para {cantidadSolicitada} panes.
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Ingrediente</TableHead>
                     <TableHead className="text-right">Cantidad</TableHead>
                     <TableHead className="text-right">Costo</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {resultado.ingredientes.map((ing, idx) => (
                     <TableRow key={idx}>
                       <TableCell>{ing.nombre}</TableCell>
                       <TableCell className="text-right font-medium">
                         {(ing.cantidad).toLocaleString()} gr
                         {ing.cantidad >= 1000 && <span className="text-xs text-muted-foreground ml-1">({(ing.cantidad/1000).toFixed(2)} kg)</span>}
                       </TableCell>
                       <TableCell className="text-right text-muted-foreground">
                         ${Math.round(ing.costo).toLocaleString()}
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
               
               <div className="bg-muted/50 p-4 rounded-lg space-y-2 mt-4">
                 <div className="flex justify-between text-sm">
                   <span>Costo Total Insumos:</span>
                   <span className="font-bold">${Math.round(resultado.totalCosto).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-lg text-green-700 font-bold border-t pt-2 mt-2">
                   <span>Ganancia Estimada:</span>
                   <span>${Math.round(resultado.sugerido - resultado.totalCosto).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm text-muted-foreground">
                   <span>Valor Cobro Total (Sugerido):</span>
                   <span>${Math.round(resultado.sugerido).toLocaleString()}</span>
                 </div>
               </div>
               
               <Button className="w-full bg-green-600 hover:bg-green-700">
                 <Save className="mr-2 h-4 w-4" /> Guardar Pedido
               </Button>
             </CardContent>
           </Card>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-muted-foreground bg-muted/10">
            <Calculator className="h-12 w-12 mb-4 opacity-20" />
            <p>Realiza un cálculo para ver los detalles aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}