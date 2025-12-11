"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Edit, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner" // Usamos Sonner
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// --- CONFIGURACIÓN ESTRICTA DE INSUMOS Y SUS PRESENTACIONES ---
const INSUMOS_CONFIG: Record<string, string[]> = {
    "Azúcar": ["Bolsa individual", "Saco", "Tarro"],
    "Harina": ["Bolsa Individual", "Saco"],
    "Levadura": ["Paquete", "Individual"],
    "Manteca": ["Bolsa Individual", "Tarro"],
    "Mejorador": ["Bolsa Individual", "Paquete"],
    "Sal": ["Bolsa Individual", "Saco"]
}

export default function InventarioPage() {
  
  const [insumos, setInsumos] = useState<any[]>([])
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    nombre: "",
    presentacion: "",
    cantidadCompra: "",
    unidadMedida: "kg",
    valorCompra: "",
  })

  // Solo cargamos la lista de insumos guardados, los tipos ya los tenemos en duro
  const fetchData = async () => {
    try {
        const token = localStorage.getItem("accessToken")
        const headers = { Authorization: `Bearer ${token}` }
        
        const resInsumos = await fetch(`${API_URL}/insumos`, { headers })
        if (resInsumos.ok) setInsumos(await resInsumos.json())

    } catch (error) {
        console.error("Error cargando datos", error)
        toast.error("Error de conexión al cargar el inventario")
    }
  }

  useEffect(() => { fetchData() }, [])

  // --- VALIDACIONES PROFESIONALES (FRONTEND) ---

  const handleCantidadChange = (valor: string) => {
      // 1. Alerta si ingresa letras
      if (/\D/.test(valor)) {
          toast.warning("Solo se permiten números", { duration: 2000 })
      }
      const soloNumeros = valor.replace(/\D/g, "")

      // 2. Alerta y bloqueo si pasa de 5 dígitos
      if (soloNumeros.length > 5) {
          toast.warning("Máximo 5 dígitos permitidos por ahora", { duration: 2000 })
          setFormData({ ...formData, cantidadCompra: soloNumeros.slice(0, 5) })
      } else {
          setFormData({ ...formData, cantidadCompra: soloNumeros })
      }
  }

  const handleValorChange = (valor: string) => {
      // 1. Alerta si ingresa letras
      if (/\D/.test(valor)) {
          toast.warning("Solo se permiten números", { duration: 2000 })
      }
      const soloNumeros = valor.replace(/\D/g, "")

      // 2. Alerta y bloqueo si pasa de 10 dígitos (NUEVO)
      if (soloNumeros.length > 10) {
          toast.warning("El precio no puede exceder los 10 dígitos", { duration: 2000 })
          setFormData({ ...formData, valorCompra: soloNumeros.slice(0, 10) })
      } else {
          setFormData({ ...formData, valorCompra: soloNumeros })
      }
  }

  const handleNombreChange = (nuevoNombre: string) => {
      // Al cambiar el nombre, reseteamos la presentación para evitar inconsistencias
      setFormData({ ...formData, nombre: nuevoNombre, presentacion: "" })
  }

  // ----------------------------------

  const handleEdit = (insumo: any) => {
      setEditingId(insumo.id)
      setFormData({
          nombre: insumo.nombre,
          presentacion: insumo.presentacion,
          cantidadCompra: insumo.unidadMedida === 'kg' ? (insumo.stockGramos / 1000).toString() : insumo.stockGramos.toString(),
          unidadMedida: insumo.unidadMedida,
          valorCompra: (insumo.stockGramos * insumo.costoPorGramo).toFixed(0)
      })
      setIsAddOpen(true)
  }

  const handleOpenChange = (open: boolean) => {
      setIsAddOpen(open)
      if (!open) {
          setEditingId(null)
          setFormData({ nombre: "", presentacion: "", cantidadCompra: "", unidadMedida: "kg", valorCompra: "" })
      }
  }

  const handleSave = async () => {
    // Validaciones finales antes de enviar
    if (!formData.nombre || !formData.presentacion || !formData.cantidadCompra || !formData.valorCompra) {
        toast.error("Faltan datos obligatorios", { description: "Revisa el nombre, presentación, cantidad y valor." })
        return
    }

    setIsLoading(true)
    try {
        const token = localStorage.getItem("accessToken")
        const url = editingId ? `${API_URL}/insumos/${editingId}` : `${API_URL}/insumos`
        const method = editingId ? "PUT" : "POST"

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            toast.success(editingId ? "Insumo actualizado correctamente" : "Stock ingresado exitosamente")
            handleOpenChange(false)
            fetchData() 
        } else {
            const err = await res.json()
            toast.error("No se pudo guardar", { description: err.error || "Error desconocido" })
        }
    } catch (error) {
        toast.error("Error de conexión")
    } finally {
        setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if(!confirm("¿Estás seguro de borrar este insumo?")) return;
    try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`${API_URL}/insumos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        
        if (res.ok) {
            toast.success("Insumo eliminado del inventario")
            fetchData()
        } else {
            toast.error("No se pudo eliminar")
        }
    } catch (error) { toast.error("Error de conexión") }
  }

  const getStockStatus = (insumo: any) => {
      const totalCompradoGramos = insumo.unidadMedida === 'kg' 
        ? insumo.cantidadCompra * 1000 
        : insumo.cantidadCompra;
      
      if (totalCompradoGramos === 0) return <Badge variant="outline">N/A</Badge>;

      const porcentaje = (insumo.stockGramos / totalCompradoGramos) * 100;

      if (porcentaje <= 15) {
          return (
              <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 gap-1 pl-1 pr-2">
                  <AlertCircle className="h-3 w-3" /> Crítico ({Math.max(0, Math.round(porcentaje))}%)
              </Badge>
          );
      } else if (porcentaje <= 35) {
          return (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 gap-1">
                   <AlertTriangle className="h-3 w-3" /> Bajo ({Math.round(porcentaje)}%)
              </Badge>
          );
      }
      
      return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Normal ({Math.round(porcentaje)}%)
          </Badge>
      );
  }

  const filteredInsumos = insumos.filter(i => 
    i.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Opciones para el select de presentación (Depende del insumo seleccionado)
  const presentacionesDisponibles = formData.nombre ? INSUMOS_CONFIG[formData.nombre] || [] : []

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventario de Insumos</h1>
          <p className="text-muted-foreground">Gestiona tu materia prima estandarizada.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 shadow-md">
              <Plus className="mr-2 h-4 w-4" /> Registrar Compra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Modificar Insumo" : "Nuevo Ingreso de Stock"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              
              {/* SELECTOR DE NOMBRE (Insumo) */}
              <div className="space-y-2">
                <Label>Nombre del Insumo</Label>
                <Select value={formData.nombre} onValueChange={handleNombreChange}>
                    <SelectTrigger className="text-lg font-medium">
                        <SelectValue placeholder="Selecciona insumo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Generamos la lista basada en las llaves del objeto de configuración */}
                      {Object.keys(INSUMOS_CONFIG).map((nombre) => (
                          <SelectItem key={nombre} value={nombre}>{nombre}</SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* SELECTOR DE PRESENTACIÓN (Dependiente) */}
                <div className="space-y-2">
                  <Label>Presentación</Label>
                  <Select 
                    value={formData.presentacion} 
                    onValueChange={(val) => setFormData({...formData, presentacion: val})}
                    disabled={!formData.nombre} // Deshabilitado si no hay insumo seleccionado
                  >
                      <SelectTrigger>
                          <SelectValue placeholder={!formData.nombre ? "-" : "Selecciona..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {presentacionesDisponibles.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>

                {/* INPUT VALOR DE COMPRA (VALIDADO) */}
                <div className="space-y-2">
                  <Label>Valor Compra ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                    <Input 
                        type="text" 
                        inputMode="numeric"
                        placeholder="0" 
                        value={formData.valorCompra} 
                        onChange={(e) => handleValorChange(e.target.value)}
                        className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* INPUT CANTIDAD (VALIDADO) */}
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="0" 
                    value={formData.cantidadCompra} 
                    onChange={(e) => handleCantidadChange(e.target.value)} 
                  />
                </div>
                {/* SELECTOR UNIDAD */}
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Select value={formData.unidadMedida} onValueChange={(val) => setFormData({...formData, unidadMedida: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilos (kg)</SelectItem>
                      <SelectItem value="gr">Gramos (gr)</SelectItem>
                      <SelectItem value="lt">Litros (lt)</SelectItem>
                      <SelectItem value="un">Unidad (un)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.cantidadCompra && (
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-md text-sm text-center text-orange-800">
                   Stock a ingresar: <strong>
                     {formData.unidadMedida === 'kg' || formData.unidadMedida === 'lt'
                        ? (parseFloat(formData.cantidadCompra) * 1000).toLocaleString() 
                        : parseFloat(formData.cantidadCompra).toLocaleString()} {formData.unidadMedida === 'lt' ? 'ml' : 'gramos'}
                   </strong>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 w-full">
                {isLoading ? "Guardando..." : (editingId ? "Actualizar Datos" : "Confirmar Ingreso")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-lg border w-full md:w-1/3 shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input 
          placeholder="Buscar insumo..." 
          className="border-0 bg-transparent focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="shadow-md border-t-4 border-t-orange-500">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Ingrediente</TableHead>
                <TableHead>Presentación</TableHead>
                <TableHead className="text-right">Compra Total</TableHead>
                <TableHead className="text-right">Valor/gr</TableHead>
                <TableHead className="text-right">Stock Disponible</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsumos.map((insumo) => (
                <TableRow key={insumo.id} className="hover:bg-muted/20">
                  <TableCell className="font-bold text-base">{insumo.nombre}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{insumo.presentacion}</TableCell>
                  
                  <TableCell className="text-right">
                    <span className="font-medium">{insumo.cantidadCompra} {insumo.unidadMedida}</span>
                    <div className="text-xs text-muted-foreground">(${parseInt(insumo.valorCompra).toLocaleString()})</div>
                  </TableCell>
                  
                  <TableCell className="text-right font-mono text-sm text-slate-500">
                    ${insumo.costoPorGramo.toFixed(2)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="font-bold text-blue-600">
                        {(insumo.stockGramos / (insumo.unidadMedida === 'kg' ? 1000 : 1)).toFixed(2)} {insumo.unidadMedida}
                    </div>
                    <div className="text-xs text-muted-foreground">({Math.round(insumo.stockGramos).toLocaleString()} gr)</div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    {getStockStatus(insumo)}
                  </TableCell>
                  
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(insumo)} className="hover:text-blue-600 hover:bg-blue-50"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(insumo.id)} className="hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInsumos.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No hay insumos registrados en el inventario.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}