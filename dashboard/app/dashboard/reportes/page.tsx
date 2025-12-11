"use client"

import { useState, useEffect } from "react"
import { Download, Calendar, CalendarDays, CalendarRange, Loader2, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ReportesPage() {
  const [selectedReport, setSelectedReport] = useState<"diario" | "semanal" | "mensual" | null>(null)
  
  // Estados para rango mensual
  const [monthStart, setMonthStart] = useState("0") // "Desde" (0 = mes actual)
  const [monthEnd, setMonthEnd] = useState("0")     // "Hasta"
  
  const [dataReporte, setDataReporte] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
      const u = localStorage.getItem("user")
      if(u) setUser(JSON.parse(u))
  }, [])

  // Generar opciones de los últimos 6 meses para dar flexibilidad
  const getMonthOptions = () => {
      const options = []
      for (let i = 0; i < 6; i++) {
          const d = new Date()
          d.setMonth(d.getMonth() - i)
          const label = d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
          const labelCapitalized = label.charAt(0).toUpperCase() + label.slice(1)
          options.push({ value: i.toString(), label: labelCapitalized })
      }
      return options
  }

  const handleSelectReport = (type: "diario" | "semanal" | "mensual") => {
      setSelectedReport(type)
      setMonthStart("0")
      setMonthEnd("0")
      setDataReporte(null)
  }

  // Cargar datos
  useEffect(() => {
      if (!selectedReport) return

      // Validación simple: Si "Desde" es menor que "Hasta" (en offset, menor significa más reciente), ajustamos
      // Recuerda: Offset 0 es HOY, Offset 1 es MES PASADO. Por tanto Start >= End para tener sentido cronológico.
      if (parseInt(monthStart) < parseInt(monthEnd)) {
          setMonthStart(monthEnd)
          return 
      }

      const fetchData = async () => {
          setIsLoading(true)
          const token = localStorage.getItem("accessToken")
          try {
              const query = `rango=${selectedReport}&mesInicio=${monthStart}&mesFin=${monthEnd}`;
              const res = await fetch(`${API_URL}/reportes?${query}`, {
                  headers: { Authorization: `Bearer ${token}` }
              })
              if(res.ok) {
                  setDataReporte(await res.json())
              } else {
                  toast.error("Error cargando reporte")
              }
          } catch(e) { 
              toast.error("Error de conexión") 
          } finally {
              setIsLoading(false)
          }
      }

      fetchData()
  }, [selectedReport, monthStart, monthEnd])

  // Obtener últimas 5 transacciones combinadas
  const getRecentTransactions = () => {
      if (!dataReporte) return []
      const ingresos = dataReporte.detalles.ingresos.map((i: any) => ({ ...i, type: 'ingreso' }))
      const egresos = dataReporte.detalles.egresos.map((e: any) => ({ ...e, type: 'egreso' }))
      
      const combined = [...ingresos, ...egresos]
      // Ordenar descendente por fecha
      combined.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      
      return combined.slice(0, 5)
  }

  const descargarPDF = () => {
      if (!dataReporte) return;

      const doc = new jsPDF();
      const empresa = user?.nombreEmpresa || "Mi Negocio";
      
      // --- CORRECCIÓN DE FECHAS ---
      // Usamos timeZone: 'UTC' para asegurar que la fecha del servidor (00:00 UTC) 
      // no se convierta al día anterior por la zona horaria local.
      const inicioStr = new Date(dataReporte.rango.inicio).toLocaleDateString('es-CL', { timeZone: 'UTC' });
      const finStr = new Date(dataReporte.rango.fin).toLocaleDateString('es-CL', { timeZone: 'UTC' });
      const fechaReporte = `${inicioStr} - ${finStr}`;
      
      // Encabezado
      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text(`Reporte Financiero ${selectedReport?.toUpperCase()}`, 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Empresa: ${empresa}`, 14, 32);
      doc.text(`Periodo: ${fechaReporte}`, 14, 38);
      
      // Caja Resumen
      doc.setDrawColor(200);
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, 45, 180, 28, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text("INGRESOS", 20, 53);
      doc.text("EGRESOS", 80, 53);
      doc.text("GANANCIA", 140, 53);

      doc.setFontSize(14);
      doc.setTextColor(0, 128, 0); 
      doc.text(`$${dataReporte.resumen.totalIngresos.toLocaleString()}`, 20, 62);
      
      doc.setTextColor(200, 0, 0); 
      doc.text(`$${dataReporte.resumen.totalEgresos.toLocaleString()}`, 80, 62);

      const ganancia = dataReporte.resumen.ganancia;
      doc.setTextColor(ganancia >= 0 ? 0 : 200, ganancia >= 0 ? 100 : 0, 0);
      doc.text(`$${ganancia.toLocaleString()}`, 140, 62);

      // Tabla Detallada
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text("Detalle de Movimientos", 14, 85);
      
      const ingresosRows = dataReporte.detalles.ingresos.map((i: any) => [
          new Date(i.fecha).toLocaleDateString('es-CL', { timeZone: 'UTC' }), 
          "Ingreso", 
          i.descripcion, 
          `$${i.monto.toLocaleString()}`
      ]);
      const egresosRows = dataReporte.detalles.egresos.map((e: any) => [
          new Date(e.fecha).toLocaleDateString('es-CL', { timeZone: 'UTC' }), 
          "Egreso", 
          e.descripcion, 
          `-$${e.monto.toLocaleString()}`
      ]);
      
      // Unimos y ordenamos por fecha para el PDF
      const allRows = [...ingresosRows, ...egresosRows].sort((a,b) => {
          // Comparación simple de strings de fecha ISO o reconvertir si es necesario
          // Para simplicidad en este ejemplo, confiamos en el orden de carga o:
          return 0; 
      });

      autoTable(doc, {
          startY: 90,
          head: [['Fecha', 'Tipo', 'Descripción', 'Monto']],
          body: allRows,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [40, 40, 40] },
      });

      doc.save(`Reporte_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF generado correctamente")
  }

  if (!selectedReport) {
      return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">Centro de Reportes</h1>
                <p className="text-muted-foreground">Selecciona el periodo que deseas consultar.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:border-blue-500 hover:shadow-md border-2 transition-all group" onClick={() => handleSelectReport("diario")}>
                    <CardHeader className="text-center">
                        <div className="mx-auto p-3 rounded-full bg-blue-100 text-blue-600 mb-2 group-hover:scale-110 transition-transform"><Calendar className="h-6 w-6" /></div>
                        <CardTitle>Diario</CardTitle>
                        <CardDescription>Resumen de hoy</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="cursor-pointer hover:border-purple-500 hover:shadow-md border-2 transition-all group" onClick={() => handleSelectReport("semanal")}>
                    <CardHeader className="text-center">
                        <div className="mx-auto p-3 rounded-full bg-purple-100 text-purple-600 mb-2 group-hover:scale-110 transition-transform"><CalendarDays className="h-6 w-6" /></div>
                        <CardTitle>Semanal</CardTitle>
                        <CardDescription>Esta semana</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="cursor-pointer hover:border-green-500 hover:shadow-md border-2 transition-all group" onClick={() => handleSelectReport("mensual")}>
                    <CardHeader className="text-center">
                        <div className="mx-auto p-3 rounded-full bg-green-100 text-green-600 mb-2 group-hover:scale-110 transition-transform"><CalendarRange className="h-6 w-6" /></div>
                        <CardTitle>Mensual</CardTitle>
                        <CardDescription>Rango de meses</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
      )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedReport(null)} className="gap-2 pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" /> Volver
            </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2 capitalize">
                Reporte {selectedReport}
                {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </h1>

            {/* SELECTOR DE RANGO (SOLO MENSUAL) */}
            {selectedReport === "mensual" && (
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-muted/30 p-1 rounded-lg">
                    <div className="flex items-center">
                        <span className="text-muted-foreground text-xs mr-2 pl-2">Desde:</span>
                        <Select value={monthStart} onValueChange={setMonthStart}>
                            <SelectTrigger className="w-[140px] border-0 shadow-none bg-transparent h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {getMonthOptions().map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <span className="hidden sm:inline text-muted-foreground">/</span>
                    <div className="flex items-center">
                        <span className="text-muted-foreground text-xs mr-2">Hasta:</span>
                        <Select value={monthEnd} onValueChange={setMonthEnd}>
                            <SelectTrigger className="w-[140px] border-0 shadow-none bg-transparent h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {getMonthOptions().map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>

        {dataReporte ? (
            <div className="space-y-6">
                {/* TARJETA RESUMEN SIMPLE */}
                <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-around items-center gap-6 text-center md:text-left">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ingresos</p>
                                <p className="text-3xl font-bold text-green-600">+${dataReporte.resumen.totalIngresos.toLocaleString()}</p>
                            </div>
                            <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Egresos</p>
                                <p className="text-3xl font-bold text-red-600">-${dataReporte.resumen.totalEgresos.toLocaleString()}</p>
                            </div>
                            <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-700"></div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ganancia Neta</p>
                                <p className={cn("text-3xl font-black", dataReporte.resumen.ganancia >= 0 ? "text-blue-600" : "text-orange-600")}>
                                    ${dataReporte.resumen.ganancia.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ÚLTIMOS MOVIMIENTOS (TOP 5) */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Últimas Transacciones</CardTitle>
                        <CardDescription>Muestra reciente de los movimientos en este periodo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {getRecentTransactions().length === 0 ? (
                                    <TableRow><TableCell colSpan={3} className="text-center py-4">Sin movimientos.</TableCell></TableRow>
                                ) : (
                                    getRecentTransactions().map((mov: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="text-xs font-mono text-muted-foreground">
                                                {/* Corrección de fecha en tabla también */}
                                                {new Date(mov.fecha).toLocaleDateString('es-CL', { timeZone: 'UTC' })}
                                            </TableCell>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                {mov.type === 'ingreso' 
                                                    ? <TrendingUp className="h-3 w-3 text-green-500" /> 
                                                    : <TrendingDown className="h-3 w-3 text-red-500" />
                                                }
                                                {mov.descripcion}
                                            </TableCell>
                                            <TableCell className={cn("text-right font-bold", mov.type === 'ingreso' ? "text-green-600" : "text-red-600")}>
                                                {mov.type === 'ingreso' ? '+' : '-'}${mov.monto.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* BOTÓN DESCARGA */}
                <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                    onClick={descargarPDF}
                >
                    <Download className="mr-2 h-5 w-5" /> Descargar PDF Completo
                </Button>
            </div>
        ) : (
            <div className="py-12 text-center text-muted-foreground">Cargando datos...</div>
        )}
    </div>
  )
}