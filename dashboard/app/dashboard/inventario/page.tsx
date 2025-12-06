"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Package, Edit, Save, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function InventarioPage() {
  const { toast } = useToast()
  
  const [insumos, setInsumos] = useState<any[]>([])
  const [tiposInsumo, setTiposInsumo] = useState<any[]>([]) 
  const [tiposPresentacion, setTiposPresentacion] = useState<any[]>([]) 
  
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

  const fetchData = async () => {
    try {
        const token = localStorage.getItem("accessToken")
        const headers = { Authorization: `Bearer ${token}` }
        
        const [resInsumos, resTipos, resPresentaciones] = await Promise.all([
            fetch(`${API_URL}/insumos`, { headers }),
            fetch(`${API_URL}/insumos/tipos`, { headers }),
            fetch(`${API_URL}/insumos/presentaciones`, { headers })
        ])

        if (resInsumos.ok) setInsumos(await resInsumos.json())
        if (resTipos.ok) setTiposInsumo(await resTipos.json())
        if (resPresentaciones.ok) setTiposPresentacion(await resPresentaciones.json())

    } catch (error) {
        console.error("Error cargando datos", error)
    }
  }

  useEffect(() => { fetchData() }, [])

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
    if (!formData.nombre || !formData.cantidadCompra || !formData.valorCompra) {
        toast({ title: "Error", description: "Completa los campos obligatorios", variant: "destructive" })
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
            toast({ title: "Éxito", description: editingId ? "Insumo actualizado" : "Stock ingresado correctamente" })
            handleOpenChange(false)
            fetchData() 
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
    if(!confirm("¿Estás seguro de borrar este insumo?")) return;
    try {
        const token = localStorage.getItem("accessToken")
        await fetch(`${API_URL}/insumos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        fetchData()
        toast({ title: "Eliminado", description: "Registro borrado" })
    } catch (error) { console.error(error) }
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventario de Insumos</h1>
          <p className="text-muted-foreground">Gestiona tu materia prima estandarizada.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" /> Registrar Compra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modificar Insumo" : "Nuevo Ingreso de Stock"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              
              <div className="space-y-2">
                <Label>Nombre del Insumo</Label>
                <Select value={formData.nombre} onValueChange={(val) => setFormData({...formData, nombre: val})}>
                    <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      {tiposInsumo.map((t:any) => <SelectItem key={t.id} value={t.nombre}>{t.nombre}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Presentación</Label>
                  <Select value={formData.presentacion} onValueChange={(val) => setFormData({...formData, presentacion: val})}>
                      <SelectTrigger><SelectValue placeholder="Tipo..." /></SelectTrigger>
                      <SelectContent>
                        {tiposPresentacion.map((t:any) => <SelectItem key={t.id} value={t.nombre}>{t.nombre}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor Compra ($)</Label>
                  <Input type="number" placeholder="0" value={formData.valorCompra} onChange={(e) => setFormData({...formData, valorCompra: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input type="number" placeholder="0" value={formData.cantidadCompra} onChange={(e) => setFormData({...formData, cantidadCompra: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Select value={formData.unidadMedida} onValueChange={(val) => setFormData({...formData, unidadMedida: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilos (kg)</SelectItem>
                      <SelectItem value="gr">Gramos (gr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {formData.cantidadCompra && (
                <div className="bg-muted p-3 rounded-md text-sm text-center">
                   Se guardará como stock: <strong>
                     {formData.unidadMedida === 'kg' || formData.unidadMedida === 'lt'
                        ? (parseFloat(formData.cantidadCompra) * 1000).toLocaleString() 
                        : parseFloat(formData.cantidadCompra).toLocaleString()} {formData.unidadMedida === 'lt' ? 'ml' : 'gramos'}
                   </strong>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave} disabled={isLoading} className="bg-orange-600">
                {isLoading ? "Guardando..." : (editingId ? "Actualizar Datos" : "Confirmar Ingreso")}
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
                <TableRow key={insumo.id}>
                  <TableCell className="font-bold text-base">{insumo.nombre}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{insumo.presentacion}</TableCell>
                  
                  <TableCell className="text-right">
                    <span className="font-medium">{insumo.cantidadCompra} {insumo.unidadMedida}</span>
                    <div className="text-xs text-muted-foreground">(${insumo.valorCompra.toLocaleString()})</div>
                  </TableCell>
                  
                  <TableCell className="text-right font-mono text-sm">
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
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(insumo)}><Edit className="h-4 w-4 text-blue-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(insumo.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInsumos.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay insumos registrados.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}