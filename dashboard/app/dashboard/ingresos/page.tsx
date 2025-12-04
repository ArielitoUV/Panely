"use client"

import { useState, useEffect } from "react"
import { DollarSign, Lock, Unlock, Calendar, TrendingUp, Save, Loader2, PlusCircle, History, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog" // Nuevo para el historial completo
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function IngresosPage() {
  const [caja, setCaja] = useState<any>(null)
  const [movimientos, setMovimientos] = useState<any[]>([]) // Solo de HOY
  const [historialCompleto, setHistorialCompleto] = useState<any[]>([]) // Historial TOTAL
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isHistorialOpen, setIsHistorialOpen] = useState(false) // Estado del modal

  const [montoInicial, setMontoInicial] = useState("")
  const [nuevoIngreso, setNuevoIngreso] = useState({
    monto: "",
    descripcion: "",
    metodo: "EFECTIVO"
  })

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    if (!token) return
    try {
      const headers = { Authorization: `Bearer ${token}` }
      
      // 1. Estado de Caja
      const resCaja = await fetch(`${API_URL}/caja/hoy`, { headers })
      if (resCaja.ok) {
        const data = await resCaja.json()
        setCaja(data)
      }

      // 2. Movimientos de HOY (Esto hace que al cambiar de día se limpie sola la tabla)
      const resMov = await fetch(`${API_URL}/finanzas/movimientos/hoy`, { headers })
      if (resMov.ok) {
          setMovimientos(await resMov.json())
      }

    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Función separada para cargar TODO el historial cuando se abre el modal
  const fetchHistorialCompleto = async () => {
      if (!token) return
      try {
          // Nota: Necesitarás crear este endpoint en backend si quieres ver días anteriores
          // Por ahora reutilizamos el de hoy o simulamos, pero idealmente sería /finanzas/movimientos/todos
          const res = await fetch(`${API_URL}/finanzas/movimientos/hoy`, { // Cambiar a /todos si lo implementas
              headers: { Authorization: `Bearer ${token}` }
          })
          if(res.ok) setHistorialCompleto(await res.json())
      } catch(e) { console.error(e) }
  }

  useEffect(() => { fetchData() }, [token])

  const formatearNumero = (valor: number | string) => Number(valor).toLocaleString("es-CL")

  // --- ACCIONES ---

  const handleAbrirCaja = async () => {
    if (!montoInicial) return toast.error("Ingresa un monto inicial")
    setIsSaving(true)
    try {
        const res = await fetch(`${API_URL}/caja/abrir`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token!}` },
            body: JSON.stringify({ montoInicial: parseInt(montoInicial) })
        })
        if(res.ok) {
            toast.success("¡Caja abierta!")
            fetchData()
        } else {
            const err = await res.json()
            toast.error(err.error || "Error al abrir")
        }
    } catch(e) { toast.error("Error de conexión") }
    finally { setIsSaving(false) }
  }

  const handleRegistrarIngreso = async () => {
      if (!nuevoIngreso.monto || !nuevoIngreso.descripcion) return toast.error("Faltan datos")
      setIsSaving(true)
      try {
          const res = await fetch(`${API_URL}/finanzas/ingreso`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token!}` },
              body: JSON.stringify(nuevoIngreso)
          })
          if(res.ok) {
              toast.success("Ingreso registrado")
              setNuevoIngreso({ monto: "", descripcion: "", metodo: "EFECTIVO" })
              fetchData()
          } else {
              toast.error("No se pudo registrar")
          }
      } catch(e) { toast.error("Error de conexión") }
      finally { setIsSaving(false) }
  }

  const handleCerrarCaja = async () => {
      if(!confirm("¿Confirmas el cierre de caja?")) return;
      setIsSaving(true)
      try {
          const res = await fetch(`${API_URL}/caja/cerrar`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token!}` }
          })
          if(res.ok) {
              toast.success("Caja cerrada")
              fetchData()
          }
      } catch(e) { toast.error("Error cerrando caja") }
      finally { setIsSaving(false) }
  }

  if (isLoading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>

  const cajaAbierta = caja?.estado === "ABIERTA"
  const calcularTotalCaja = () => (caja?.totalFinal || 0)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">Gestión de Ingresos</h1>
                <p className="text-muted-foreground">Registra tus ventas para cuadrar la caja diaria.</p>
            </div>
            <div className="flex gap-3 items-center">
                <div className="bg-muted px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString("es-CL", { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                
                {/* BOTÓN HISTORIAL COMPLETO */}
                <Dialog open={isHistorialOpen} onOpenChange={(open) => {
                    setIsHistorialOpen(open)
                    if(open) fetchHistorialCompleto() // Cargar datos solo al abrir
                }}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" /> Historial Completo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Historial General de Ingresos</DialogTitle>
                        </DialogHeader>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historialCompleto.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">No hay registros históricos.</TableCell></TableRow>
                                ) : (
                                    historialCompleto.map((mov) => (
                                        <TableRow key={mov.id}>
                                            <TableCell>{new Date(mov.fecha).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(mov.fecha).toLocaleTimeString()}</TableCell>
                                            <TableCell>{mov.descripcion}</TableCell>
                                            <TableCell>{mov.metodoPago}</TableCell>
                                            <TableCell className="text-right text-green-600 font-bold">+${formatearNumero(mov.monto)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            
            {/* 1. CONTROL DE CAJA */}
            <Card className={`h-fit border-l-4 ${cajaAbierta ? 'border-l-green-500' : 'border-l-red-500'} shadow-md`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {cajaAbierta ? <Unlock className="text-green-600"/> : <Lock className="text-red-600"/>}
                        {cajaAbierta ? "Caja Abierta" : "Caja Cerrada"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!caja && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Monto Inicial</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                    <Input type="number" placeholder="20000" className="pl-7 text-lg font-bold" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} />
                                </div>
                            </div>
                            <Button onClick={handleAbrirCaja} disabled={isSaving} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                                Iniciar Día
                            </Button>
                        </div>
                    )}

                    {cajaAbierta && (
                        <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center border border-green-200 dark:border-green-800 shadow-inner">
                                <p className="text-xs font-bold text-green-800 dark:text-green-300 mb-1 uppercase tracking-widest">Total en Caja</p>
                                <p className="text-5xl font-black text-green-700 dark:text-green-400 tracking-tighter">
                                    ${formatearNumero(calcularTotalCaja())}
                                </p>
                                <div className="mt-3 pt-3 border-t border-green-200/50 text-xs text-muted-foreground flex justify-between">
                                    <span>Inicio: ${formatearNumero(caja.montoInicial)}</span>
                                    <span>Ventas: ${formatearNumero(caja.totalFinal - caja.montoInicial)}</span>
                                </div>
                            </div>
                            <Button variant="destructive" className="w-full font-semibold" onClick={handleCerrarCaja} disabled={isSaving}>
                                Cerrar Caja y Finalizar
                            </Button>
                        </div>
                    )}

                    {caja && caja.estado === "CERRADA" && (
                        <div className="text-center py-4 bg-muted/20 rounded-lg">
                            <p className="text-muted-foreground text-sm">La jornada ha finalizado.</p>
                            <p className="font-bold text-2xl mt-2 text-foreground">Total: ${formatearNumero(caja.totalFinal)}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 2. REGISTRO DE VENTA */}
            <Card className="lg:col-span-2 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="text-blue-600" /> Registrar Ingreso
                    </CardTitle>
                    <CardDescription>
                        Ingresa ventas individuales o acumuladas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="text-base">Monto a Ingresar</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-2 text-xl text-muted-foreground">$</span>
                                <Input 
                                    type="number" placeholder="0" 
                                    className="pl-8 text-2xl font-bold h-12 text-blue-600"
                                    value={nuevoIngreso.monto}
                                    onChange={(e) => setNuevoIngreso({...nuevoIngreso, monto: e.target.value})}
                                    disabled={!cajaAbierta}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRegistrarIngreso()}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-base">Medio de Pago</Label>
                            <Select 
                                value={nuevoIngreso.metodo} 
                                onValueChange={(v) => setNuevoIngreso({...nuevoIngreso, metodo: v})}
                                disabled={!cajaAbierta}
                            >
                                <SelectTrigger className="h-12 text-lg"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EFECTIVO">💵 Efectivo</SelectItem>
                                    <SelectItem value="TARJETA">💳 Tarjeta</SelectItem>
                                    <SelectItem value="TRANSFERENCIA">📱 Transferencia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-base">Descripción</Label>
                            <Input 
                                placeholder="Ej: Venta 1kg Hallulla" 
                                value={nuevoIngreso.descripcion}
                                onChange={(e) => setNuevoIngreso({...nuevoIngreso, descripcion: e.target.value})}
                                disabled={!cajaAbierta}
                                className="h-12 text-lg"
                                onKeyDown={(e) => e.key === 'Enter' && handleRegistrarIngreso()}
                            />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Button size="lg" className="w-full md:w-1/2 h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={handleRegistrarIngreso} disabled={!cajaAbierta || isSaving}>
                            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2 h-6 w-6" />} Guardar Ingreso
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* 3. TABLA DE HISTORIAL DEL DÍA (SE LIMPIA AUTOMÁTICAMENTE MAÑANA) */}
        <Card className="border-t-4 border-t-slate-100 dark:border-t-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" /> Historial de Hoy
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px]">Hora</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead>Medio Pago</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {movimientos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                        No hay ingresos registrados hoy.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                movimientos.map((mov) => (
                                    <TableRow key={mov.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {new Date(mov.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </TableCell>
                                        <TableCell className="font-medium">{mov.descripcion}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                mov.metodoPago === 'EFECTIVO' ? 'bg-green-100 text-green-800' :
                                                mov.metodoPago === 'TARJETA' ? 'bg-blue-100 text-blue-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {mov.metodoPago}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-green-600 text-base">
                                            +${formatearNumero(mov.monto)}
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
    </div>
  )
}