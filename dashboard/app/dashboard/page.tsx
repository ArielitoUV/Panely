"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, Wallet, Store, Unlock, RefreshCcw, Loader2 } from "lucide-react"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from "recharts"
// CAMBIO 1: Importamos Sonner para alertas consistentes
import { toast } from "sonner" 
import { useApp } from "@/context/app-context"
import { Label } from "@/components/ui/label"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function DashboardPage() {
  const { refreshCajaStatus } = useApp()
  
  const [ingresosSemana, setIngresosSemana] = useState(0)
  const [egresosSemana, setEgresosSemana] = useState(0)
  const [ganancia, setGanancia] = useState(0)
  const [datosGrafico, setDatosGrafico] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  const [caja, setCaja] = useState<any>(null)
  const [montoInicial, setMontoInicial] = useState("")
  const [isAbrirCajaOpen, setIsAbrirCajaOpen] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // --- VALIDACIÓN NORMALIZADA (Igual que en otros módulos) ---
  const handleMontoChange = (valor: string) => {
      // 1. Alerta si ingresa letras
      if (/\D/.test(valor)) {
          toast.warning("Solo se permiten números", { duration: 2000 })
      }
      const soloNumeros = valor.replace(/\D/g, "")

      // 2. Alerta y bloqueo si pasa de 10 dígitos
      if (soloNumeros.length > 10) {
          toast.warning("El monto inicial no puede exceder 10 dígitos", { duration: 2000 })
          setMontoInicial(soloNumeros.slice(0, 10))
      } else {
          setMontoInicial(soloNumeros)
      }
  }
  // ---------------------------------------------------------

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return

      const headers = { Authorization: `Bearer ${token}` }

      const resDash = await fetch(`${API_URL}/finanzas/dashboard`, { headers })
      if (resDash.ok) {
          const data = await resDash.json()
          setIngresosSemana(data.ingresosSemana)
          setEgresosSemana(data.egresosSemana)
          setGanancia(data.ganancia)
          setDatosGrafico(data.grafico)
      }

      const resCaja = await fetch(`${API_URL}/caja/hoy`, { headers }) 
      if (resCaja.ok) {
          const dataCaja = await resCaja.json()
          setCaja(dataCaja) 
      }
    } catch (error) { console.error("Error dashboard", error) } 
    finally { setIsDataLoading(false) }
  }, [])

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(() => fetchData(), 2000) 
    return () => clearInterval(intervalId) 
  }, [fetchData])

  const handleAbrirCaja = async () => {
    if (!montoInicial) {
        toast.error("Debes ingresar un monto inicial para abrir la caja")
        return
    }
    
    setIsActionLoading(true)
    try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`${API_URL}/caja/abrir`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ montoInicial: parseInt(montoInicial) })
        })
        if (res.ok) {
            toast.success("Caja abierta correctamente")
            setIsAbrirCajaOpen(false)
            refreshCajaStatus() 
            fetchData() 
        } else {
            const err = await res.json()
            toast.error(err.error || "Error al abrir caja")
        }
    } catch (e) { toast.error("Error de conexión") } 
    finally { setIsActionLoading(false) }
  }

  const handleCerrarCaja = async () => {
    if(!confirm("¿Estás seguro de cerrar la caja y finalizar el turno?")) return;
    
    setIsActionLoading(true)
    try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`${API_URL}/caja/cerrar`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            toast.success("Caja cerrada. Jornada finalizada.")
            refreshCajaStatus()
            fetchData()
        } else {
            toast.error("No se pudo cerrar la caja")
        }
    } catch (e) { console.error(e) }
    finally { setIsActionLoading(false) }
  }

  const formatoCLP = (v: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(v)

  if (isDataLoading && !datosGrafico.length) return <div className="flex h-screen justify-center items-center"><Loader2 className="animate-spin"/></div>

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCcw className="h-3 w-3 animate-spin" /> En vivo
            </div>
        </div>
        <div>
            {caja && caja.estado === "ABIERTA" ? (
                <Card className="border-green-500 bg-green-50 flex items-center p-2 gap-4 pr-4">
                    <div className="h-8 w-8 rounded-full bg-green-200 flex items-center justify-center text-green-700"><Unlock className="h-4 w-4" /></div>
                    <div><p className="text-xs font-bold text-green-700 uppercase">Caja Abierta</p><p className="text-sm font-bold">{formatoCLP(caja.totalFinal)}</p></div>
                    <Button size="sm" variant="destructive" onClick={handleCerrarCaja} disabled={isActionLoading}>Cerrar</Button>
                </Card>
            ) : (
                <Dialog open={isAbrirCajaOpen} onOpenChange={setIsAbrirCajaOpen}>
                    <DialogTrigger asChild><Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700"><Store className="h-5 w-5" /> Abrir Caja</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Apertura de Caja</DialogTitle><DialogDescription>Ingresa el dinero base para iniciar el turno.</DialogDescription></DialogHeader>
                        
                        {/* INPUT CON VALIDACIÓN DE NORMALIZACIÓN */}
                        <div className="space-y-2">
                            <Label>Monto Inicial ($)</Label>
                            <Input 
                                type="text" 
                                inputMode="numeric"
                                placeholder="Ej: 20000" 
                                value={montoInicial} 
                                onChange={(e) => handleMontoChange(e.target.value)} 
                                className="text-lg font-bold" 
                            />
                        </div>

                        <DialogFooter><Button onClick={handleAbrirCaja} disabled={isActionLoading}>Abrir Caja</Button></DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle><TrendingUp className="h-4 w-4 text-green-600" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{formatoCLP(ingresosSemana)}</div><p className="text-xs text-muted-foreground">Esta semana</p></CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Egresos</CardTitle><TrendingDown className="h-4 w-4 text-red-600" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{formatoCLP(egresosSemana)}</div><p className="text-xs text-muted-foreground">Esta semana</p></CardContent>
        </Card>
        <Card className={`border-l-4 shadow-sm ${ganancia >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ganancia</CardTitle><Wallet className="h-4 w-4" /></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${ganancia >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatoCLP(ganancia)}</div><p className="text-xs text-muted-foreground">Utilidad real</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader><CardTitle>Flujo Diario</CardTitle></CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={datosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v:number)=>[formatoCLP(v), '']} />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm">
          <CardHeader><CardTitle>Rentabilidad</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <AreaChart data={datosGrafico}>
                  <defs>
                    <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" />
                  <Tooltip formatter={(v:any,n:any,p:any)=>[formatoCLP(p.payload.ingresos-p.payload.egresos), '']} />
                  <Legend verticalAlign="top" height={36} />
                  <Area 
                    type="monotone" 
                    dataKey={(d)=>d.ingresos-d.egresos} 
                    name="Ganancia Neta" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorGanancia)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}