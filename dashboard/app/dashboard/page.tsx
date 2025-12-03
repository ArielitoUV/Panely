"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts"

// --- CONSTANTE API ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function DashboardPage() {
  const [ingresosSemana, setIngresosSemana] = useState(0)
  const [egresosSemana, setEgresosSemana] = useState(0)
  const [ganancia, setGanancia] = useState(0)
  const [datosGrafico, setDatosGrafico] = useState<any[]>([])

  // Datos simulados para el gráfico inicial (mientras conectas la BD real de movimientos)
  const datosSimulados = [
    { name: 'Lun', ingresos: 4000, egresos: 2400 },
    { name: 'Mar', ingresos: 3000, egresos: 1398 },
    { name: 'Mié', ingresos: 2000, egresos: 9800 },
    { name: 'Jue', ingresos: 2780, egresos: 3908 },
    { name: 'Vie', ingresos: 1890, egresos: 4800 },
    { name: 'Sáb', ingresos: 2390, egresos: 3800 },
    { name: 'Dom', ingresos: 3490, egresos: 4300 },
  ];

  useEffect(() => {
    // AQUÍ HARÍAS EL FETCH REAL A TUS ENDPOINTS DE INGRESOS/EGRESOS
    // Por ahora, calculamos totales basados en la simulación para que veas el efecto visual
    
    const totalI = datosSimulados.reduce((acc, curr) => acc + curr.ingresos, 0)
    const totalE = datosSimulados.reduce((acc, curr) => acc + curr.egresos, 0)
    
    setIngresosSemana(totalI)
    setEgresosSemana(totalE)
    setGanancia(totalI - totalE)
    setDatosGrafico(datosSimulados)

    /* LÓGICA REAL (Descomentar cuando tengas los endpoints /ingresos y /egresos listos)
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken")
      const [resIng, resEgr] = await Promise.all([
         fetch(`${API_URL}/ingresos/semana`, { headers: { Authorization: `Bearer ${token}` } }),
         fetch(`${API_URL}/egresos/semana`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      // ... procesar datos ...
    }
    */
  }, [])

  // Formateador de moneda chilena
  const formatoCLP = (valor: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(valor)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Resumen Semanal</h1>
        <p className="text-muted-foreground">Visión general del rendimiento financiero de tu panadería.</p>
      </div>

      {/* 1. TRES TARJETAS DE RESUMEN */}
      <div className="grid gap-4 md:grid-cols-3">
        
        {/* Tarjeta Ingresos */}
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatoCLP(ingresosSemana)}</div>
            <p className="text-xs text-muted-foreground">Acumulado esta semana</p>
          </CardContent>
        </Card>

        {/* Tarjeta Egresos */}
        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatoCLP(egresosSemana)}</div>
            <p className="text-xs text-muted-foreground">Gastos esta semana</p>
          </CardContent>
        </Card>

        {/* Tarjeta Ganancia */}
        <Card className={`border-l-4 shadow-sm hover:shadow-md transition-all ${ganancia >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <Wallet className={`h-4 w-4 ${ganancia >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${ganancia >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatoCLP(ganancia)}
            </div>
            <p className="text-xs text-muted-foreground">Rentabilidad actual</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. SECCIÓN DE GRÁFICOS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Gráfico Principal: Balance Semanal (Barras) */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Balance de Ingresos vs Egresos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                    formatter={(value: number) => [`$${value}`, '']}
                  />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Secundario: Tendencia de Ganancias (Área) */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Tendencia de Ganancias</CardTitle>
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
                        return [`$${gananciaDia}`, 'Ganancia'];
                     }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={(data) => data.ingresos - data.egresos} 
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