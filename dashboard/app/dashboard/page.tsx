"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const stats = [
  {
    title: "Ingresos Hoy",
    value: "$12,450.00",
    change: "+15.3%",
    trend: "up",
    icon: TrendingUp,
    description: "vs ayer",
  },
  {
    title: "Egresos Hoy",
    value: "$4,230.00",
    change: "+8.2%",
    trend: "up",
    icon: TrendingDown,
    description: "vs ayer",
  },
  {
    title: "Ganancias",
    value: "$8,220.00",
    change: "+22.5%",
    trend: "up",
    icon: DollarSign,
    description: "hoy",
  },
  {
    title: "Insumos Bajos",
    value: "12",
    change: "+3",
    trend: "down",
    icon: AlertTriangle,
    description: "requieren atención",
  },
]

const ultimosIngresos = [
  {
    id: "ING-001",
    fecha: "2024-01-15",
    hora: "14:30",
    concepto: "Venta de productos",
    categoria: "Ventas",
    monto: "$2,450.00",
    cliente: "Juan Pérez",
    metodo: "Efectivo",
  },
  {
    id: "ING-002",
    fecha: "2024-01-15",
    hora: "13:15",
    concepto: "Servicio de consultoría",
    categoria: "Servicios",
    monto: "$5,000.00",
    cliente: "María García",
    metodo: "Transferencia",
  },
  {
    id: "ING-003",
    fecha: "2024-01-15",
    hora: "11:45",
    concepto: "Venta de productos",
    categoria: "Ventas",
    monto: "$1,200.00",
    cliente: "Carlos López",
    metodo: "Tarjeta",
  },
  {
    id: "ING-004",
    fecha: "2024-01-15",
    hora: "10:20",
    concepto: "Pago de factura",
    categoria: "Cobros",
    monto: "$3,800.00",
    cliente: "Ana Martínez",
    metodo: "Transferencia",
  },
  {
    id: "ING-005",
    fecha: "2024-01-14",
    hora: "16:50",
    concepto: "Venta de productos",
    categoria: "Ventas",
    monto: "$890.00",
    cliente: "Pedro Sánchez",
    metodo: "Efectivo",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">Inicio</h1>
        <p className="text-sm sm:text-base text-muted-foreground text-pretty">Resumen de tu negocio hoy</p>
      </div>

      {/* estadisticas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <Badge variant={stat.trend === "up" ? "default" : "destructive"} className="gap-1 px-1.5 h-5 shrink-0">
                  {stat.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </Badge>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabla de Últimos Ingresos Registrados */}
      <Card>
        <CardHeader>
          <div className="flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">Últimos Ingresos Registrados</CardTitle>
              <CardDescription className="text-sm">Historial reciente de ingresos</CardDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {ultimosIngresos.length} registros
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">ID</TableHead>
                  <TableHead className="whitespace-nowrap">Fecha</TableHead>
                  <TableHead className="whitespace-nowrap">Hora</TableHead>
                  <TableHead className="whitespace-nowrap">Concepto</TableHead>
                  <TableHead className="whitespace-nowrap">Categoría</TableHead>
                  <TableHead className="whitespace-nowrap">Cliente</TableHead>
                  <TableHead className="whitespace-nowrap">Método</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ultimosIngresos.map((ingreso) => (
                  <TableRow key={ingreso.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium whitespace-nowrap">{ingreso.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{ingreso.fecha}</TableCell>
                    <TableCell className="whitespace-nowrap">{ingreso.hora}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{ingreso.concepto}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {ingreso.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{ingreso.cliente}</TableCell>
                    <TableCell className="whitespace-nowrap">{ingreso.metodo}</TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap text-primary">
                      {ingreso.monto}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
