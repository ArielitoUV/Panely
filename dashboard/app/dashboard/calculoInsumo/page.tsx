"use client"

import { useState, useEffect } from "react"
import { Calculator, Save, ChefHat, Plus, Trash2, Eye, Edit, ArrowRight, X, Flame, TrendingUp } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// --- TIPOS ---
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
  ingredientes: {
    insumoId: number
    cantidadGramos: number
    insumo?: Insumo
  }[]
}

// Generador de porcentajes (5% al 100%)
const porcentajes = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

export default function CalculoInsumosPage() {
  const { toast } = useToast()
  
  // --- ESTADOS DE DATOS ---
  const [insumosDisponibles, setInsumosDisponibles] = useState<Insumo[]>([])
  const [recetas, setRecetas] = useState<Receta[]>([])
  
  // --- ESTADOS MODALES ---
  const [isNuevaRecetaOpen, setIsNuevaRecetaOpen] = useState(false)
  const [isListaRecetasOpen, setIsListaRecetasOpen] = useState(false)

  // --- ESTADOS FORMULARIO RECETA ---
  const [editingId, setEditingId] = useState<number | null>(null) // ID si estamos editando
  const [newReceta, setNewReceta] = useState<{nombre: string, cantidadBase: string, ingredientes: any[]}>({
    nombre: "", cantidadBase: "", ingredientes: []
  })
  const [selectedInsumoId, setSelectedInsumoId] = useState("")
  const [selectedInsumoGramos, setSelectedInsumoGramos] = useState("")

  // --- ESTADOS CALCULADORA ---
  const [nombreCliente, setNombreCliente] = useState("")
  const [cantidadSolicitada, setCantidadSolicitada] = useState("")
  const [recetaSeleccionadaId, setRecetaSeleccionadaId] = useState("")
  
  // Nuevos campos de costos
  const [porcentajeGastos, setPorcentajeGastos] = useState("10") // Default 10% (Gas/Luz)
  const [margenGanancia, setMargenGanancia] = useState("60")   // Default 60%

  const [resultado, setResultado] = useState<{
      ingredientes: any[], 
      costoMateriaPrima: number, 
      costoOperativo: number,
      costoTotal: number,
      sugerido: number
  } | null>(null)

  // --- CARGA INICIAL ---
  const fetchData = async () => {
    try {
        const token = localStorage.getItem("accessToken")
        const headers = { Authorization: `Bearer ${token}` }
        
        const [resInsumos, resRecetas] = await Promise.all([
            fetch(`${API_URL}/insumos`, { headers }),
            fetch(`${API_URL}/recetas`, { headers })
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

  // --- GESTIÓN DE RECETAS (CRUD) ---

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

  // Cargar datos en el modal para editar
  const handleEditarReceta = (receta: Receta) => {
      setEditingId(receta.id)
      setNewReceta({
          nombre: receta.nombre,
          cantidadBase: receta.cantidadBase.toString(),
          ingredientes: receta.ingredientes.map((ing) => ({
              insumoId: ing.insumoId,
              nombre: ing.insumo?.nombre || "Insumo",
              cantidadGramos: ing.cantidadGramos
          }))
      })
      setIsListaRecetasOpen(false) // Cierra lista
      setIsNuevaRecetaOpen(true)   // Abre editor
  }

  // Guardar (POST o PUT)
  const guardarRecetaBD = async () => {
    if (!newReceta.nombre || !newReceta.cantidadBase || newReceta.ingredientes.length === 0) {
      toast({ title: "Error", description: "Faltan datos en la receta", variant: "destructive" })
      return
    }

    try {
        const token = localStorage.getItem("accessToken")
        
        // Si hay editingId hacemos PUT, sino POST
        const url = editingId ? `${API_URL}/recetas/${editingId}` : `${API_URL}/recetas`
        const method = editingId ? "PUT" : "POST"

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(newReceta)
        })

        if(res.ok) {
            toast({ title: "Éxito", description: editingId ? "Receta actualizada" : "Receta creada" })
            setIsNuevaRecetaOpen(false)
            setNewReceta({ nombre: "", cantidadBase: "", ingredientes: [] })
            setEditingId(null) // Limpiar modo edición
            fetchData() 
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
        if(recetaSeleccionadaId === id.toString()) {
            setRecetaSeleccionadaId("")
            setResultado(null)
        }
      } catch (e) { console.error(e) }
  }

  // --- CALCULADORA MATEMÁTICA ---

  useEffect(() => {
    if (!recetaSeleccionadaId || !cantidadSolicitada) {
        setResultado(null)
        return
    }

    const receta = recetas.find(r => r.id.toString() === recetaSeleccionadaId)
    if (!receta) return

    const cantidad = parseInt(cantidadSolicitada)
    if (isNaN(cantidad) || cantidad <= 0) return

    // 1. Calcular Insumos Base
    const factor = cantidad / receta.cantidadBase 
    let costoMateriaPrima = 0
    
    const ingredientesCalculados = receta.ingredientes.map((ing: any) => {
      const insumoData = ing.insumo 
      if (!insumoData) return null

      const cantidadNecesaria = ing.cantidadGramos * factor
      const costoIngrediente = cantidadNecesaria * insumoData.costoPorGramo
      
      costoMateriaPrima += costoIngrediente

      return {
        nombre: insumoData.nombre,
        cantidad: cantidadNecesaria,
        costo: costoIngrediente
      }
    }).filter(Boolean)

    // 2. Agregar Gastos Operativos (Agua, Luz, Gas)
    const pctGastos = parseInt(porcentajeGastos) || 0
    const costoOperativo = costoMateriaPrima * (pctGastos / 100)
    
    const costoTotalProduccion = costoMateriaPrima + costoOperativo

    // 3. Agregar Margen de Ganancia
    const pctMargen = parseInt(margenGanancia) || 0
    const precioVentaSugerido = costoTotalProduccion * (1 + (pctMargen / 100))

    setResultado({
      ingredientes: ingredientesCalculados,
      costoMateriaPrima,
      costoOperativo,
      costoTotal: costoTotalProduccion,
      sugerido: precioVentaSugerido
    })

  }, [cantidadSolicitada, recetaSeleccionadaId, recetas, porcentajeGastos, margenGanancia])


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
            resumen: JSON.stringify({
                ingredientes: resultado.ingredientes,
                gastos: porcentajeGastos,
                margen: margenGanancia
            })
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
            Cálculo de Insumos
          </h1>
          <p className="text-muted-foreground">Planifica producción, costos fijos y márgenes de ganancia.</p>
        </div>

        <div className="flex gap-2">
            {/* BOTÓN VER LISTA */}
            <Dialog open={isListaRecetasOpen} onOpenChange={setIsListaRecetasOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50">
                        <Eye className="h-4 w-4" /> Ver Recetas
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Gestión de Recetas</DialogTitle>
                        <DialogDescription>Lista de todas tus recetas maestras.</DialogDescription>
                    </DialogHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Base</TableHead>
                                <TableHead>Ingredientes</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recetas.map((r) => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium">{r.nombre}</TableCell>
                                    <TableCell>{r.cantidadBase} und.</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {r.ingredientes?.map((i: any) => i.insumo?.nombre).join(", ")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* BOTÓN EDITAR */}
                                            <Button size="sm" variant="ghost" onClick={() => handleEditarReceta(r)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => eliminarReceta(r.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>

            {/* BOTÓN NUEVA RECETA */}
            <Dialog open={isNuevaRecetaOpen} onOpenChange={(open) => {
                setIsNuevaRecetaOpen(open)
                if(!open) {
                    setEditingId(null)
                    setNewReceta({ nombre: "", cantidadBase: "", ingredientes: [] })
                }
            }}>
                <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
                        <ChefHat className="h-4 w-4" /> Nueva Receta
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Editar Receta" : "Crear Receta Maestra"}</DialogTitle>
                    </DialogHeader>
                    
                    {/* FORMULARIO DE RECETA */}
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input placeholder="Ej: Marraqueta" value={newReceta.nombre} onChange={(e) => setNewReceta({...newReceta, nombre: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Rendimiento Base</Label>
                                <Input type="number" placeholder="Ej: 10" value={newReceta.cantidadBase} onChange={(e) => setNewReceta({...newReceta, cantidadBase: e.target.value})} />
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-muted/30">
                            <h4 className="text-sm font-medium mb-3">Ingredientes</h4>
                            <div className="flex gap-2 items-end mb-4">
                                <div className="flex-1">
                                    <Label className="text-xs">Insumo</Label>
                                    <Select value={selectedInsumoId} onValueChange={setSelectedInsumoId}>
                                        <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                        <SelectContent>
                                            {insumosDisponibles.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.nombre}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-24">
                                    <Label className="text-xs">Gramos</Label>
                                    <Input type="number" value={selectedInsumoGramos} onChange={(e) => setSelectedInsumoGramos(e.target.value)} />
                                </div>
                                <Button size="icon" onClick={agregarIngredienteAReceta} className="bg-green-600"><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {newReceta.ingredientes.map((ing, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm bg-background p-2 rounded border">
                                        <span>{ing.nombre}</span>
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono">{ing.cantidadGramos} gr</span>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                                                const filtered = newReceta.ingredientes.filter((_, i) => i !== idx)
                                                setNewReceta({...newReceta, ingredientes: filtered})
                                            }}><X className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={guardarRecetaBD} className="bg-orange-600">{editingId ? "Actualizar" : "Guardar"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* --- COLUMNA IZQUIERDA: CONFIGURACIÓN --- */}
        <Card className="shadow-md border-l-4 border-l-orange-500 h-fit">
          <CardHeader>
             <CardTitle>Configurar Producción</CardTitle>
             <CardDescription>Define qué producir y los parámetros de costo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {/* 1. RECETA Y CANTIDAD */}
             <div className="grid grid-cols-1 gap-4 p-4 bg-orange-50 dark:bg-orange-950/10 rounded-lg">
                 <div className="space-y-2">
                    <Label>Receta a Utilizar</Label>
                    <Select value={recetaSeleccionadaId} onValueChange={setRecetaSeleccionadaId}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Seleccionar Pan..." /></SelectTrigger>
                        <SelectContent>
                            {recetas.map(r => (
                                <SelectItem key={r.id} value={r.id.toString()}>🍞 {r.nombre} (Base: {r.cantidadBase})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label>Cantidad a Producir (Unidades)</Label>
                    <Input type="number" placeholder="Ej: 100" className="bg-background font-bold text-lg" value={cantidadSolicitada} onChange={(e) => setCantidadSolicitada(e.target.value)} />
                 </div>
             </div>

             <Separator />

             {/* 2. PARÁMETROS DE COSTOS (NUEVO) */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                        <Flame className="h-3 w-3" /> Gastos (Gas/Luz)
                    </Label>
                    <Select value={porcentajeGastos} onValueChange={setPorcentajeGastos}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">0% (Solo materia prima)</SelectItem>
                            {porcentajes.map(p => (
                                <SelectItem key={p} value={p.toString()}>{p}% adicional</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                        <TrendingUp className="h-3 w-3" /> Margen Ganancia
                    </Label>
                    <Select value={margenGanancia} onValueChange={setMargenGanancia}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {porcentajes.map(p => (
                                <SelectItem key={p} value={p.toString()}>{p}% utilidad</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>
             </div>

             <div className="space-y-2 pt-4">
                <Label>Cliente (Opcional)</Label>
                <Input placeholder="Nombre del cliente" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} />
             </div>
          </CardContent>
        </Card>

        {/* --- COLUMNA DERECHA: HOJA DE COSTOS --- */}
        <div className="space-y-4">
            {resultado ? (
            <Card className="border-2 border-blue-500/20 shadow-xl animate-in fade-in slide-in-from-right-4 bg-white dark:bg-card">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-4 border-b">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-blue-700 dark:text-blue-400">Estructura de Costos</CardTitle>
                        <div className="text-right">
                            <p className="text-xs uppercase font-bold text-muted-foreground">Costo Total</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-200">${Math.round(resultado.costoTotal).toLocaleString()}</p>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-0">
                    {/* DETALLE MATERIA PRIMA */}
                    <div className="p-4 bg-muted/20">
                        <h4 className="text-xs font-bold uppercase mb-2 text-muted-foreground">Materia Prima</h4>
                        <div className="space-y-1">
                            {resultado.ingredientes.map((ing: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span>{ing.nombre} <span className="text-xs text-muted-foreground">({Math.ceil(ing.cantidad)}gr)</span></span>
                                    <span className="font-mono">${Math.round(ing.costo).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="border-t mt-2 pt-1 flex justify-between font-semibold text-sm">
                                <span>Subtotal Insumos</span>
                                <span>${Math.round(resultado.costoMateriaPrima).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* DETALLE GASTOS */}
                    <div className="p-4 bg-orange-50/50 dark:bg-orange-950/10 border-t border-dashed">
                        <div className="flex justify-between text-sm text-orange-800 dark:text-orange-200">
                            <span>+ Gastos Operativos ({porcentajeGastos}%)</span>
                            <span className="font-mono">${Math.round(resultado.costoOperativo).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    {/* PRECIO FINAL */}
                    <div className="bg-slate-900 text-white p-6 rounded-b-lg">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-slate-400 text-sm">Margen de Ganancia ({margenGanancia}%)</span>
                            <span className="text-green-400 font-mono">+${Math.round(resultado.sugerido - resultado.costoTotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-700 pt-3 mt-2">
                            <span className="font-bold text-lg">Precio Venta:</span>
                            <span className="font-black text-3xl tracking-tight text-green-400">
                                ${Math.round(resultado.sugerido).toLocaleString()}
                            </span>
                        </div>
                        
                        <Button onClick={guardarPedidoBD} className="w-full bg-green-600 hover:bg-green-500 text-white mt-4 h-12 font-bold">
                            <Save className="mr-2 h-5 w-5" /> Guardar Pedido
                        </Button>
                    </div>
                </CardContent>
            </Card>
            ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/10 text-muted-foreground p-8 text-center">
                    <ArrowRight className="h-12 w-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-2">Calculadora de Costos</h3>
                    <p className="max-w-xs text-sm">
                        Configura la receta, cantidad y porcentajes a la izquierda para ver el desglose financiero completo.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}