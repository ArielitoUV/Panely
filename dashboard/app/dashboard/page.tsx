"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, Wallet, Store, Unlock, RefreshCcw } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { useToast } from "@/components/ui/use-toast"
import { useApp } from "@/context/app-context" // Para actualizar estado global de caja

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function DashboardPage() {
  const { toast } = useToast()
  const { refreshCajaStatus } = useApp() // Usamos contexto global
  
  // Estados de Finanzas (Datos Reales)
  const [ingresosSemana, setIngresosSemana] = useState(0)
  const [egresosSemana, setEgresosSemana] = useState(0)
  const [ganancia, setGanancia] = useState(0)
  const [datosGrafico, setDatosGrafico] = useState<any[]>([])

  // Estados de Caja
  const [caja, setCaja] = useState<any>(null)
  const [montoInicial, setMontoInicial] = useState("")
  const [isAbrirCajaOpen, setIsAbrirCajaOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // --- CARGA DE DATOS (Función Maestra) ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return

      const headers = { Authorization: `Bearer ${token}` }

      // 1. Cargar Datos Financieros (Endpoint Optimizado)
      const resDash = await fetch(`${API_URL}/finanzas/dashboard`, { headers })
      if (resDash.ok) {
          const data = await resDash.json()
          setIngresosSemana(data.ingresosSemana)
          setEgresosSemana(data.egresosSemana)
          setGanancia(data.ganancia)
          setDatosGrafico(data.grafico)
      }

      // 2. Cargar Estado de Caja
      const resCaja = await fetch(`${API_URL}/caja/hoy`, { headers }) 
      if (resCaja.ok) {
          const dataCaja = await resCaja.json()
          setCaja(dataCaja) 
      }

      setLastUpdated(new Date())

    } catch (error) {
      console.error("Error actualizando dashboard", error)
    }
  }

  // --- TIEMPO REAL (POLLING) ---
  useEffect(() => {
    fetchData() // Carga inicial

    // Refrescar automáticamente cada 5 segundos para simular tiempo real
    const intervalId = setInterval(() => {
        fetchData()
    }, 5000)

    return () => clearInterval(intervalId) // Limpieza al salir
  }, [])


  // --- ACCIONES DE CAJA ---
  const handleAbrirCaja = async () => {
    if (!montoInicial) {
        toast({ title: "Error", description: "Ingresa un monto inicial", variant: "destructive" })
        return
    }
    setIsLoading(true)
    try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`${API_URL}/caja/abrir`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ montoInicial: parseInt(montoInicial) })
        })
        if (res.ok) {
            toast({ title: "¡Caja Abierta!", description: "Listo para operar." })
            setIsAbrirCajaOpen(false)
            refreshCajaStatus() // Actualizar contexto global
            fetchData() 
        }
    } catch (e) {
        toast({ title: "Error", description: "No se pudo abrir", variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const handleCerrarCaja = async () => {
    if(!confirm("¿Cerrar caja por hoy?")) return;
    try {
        const token = localStorage.getItem("accessToken")
        const res = await fetch(`${API_URL}/caja/cerrar`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
            toast({ title: "Caja Cerrada", description: "Turno finalizado." })
            refreshCajaStatus() // Actualizar contexto global
            fetchData()
        }
    } catch (e) { console.error(e) }
  }

  const formatoCLP = (valor: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor)
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <p>Resumen de operaciones.</p>
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                    <RefreshCcw className="h-3 w-3 animate-spin" /> Actualizando en vivo
                </span>
            </div>
        </div>

        {/* CONTROL CAJA */}
        <div className="flex items-center gap-4">
            {caja && caja.estado === "ABIERTA" ? (
                <Card className="border-green-500 border bg-green-50 dark:bg-green-900/20 flex items-center p-2 gap-4 pr-4 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-700 dark:text-green-100">
                        <Unlock className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase">Caja Abierta</p>
                        <p className="text-sm font-medium">{formatoCLP(caja.totalFinal)}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={handleCerrarCaja}>Cerrar</Button>
                </Card>
            ) : (
                <Dialog open={isAbrirCajaOpen} onOpenChange={setIsAbrirCajaOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md">
                            <Store className="h-5 w-5" /> Abrir Caja
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apertura de Caja</DialogTitle>
                            <DialogDescription>Dinero base para iniciar el día.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label>Monto Inicial</Label>
                            <Input type="number" placeholder="20000" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} className="text-lg mt-2 font-bold" />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAbrirCaja} disabled={isLoading}>{isLoading ? "..." : "Abrir"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
      </div>

      {/* 1. TARJETAS KPI (DATOS REALES) */}
      <div className="grid gap-4 md:grid-cols-3">
        
        {/* INGRESOS */}
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Semanales</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatoCLP(ingresosSemana)}</div>
            <p className="text-xs text-muted-foreground">Ventas acumuladas esta semana</p>
          </CardContent>
        </Card>

        {/* EGRESOS */}
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Egresos Semanales</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatoCLP(egresosSemana)}</div>
            <p className="text-xs text-muted-foreground">Compras y gastos operativos</p>
          </CardContent>
        </Card>

        {/* GANANCIA NETA (LA QUE PEDISTE) */}
        <Card className={`border-l-4 shadow-sm hover:shadow-md transition-all ${ganancia >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ganancia Neta</CardTitle>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${ganancia >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${ganancia >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatoCLP(ganancia)}
            </div>
            <p className="text-xs text-muted-foreground">
                {ganancia >= 0 ? "Rentabilidad positiva" : "Atención: Gastos superan ventas"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. GRÁFICOS REALES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* GRÁFICO BARRAS */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Flujo de Caja Diario</CardTitle>
            <CardDescription>Comparativa Ingresos vs Egresos (Semana Actual)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    formatter={(value: number) => [formatoCLP(value), '']}
                  />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* GRÁFICO ÁREA (TENDENCIA) */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Tendencia de Ganancias</CardTitle>
            <CardDescription>Evolución diaria de la rentabilidad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosGrafico}>
                  <defs>
                    <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                     formatter={(value: any, name: any, props: any) => {
                        const gananciaDia = props.payload.ingresos - props.payload.egresos;
                        return [formatoCLP(gananciaDia), 'Ganancia'];
                     }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={(d) => d.ingresos - d.egresos} 
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