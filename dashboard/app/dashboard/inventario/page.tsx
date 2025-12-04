"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Trash2, Package, Edit, Save } from "lucide-react" // Edit icon added
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function InventarioPage() {
  const { toast } = useToast()
  
  // Datos
  const [insumos, setInsumos] = useState<any[]>([])
  const [tiposInsumo, setTiposInsumo] = useState<any[]>([]) 
  const [tiposPresentacion, setTiposPresentacion] = useState<any[]>([]) // Nueva lista
  
  // Estados UI
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null) // ID para saber si editamos

  const [formData, setFormData] = useState({
    nombre: "",
    presentacion: "",
    cantidadCompra: "",
    unidadMedida: "kg",
    valorCompra: "",
  })

  // Cargar datos iniciales
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

  useEffect(() => {
    fetchData()
  }, [])

  // Preparar formulario para editar
  const handleEdit = (insumo: any) => {
      setEditingId(insumo.id)
      setFormData({
          nombre: insumo.nombre,
          presentacion: insumo.presentacion,
          cantidadCompra: insumo.cantidadCompra.toString(),
          unidadMedida: insumo.unidadMedida,
          valorCompra: insumo.valorCompra.toString()
      })
      setIsAddOpen(true)
  }

  // Resetear al cerrar o abrir nuevo
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
        
        // Determinar URL y Método (POST o PUT)
        const url = editingId ? `${API_URL}/insumos/${editingId}` : `${API_URL}/insumos`
        const method = editingId ? "PUT" : "POST"

        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        })

        if (res.ok) {
            toast({ title: "Éxito", description: editingId ? "Insumo actualizado" : "Insumo guardado" })
            handleOpenChange(false) // Cierra y limpia
            fetchData() // Recargar tabla
        } else {
            toast({ title: "Error", description: "No se pudo guardar el insumo", variant: "destructive" })
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
        toast({ title: "Eliminado", description: "El insumo ha sido borrado" })
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
          <p className="text-muted-foreground">Gestiona tu materia prima estandarizada.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" /> Agregar Insumo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Modificar Insumo" : "Nuevo Ingreso de Stock"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              
              {/* SELECTOR DE TIPO NORMALIZADO */}
              <div className="space-y-2">
                <Label>Nombre del Insumo</Label>
                <Select 
                    value={formData.nombre} 
                    onValueChange={(val) => setFormData({...formData, nombre: val})}
                >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el ingrediente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposInsumo.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.nombre}>
                              {tipo.nombre}
                          </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>

              {/* SELECTOR DE PRESENTACIÓN NORMALIZADA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Presentación</Label>
                  <Select 
                      value={formData.presentacion} 
                      onValueChange={(val) => setFormData({...formData, presentacion: val})}
                  >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de envase" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposPresentacion.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.nombre}>
                                {tipo.nombre}
                            </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
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
                  <Label>Cantidad Comprada</Label>
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
                {editingId ? <><Save className="mr-2 h-4 w-4"/> Actualizar</> : "Guardar en Inventario"}
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
                <TableHead className="text-right">Stock Real</TableHead>
                <TableHead className="text-right">Costo Base</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInsumos.map((insumo) => (
                <TableRow key={insumo.id}>
                  <TableCell className="font-bold text-base">{insumo.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {insumo.presentacion} ({insumo.cantidadCompra} {insumo.unidadMedida})
                  </TableCell>
                  <TableCell className="text-right font-mono text-blue-600">
                    {insumo.stockGramos.toLocaleString()} {insumo.unidadMedida === 'lt' ? 'ml' : 'gr'}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    ${insumo.costoPorGramo.toFixed(2)} / {insumo.unidadMedida === 'lt' ? 'ml' : 'gr'}
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(insumo)}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(insumo.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInsumos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay insumos registrados. Agrega uno arriba.
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