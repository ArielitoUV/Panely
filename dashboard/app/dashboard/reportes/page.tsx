"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, FileText, TrendingUp, Download, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useToast } from "@/components/ui/use-toast"

type ReportType = "daily" | "weekly" | "monthly" | null

export default function ReportesPage() {
  const { toast } = useToast()
  const [reportType, setReportType] = useState<ReportType>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // --- UTILIDADES DE FECHAS ---
  const getMinDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 3)
    return date.toISOString().split("T")[0]
  }

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  const getMondayOfCurrentWeek = () => {
    const today = new Date()
    const day = today.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    return monday.toISOString().split("T")[0]
  }

  // --- LÓGICA DE GENERACIÓN DE PDF ---
  const generatePDF = async () => {
    setIsGenerating(true)
    
    // Simulación de retardo para que se vea la carga
    await new Promise(resolve => setTimeout(resolve, 1000))

    try {
      const doc = new jsPDF()

      // 1. Encabezado del Reporte
      doc.setFontSize(20)
      doc.text("Reporte Financiero - Panely", 14, 22)
      
      doc.setFontSize(11)
      doc.text(`Tipo de Reporte: ${reportType === 'daily' ? 'Diario' : reportType === 'weekly' ? 'Semanal' : 'Mensual'}`, 14, 32)
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 14, 38)
      
      if (startDate && endDate) {
         doc.text(`Período: ${startDate} al ${endDate}`, 14, 44)
      }

      // 2. Datos Simulados (Esto vendría de tu base de datos después)
      const resumen = {
          ingresos: 150000,
          egresos: 45000,
          ganancia: 105000
      }

      // 3. Tabla de Resumen
      autoTable(doc, {
        startY: 50,
        head: [['Concepto', 'Monto']],
        body: [
            ['Total Ingresos', `$${resumen.ingresos.toLocaleString()}`],
            ['Total Egresos', `$${resumen.egresos.toLocaleString()}`],
            ['Ganancia Neta', `$${resumen.ganancia.toLocaleString()}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [234, 88, 12] }, // Color naranja Panely
      })

      // 4. Tabla Detallada (Ejemplo)
      const movimientos = [
          ['01/12/2024', 'Venta de Pan', 'Ingreso', '$25,000'],
          ['01/12/2024', 'Compra Harina', 'Egreso', '$10,000'],
          ['02/12/2024', 'Venta Pasteles', 'Ingreso', '$15,000'],
          ['03/12/2024', 'Pago Luz', 'Egreso', '$35,000'],
      ]

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Fecha', 'Descripción', 'Tipo', 'Monto']],
        body: movimientos,
        theme: 'striped',
      })

      // 5. Guardar PDF
      doc.save(`reporte_panely_${reportType}_${getTodayDate()}.pdf`)
      
      toast({
        title: "¡Reporte Descargado!",
        description: "El archivo PDF se ha generado correctamente.",
        className: "bg-green-600 text-white"
      })

    } catch (error) {
        console.error(error)
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo generar el reporte PDF.",
        })
    } finally {
        setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance">Reportes</h1>
        <p className="text-muted-foreground text-pretty">Genera y descarga informes detallados de tu negocio.</p>
      </div>

      {/* Selector de tipo de reporte */}
      <Card>
        <CardHeader>
            <CardTitle>Configurar Reporte</CardTitle>
            <CardDescription>Selecciona el período que deseas consultar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Reporte Diario */}
                <button
                onClick={() => {
                    setReportType("daily")
                    setStartDate(getTodayDate())
                    setEndDate(getTodayDate())
                }}
                className={`p-6 border-2 rounded-lg transition-all hover:border-primary/50 hover:shadow-sm ${
                    reportType === "daily" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted bg-card"
                }`}
                >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`p-3 rounded-full ${reportType === "daily" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                         <FileText className="h-6 w-6" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-lg">Reporte Diario</h3>
                    <p className="text-sm text-muted-foreground mt-1">Movimientos de hoy</p>
                    </div>
                </div>
                </button>

                {/* Reporte Semanal */}
                <button
                onClick={() => {
                    setReportType("weekly")
                    setStartDate(getMondayOfCurrentWeek())
                    setEndDate(getTodayDate())
                }}
                className={`p-6 border-2 rounded-lg transition-all hover:border-primary/50 hover:shadow-sm ${
                    reportType === "weekly" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted bg-card"
                }`}
                >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`p-3 rounded-full ${reportType === "weekly" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-lg">Reporte Semanal</h3>
                    <p className="text-sm text-muted-foreground mt-1">Esta semana en curso</p>
                    </div>
                </div>
                </button>

                {/* Reporte Mensual */}
                <button
                onClick={() => {
                    setReportType("monthly")
                    setStartDate("")
                    setEndDate("")
                }}
                className={`p-6 border-2 rounded-lg transition-all hover:border-primary/50 hover:shadow-sm ${
                    reportType === "monthly" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-muted bg-card"
                }`}
                >
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`p-3 rounded-full ${reportType === "monthly" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-lg">Reporte Mensual</h3>
                    <p className="text-sm text-muted-foreground mt-1">Rango personalizado</p>
                    </div>
                </div>
                </button>
            </div>

            {/* Selector de fechas (Solo visible si es mensual o si se quiere ver el rango seleccionado) */}
            {(reportType === "monthly" || reportType === "weekly") && (
                <div className="p-4 border rounded-lg bg-muted/20 animate-in fade-in slide-in-from-top-2">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Rango Seleccionado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="start-date">Desde</Label>
                    <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={getMinDate()}
                        max={getTodayDate()}
                        disabled={reportType === "weekly"} // Bloqueado en semanal para simplificar
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="end-date">Hasta</Label>
                    <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        max={getTodayDate()}
                        disabled={reportType === "weekly"}
                    />
                    </div>
                </div>
                </div>
            )}

            {/* Botón de Acción */}
            <div className="flex justify-end pt-4">
                <Button 
                    size="lg" 
                    onClick={generatePDF}
                    disabled={!reportType || isGenerating || (reportType === "monthly" && (!startDate || !endDate))}
                    className="bg-orange-600 hover:bg-orange-700 min-w-[200px]"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generando...
                        </>
                    ) : (
                        <>
                            <Download className="mr-2 h-5 w-5" /> Descargar PDF
                        </>
                    )}
                </Button>
            </div>
        </CardContent>
      </Card>

      {/* Vista Previa (Placeholder Visual) */}
      {!reportType && (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/5 text-muted-foreground">
            <FileText className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Selecciona un tipo de reporte para comenzar</p>
        </div>
      )}
    </div>
  )
}