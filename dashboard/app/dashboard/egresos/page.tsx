"use client"

import { useState, useEffect } from "react"
import { TrendingDown, ShoppingCart, Loader2, Plus, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner" // <--- CAMBIO: Usamos Sonner para que la alerta sea igual a Ingresos
import { useApp } from "@/context/app-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function EgresosPage() {
  const { addNotification } = useApp()

  const [egresos, setEgresos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para nuevo gasto
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [nuevoGasto, setNuevoGasto] = useState({ 
      monto: "", 
      descripcion: "", 
      categoria: "GASTO_GENERAL" 
  })

  const fetchData = async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/finanzas/egresos`, {
          headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
          setEgresos(await res.json())
      }
    } catch (error) {
      console.error("Error cargando egresos", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // --- FUNCIONES DE VALIDACIÓN CON ALERTAS (Idéntico a Ingresos) ---

  const handleMontoChange = (valor: string) => {
    // 1. Alerta si ingresa letras
    if (/\D/.test(valor)) {
        toast.warning("Solo se permiten números", { duration: 2000 })
    }

    // 2. Limpiar
    const soloNumeros = valor.replace(/\D/g, "")

    // 3. Alerta si excede longitud
    if (soloNumeros.length > 10) {
        toast.warning("Máximo 10 dígitos permitidos", { duration: 2000 })
        setNuevoGasto({ ...nuevoGasto, monto: soloNumeros.slice(0, 10) })
    } else {
        setNuevoGasto({ ...nuevoGasto, monto: soloNumeros })
    }
  }

  const handleDescripcionChange = (valor: string) => {
    const regexValido = /^[a-zA-Z0-9\s]*$/

    // 1. Alerta caracteres especiales
    if (!regexValido.test(valor)) {
        toast.warning("No uses caracteres especiales", { duration: 2000 })
    }

    const sinCaracteresEspeciales = valor.replace(/[^a-zA-Z0-9\s]/g, "")

    // 2. Alerta longitud
    if (sinCaracteresEspeciales.length > 25) {
        toast.warning("Descripción muy larga (Máx 25)", { duration: 2000 })
        setNuevoGasto({ ...nuevoGasto, descripcion: sinCaracteresEspeciales.slice(0, 25) })
    } else {
        setNuevoGasto({ ...nuevoGasto, descripcion: sinCaracteresEspeciales })
    }
  }
  // -----------------------------------------------

  const handleRegistrarGasto = async () => {
    if (!nuevoGasto.monto || !nuevoGasto.descripcion) {
        toast.error("Por favor completa los campos obligatorios")
        return
    }

    setIsSaving(true)
    const token = localStorage.getItem("accessToken")
    try {
        const res = await fetch(`${API_URL}/finanzas/egreso`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(nuevoGasto)
        })

        if (res.ok) {
            // Alerta visual idéntica a Ingresos
            toast.success("Gasto registrado exitosamente")
            addNotification("Nuevo Gasto", `${nuevoGasto.descripcion}: -$${nuevoGasto.monto}`, "warning")
            
            setNuevoGasto({ monto: "", descripcion: "", categoria: "GASTO_GENERAL" })
            setIsDialogOpen(false)
            fetchData() 
        } else {
            const err = await res.json()
            toast.error(err.error || "No se pudo guardar el gasto")
        }
    } catch (e) {
        toast.error("Error de conexión al guardar")
    } finally {
        setIsSaving(false)
    }
  }

  const totalEgresos = egresos.reduce((sum, e) => sum + e.monto, 0)

  const getCategoriaLabel = (cat: string) => {
      switch(cat) {
          case 'COMPRA_INSUMO': return 'Compra Insumo';
          case 'SERVICIOS': return 'Servicios (Luz/Agua)';
          case 'MANTENIMIENTO': return 'Mantenimiento';
          case 'TRANSPORTE': return 'Transporte/Flete';
          case 'SUELDOS': return 'Pago Personal';
          default: return 'Gasto General';
      }
  }
  
  const getCategoriaBadgeColor = (cat: string) => {
      if (cat === 'COMPRA_INSUMO') return 'bg-blue-50 text-blue-700 border-blue-200';
      if (cat === 'SERVICIOS') return 'bg-orange-50 text-orange-700 border-orange-200';
      if (cat === 'SUELDOS') return 'bg-purple-50 text-purple-700 border-purple-200';
      return 'bg-red-50 text-red-700 border-red-200';
  }

  if (isLoading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* HEADER Y BOTÓN DE ACCIÓN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingDown className="h-8 w-8 text-red-500" />
            Control de Egresos
          </h1>
          <p className="text-muted-foreground">Historial de compras de insumos y gastos operativos.</p>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto">
             {/* TARJETA DE TOTAL */}
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 shadow-sm flex-1 md:flex-none">
                <CardContent className="p-3 px-6 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">Total Gastos</p>
                        <p className="text-xl font-black text-red-700 dark:text-red-400">${totalEgresos.toLocaleString("es-CL")}</p>
                    </div>
                </CardContent>
            </Card>

            {/* BOTÓN REGISTRAR GASTO MANUAL */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 h-14 px-6 text-lg shadow-md gap-2">
                        <Plus className="h-5 w-5" /> Registrar Gasto
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Gasto Manual</DialogTitle>
                        <DialogDescription>Gastos hormiga, servicios o emergencias (Descuenta de Caja).</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select 
                                value={nuevoGasto.categoria} 
                                onValueChange={(v) => setNuevoGasto({...nuevoGasto, categoria: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GASTO_GENERAL">Gasto General / Hormiga</SelectItem>
                                    <SelectItem value="SERVICIOS">Servicios (Luz, Agua, Gas)</SelectItem>
                                    <SelectItem value="MANTENIMIENTO">Mantenimiento / Reparaciones</SelectItem>
                                    <SelectItem value="TRANSPORTE">Transporte / Fletes</SelectItem>
                                    <SelectItem value="SUELDOS">Pago Personal / Anticipos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Monto ($)</Label>
                            <Input 
                                type="text" 
                                inputMode="numeric"
                                placeholder="0" 
                                value={nuevoGasto.monto}
                                onChange={(e) => handleMontoChange(e.target.value)}
                                className="text-lg font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input 
                                placeholder="Ej: Pago flete, Compra bolsas, Gas..." 
                                value={nuevoGasto.descripcion}
                                onChange={(e) => handleDescripcionChange(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button className="bg-red-600 hover:bg-red-700" onClick={handleRegistrarGasto} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Confirmar Egreso
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card className="border-t-4 border-t-red-500">
        <CardHeader>
            <CardTitle>Historial de Movimientos</CardTitle>
            <CardDescription>Listado automático de compras y gastos manuales.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {egresos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <ShoppingCart className="h-10 w-10 opacity-20" />
                                        <p>No hay egresos registrados aún.</p>
                                        <p className="text-xs">Las compras de insumos aparecerán aquí automáticamente.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            egresos.map((egreso) => (
                                <TableRow key={egreso.id} className="hover:bg-red-50/30 transition-colors">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {new Date(egreso.fecha).toLocaleDateString()} {new Date(egreso.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </TableCell>
                                    <TableCell className="font-medium">{egreso.descripcion}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`font-normal ${getCategoriaBadgeColor(egreso.categoria)}`}>
                                            {getCategoriaLabel(egreso.categoria)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-red-600">
                                        -${egreso.monto.toLocaleString("es-CL")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}