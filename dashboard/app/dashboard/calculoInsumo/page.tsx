"use client"

import { useState, useEffect } from "react"
// AQUÍ ES DONDE FALTA LA "X". LA AGREGAMOS A LA LISTA DE IMPORTS.
import { Calculator, Save, ChefHat, Plus, Trash2, Eye, Edit, ArrowRight, X } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Tipos
interface Insumo {
  id: number
  nombre: string
  stockGramos: number
  costoPorGramo: number
}

interface Receta {
  id: number
  nombre: string
  cantidadBase: number
  ingredientes: any[]
}

export default function CalculoInsumosPage() {
  const { toast } = useToast()
  
  // --- ESTADOS ---
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([])
  const [recetas, setRecetas] = useState<Receta[]>([])
  
  // Modales
  const [isNuevaRecetaOpen, setIsNuevaRecetaOpen] = useState(false)
  const [isListaRecetasOpen, setIsListaRecetasOpen] = useState(false)

  // Formulario Nueva Receta
  const [newReceta, setNewReceta] = useState<{nombre: string, cantidadBase: string, ingredientes: any[]}>({
    nombre: "", cantidadBase: "", ingredientes: []
  })
  const [selectedInsumoId, setSelectedInsumoId] = useState("")
  const [selectedInsumoGramos, setSelectedInsumoGramos] = useState("")

  // Calculadora
  const [nombreCliente, setNombreCliente] = useState("")
  const [cantidadSolicitada, setCantidadSolicitada] = useState("")
  const [recetaSeleccionadaId, setRecetaSeleccionadaId] = useState("")
  const [resultado, setResultado] = useState<{ingredientes: any[], totalCosto: number, sugerido: number} | null>(null)

  // --- CARGA INICIAL ---
  const fetchData = async () => {
    try {
        const token = localStorage.getItem("accessToken")
        
        const [resInsumos, resRecetas] = await Promise.all([
            fetch(`${API_URL}/insumos`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_URL}/recetas`, { headers: { Authorization: `Bearer ${token}` } })
        ])

        if(resInsumos.ok) setInsumosDisponibles(await resInsumos.json())
        if(resRecetas.ok) setRecetas(await resRecetas.json())

    } catch (e) {
        console.error("Error cargando datos", e)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- GESTIÓN DE RECETAS ---

  const agregarIngredienteAReceta = () => {
    if (!selectedInsumoId || !selectedInsumoGramos) return
    const insumo = insumosDisponibles.find(i => i.id.toString() === selectedInsumoId)
    if (!insumo) return

    setNewReceta(prev => ({
      ...prev,
      ingredientes: [...prev.ingredientes, {
        insumoId: insumo.id,
        nombre: insumo.nombre,
        cantidadGramos: parseFloat(selectedInsumoGramos)
      }]
    }))
    
    setSelectedInsumoId("")
    setSelectedInsumoGramos("")
  }

  const guardarRecetaBD = async () => {
    if (!newReceta.nombre || !newReceta.cantidadBase || newReceta.ingredientes.length === 0) {
      toast({ title: "Error", description: "Completa la receta (nombre, base y 1 ingrediente mín.)", variant: "destructive" })
      return
    }

    try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`${API_URL}/recetas`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(newReceta)
        })

        if(res.ok) {
            toast({ title: "Éxito", description: `Receta ${newReceta.nombre} guardada` })
            setIsNuevaRecetaOpen(false)
            setNewReceta({ nombre: "", cantidadBase: "", ingredientes: [] })
            fetchData() // Recargar lista
        }
    } catch (e) {
        toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" })
    }
  }

  const eliminarReceta = async (id: number) => {
      if(!confirm("¿Borrar esta receta permanentemente?")) return;
      const token = localStorage.getItem("accessToken")
      try {
        await fetch(`${API_URL}/recetas/${id}`, { 
            method: "DELETE", headers: { Authorization: `Bearer ${token}` }
        })
        toast({ title: "Eliminada", description: "Receta borrada correctamente" })
        fetchData()
        // Si la receta borrada estaba seleccionada, limpiar calculadora
        if(recetaSeleccionadaId === id.toString()) {
            setRecetaSeleccionadaId("")
            setResultado(null)
        }
      } catch (e) { console.error(e) }
  }

  // --- CALCULADORA (CORE LOGIC) ---

  // Se ejecuta cada vez que cambia la cantidad o la receta seleccionada
  useEffect(() => {
    if (!recetaSeleccionadaId || !cantidadSolicitada) {
        setResultado(null)
        return
    }

    const receta = recetas.find(r => r.id.toString() === recetaSeleccionadaId)
    if (!receta) return

    const cantidad = parseInt(cantidadSolicitada)
    if (isNaN(cantidad) || cantidad <= 0) return

    // FÓRMULA MATEMÁTICA: (CantidadSolicitada / CantidadBaseReceta) = Factor Multiplicador
    // Ejemplo: Quiero 100 panes. La receta es para 10 panes. Factor = 10.
    const factor = cantidad / receta.cantidadBase 

    let totalCosto = 0
    
    const ingredientesCalculados = receta.ingredientes.map((ing: any) => {
      const insumoData = ing.insumo 
      if (!insumoData) return null

      // Cálculo: GramosOriginales * Factor
      const cantidadNecesaria = ing.cantidadGramos * factor
      
      // Cálculo Costo: GramosNecesarios * CostoUnitarioDelInsumo
      const costoIngrediente = cantidadNecesaria * insumoData.costoPorGramo
      
      totalCosto += costoIngrediente

      return {
        nombre: insumoData.nombre,
        cantidad: cantidadNecesaria,
        costo: costoIngrediente
      }
    }).filter(Boolean)

    // Precio sugerido = Costo + 60% margen (puedes ajustar este porcentaje)
    const precioVentaSugerido = totalCosto * 1.6 

    setResultado({
      ingredientes: ingredientesCalculados,
      totalCosto,
      sugerido: precioVentaSugerido
    })

  }, [cantidadSolicitada, recetaSeleccionadaId, recetas])


  const guardarPedidoBD = async () => {
      if(!resultado || !nombreCliente) {
          toast({ title: "Atención", description: "Ingresa el nombre del cliente para guardar", variant: "destructive" })
          return
      }

      try {
        const token = localStorage.getItem("accessToken")
        const payload = {
            nombreCliente,
            cantidadPanes: parseInt(cantidadSolicitada),
            montoTotal: Math.round(resultado.sugerido),
            recetaId: parseInt(recetaSeleccionadaId),
            resumen: JSON.stringify(resultado.ingredientes)
        }

        const res = await fetch(`${API_URL}/pedidos`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload)
        })

        if (res.ok) {
            toast({ title: "Pedido Guardado", description: "Orden registrada exitosamente" })
            setNombreCliente("")
            setCantidadSolicitada("")
            setResultado(null)
        }
      } catch(e) {
          toast({ title: "Error", description: "Fallo al guardar pedido", variant: "destructive" })
      }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8 text-orange-500" />
            Cálculo de Producción
          </h1>
          <p className="text-muted-foreground">Planifica tu producción y calcula costos exactos.</p>
        </div>

        <div className="flex gap-2">
            {/* BOTÓN VER LISTA DE RECETAS */}
            <Dialog open={isListaRecetasOpen} onOpenChange={setIsListaRecetasOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" /> Ver Recetas
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Mis Recetas Guardadas</DialogTitle>
                    </DialogHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Rendimiento Base</TableHead>
                                <TableHead>Ingredientes</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recetas.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No hay recetas creadas.</TableCell></TableRow>
                            )}
                            {recetas.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium">{r.nombre}</TableCell>
                                    <TableCell>{r.cantidadBase} und.</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {r.ingredientes?.length || 0} insumos
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => eliminarReceta(r.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>

            {/* BOTÓN CREAR NUEVA RECETA */}
            <Dialog open={isNuevaRecetaOpen} onOpenChange={setIsNuevaRecetaOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
                        <ChefHat className="h-4 w-4" /> Nueva Receta
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Crear Receta Maestra</DialogTitle>
                        <DialogDescription>Define los ingredientes para una cantidad base de panes.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre del Pan</Label>
                                <Input placeholder="Ej: Marraqueta" value={newReceta.nombre} onChange={(e) => setNewReceta({...newReceta, nombre: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Rendimiento Base (Unidades)</Label>
                                <Input type="number" placeholder="Ej: 10" value={newReceta.cantidadBase} onChange={(e) => setNewReceta({...newReceta, cantidadBase: e.target.value})} />
                            </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-muted/30">
                            <h4 className="text-sm font-medium mb-3">Añadir Ingredientes</h4>
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs">Insumo (Inventario)</Label>
                                    <Select value={selectedInsumoId} onValueChange={setSelectedInsumoId}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            {insumosDisponibles.map(i => (
                                                <SelectItem key={i.id} value={i.id.toString()}>{i.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label className="text-xs">Gramos</Label>
                                    <Input type="number" placeholder="0" value={selectedInsumoGramos} onChange={(e) => setSelectedInsumoGramos(e.target.value)} />
                                </div>
                                <Button size="icon" onClick={agregarIngredienteAReceta} className="bg-green-600"><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="mt-4 space-y-2 max-h-[200px] overflow-y-auto">
                                {newReceta.ingredientes.map((ing, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm bg-background p-2 rounded border">
                                        <span>{ing.nombre}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono">{ing.cantidadGramos} gr</span>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                                                const filtered = newReceta.ingredientes.filter((_, i) => i !== idx)
                                                setNewReceta({...newReceta, ingredientes: filtered})
                                            }}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={guardarRecetaBD} className="bg-orange-600">Guardar Receta</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
        <Card className="shadow-md border-l-4 border-l-orange-500 h-fit">
          <CardHeader>
             <CardTitle>Configurar Pedido</CardTitle>
             <CardDescription>Calcula insumos para una producción específica.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <Label>1. Seleccionar Receta</Label>
                <Select value={recetaSeleccionadaId} onValueChange={setRecetaSeleccionadaId}>
                    <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="¿Qué vas a hornear hoy?" />
                    </SelectTrigger>
                    <SelectContent>
                        {recetas.map(r => (
                            <SelectItem key={r.id} value={r.id.toString()}>
                                🍞 {r.nombre} (Base: {r.cantidadBase} un.)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             </div>
             
             <div className="space-y-2">
                <Label>2. Cantidad a Producir</Label>
                <div className="relative">
                    <Input 
                        type="number" 
                        placeholder="Ej: 100" 
                        value={cantidadSolicitada}
                        onChange={(e) => setCantidadSolicitada(e.target.value)}
                        className="h-12 text-lg pr-12"
                    />
                    <span className="absolute right-4 top-3 text-muted-foreground">un.</span>
                </div>
             </div>

             <div className="space-y-2">
                <Label>3. Cliente (Opcional para guardar)</Label>
                <Input 
                    placeholder="Nombre del cliente" 
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                />
             </div>

             {!resultado && (
                 <div className="bg-muted/30 p-4 rounded-lg text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <Calculator className="h-8 w-8 opacity-20" />
                    Ingresa una cantidad y receta para ver el cálculo automático.
                 </div>
             )}
          </CardContent>
        </Card>

        {/* --- COLUMNA DERECHA: RESULTADOS --- */}
        <div className="space-y-4">
            {resultado ? (
            <Card className="border-2 border-blue-500/20 shadow-lg animate-in fade-in slide-in-from-right-4">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl text-blue-700 dark:text-blue-400">Hoja de Producción</CardTitle>
                            <CardDescription>Para {cantidadSolicitada} unidades</CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Costo Estimado</p>
                            <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                                ${Math.round(resultado.totalCosto).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-6">Ingrediente</TableHead>
                            <TableHead className="text-right">Cantidad Necesaria</TableHead>
                            <TableHead className="text-right pr-6">Costo</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {resultado.ingredientes.map((ing: any, idx: number) => (
                            <TableRow key={idx} className="hover:bg-muted/50">
                            <TableCell className="pl-6 font-medium">{ing.nombre}</TableCell>
                            <TableCell className="text-right">
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {Math.ceil(ing.cantidad).toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">gr</span>
                                {ing.cantidad >= 1000 && (
                                    <span className="block text-xs text-blue-600">
                                        ({(ing.cantidad/1000).toFixed(2)} kg)
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-right pr-6 text-muted-foreground">
                                ${Math.round(ing.costo).toLocaleString()}
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    
                    <div className="bg-muted/30 p-6 space-y-4 border-t">
                        <div className="flex justify-between items-center text-lg">
                            <span className="font-semibold">Precio Venta Sugerido:</span>
                            <span className="font-bold text-green-600 text-2xl">
                                ${Math.round(resultado.sugerido).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                            (Incluye costo de materia prima + 60% de margen)
                        </p>
                        
                        <Button onClick={guardarPedidoBD} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg shadow-md mt-2">
                            <Save className="mr-2 h-5 w-5" /> Confirmar y Guardar Pedido
                        </Button>
                    </div>
                </CardContent>
            </Card>
            ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground p-8 text-center">
                    <ArrowRight className="h-12 w-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">Esperando datos...</h3>
                    <p className="max-w-xs text-sm">
                        Selecciona una receta y cantidad en el panel izquierdo para ver los requerimientos exactos.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}