"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar, FileText, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"

type ReportType = "daily" | "weekly" | "monthly" | null

export default function ReportesPage() {
  const [reportType, setReportType] = useState<ReportType>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Calcular la fecha mínima permitida (3 meses atrás)
  const getMinDate = () => {
    const date = new Date()
    date.setMonth(date.getMonth() - 3)
    return date.toISOString().split("T")[0]
  }

  // Fecha máxima es hoy
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0]
  }

  const getMondayOfCurrentWeek = () => {
    const today = new Date()
    const day = today.getDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const diff = day === 0 ? -6 : 1 - day // Si es domingo, retrocede 6 días; sino calcula la diferencia
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    return monday.toISOString().split("T")[0]
  }

  const handleGenerateReport = () => {
    console.log("[v0] Generando reporte:", { reportType, startDate, endDate })
    // Aquí se conectará con la base de datos cuando esté lista
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-balance">Reportes</h1>
        <p className="text-muted-foreground text-pretty">Genera reportes de ingresos y egresos de tu negocio</p>
      </div>

      {/* Selector de tipo de reporte */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Selecciona el tipo de reporte</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Reporte Diario */}
          <button
            onClick={() => {
              setReportType("daily")
              setStartDate("")
              setEndDate("")
            }}
            className={`p-6 border-2 rounded-lg transition-all hover:border-primary ${
              reportType === "daily" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Reporte Diario</h3>
                <p className="text-sm text-muted-foreground mt-1">Hasta la hora actual</p>
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
            className={`p-6 border-2 rounded-lg transition-all hover:border-primary ${
              reportType === "weekly" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Reporte Semanal</h3>
                <p className="text-sm text-muted-foreground mt-1">Desde el lunes hasta hoy</p>
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
            className={`p-6 border-2 rounded-lg transition-all hover:border-primary ${
              reportType === "monthly" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Reporte Mensual</h3>
                <p className="text-sm text-muted-foreground mt-1">Hasta 3 meses atrás</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Selector de fechas */}
      {reportType === "monthly" && (
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <h3 className="font-semibold">Selecciona el rango de fechas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Fecha de inicio</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={getMinDate()}
                max={getTodayDate()}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Máximo 3 meses atrás</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Fecha de fin</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || getMinDate()}
                max={getTodayDate()}
                className="w-full"
                disabled={!startDate}
              />
              <p className="text-xs text-muted-foreground">Hasta hoy</p>
            </div>
          </div>
        </div>
      )}

      {reportType === "weekly" && (
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <h3 className="font-semibold">Rango de fechas seleccionado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de inicio</Label>
              <div className="p-3 border rounded-md bg-muted">
                <p className="text-sm">
                  {new Date(startDate).toLocaleDateString("es-CL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fecha de fin</Label>
              <div className="p-3 border rounded-md bg-muted">
                <p className="text-sm">
                  {new Date(endDate).toLocaleDateString("es-CL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de generar reporte */}
      {reportType && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerateReport}
            disabled={reportType === "monthly" && (!startDate || !endDate)}
            className="px-8"
          >
            <FileText className="mr-2 h-5 w-5" />
            Generar Reporte {reportType === "daily" ? "Diario" : reportType === "weekly" ? "Semanal" : "Mensual"}
          </Button>
        </div>
      )}

      {/* Mensaje cuando no hay datos */}
      {reportType && (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Los reportes se mostrarán aquí una vez que tengas datos en la base de datos
          </p>
        </div>
      )}
    </div>
  )
}
