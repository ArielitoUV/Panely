"use client"

import { useState } from "react"
import { DollarSign, Calendar, Trash2, Plus, Save, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Egreso {
  id: string
  concepto: string
  monto: string
  descripcion: string
}

export default function EgresosPage() {
  const [egresos, setEgresos] = useState<Egreso[]>([])
  const [concepto, setConcepto] = useState("")
  const [monto, setMonto] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fecha] = useState(new Date().toISOString().split("T")[0])
  const [fechaDisplay] = useState(
    new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  )

  const formatearNumero = (valor: string) => {
    if (!valor) return "0.00"
    const numero = Number.parseFloat(valor)
    return numero.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const calcularTotalEgresos = () => {
    return egresos.reduce((total, egreso) => total + (Number.parseFloat(egreso.monto) || 0), 0)
  }

  const agregarEgreso = () => {
    if (concepto && monto) {
      const nuevoEgreso: Egreso = {
        id: Date.now().toString(),
        concepto,
        monto,
        descripcion,
      }
      setEgresos([...egresos, nuevoEgreso])
      setConcepto("")
      setMonto("")
      setDescripcion("")
    }
  }

  const eliminarEgreso = (id: string) => {
    setEgresos(egresos.filter((e) => e.id !== id))
  }

  const guardarEgresos = () => {
    console.log("[v0] Guardando egresos:", {
      fecha,
      fechaHora: new Date().toISOString(),
      egresos: egresos.map((e) => ({
        concepto: e.concepto,
        monto: Number.parseFloat(e.monto),
        descripcion: e.descripcion,
      })),
      totalEgresos: calcularTotalEgresos(),
    })

    // Resetear formulario
    setEgresos([])
    setConcepto("")
    setMonto("")
    setDescripcion("")
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-md">
            <Calendar className="w-4 h-4" />
            {fechaDisplay}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Registro de Egresos</h1>
          <p className="text-lg text-muted-foreground">Administra los gastos diarios de tu panadería</p>
        </div>

        {/* Formulario de Nuevo Egreso */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Plus className="w-6 h-6 text-orange-600" />
              Nuevo Egreso
            </CardTitle>
            <CardDescription>Registra un gasto o egreso del día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="concepto" className="text-base font-semibold">
                    Concepto
                  </Label>
                  <Input
                    id="concepto"
                    placeholder="ej. Compra de harina"
                    value={concepto}
                    onChange={(e) => setConcepto(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monto" className="text-base font-semibold">
                    Monto
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-600" />
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      className="pl-10 h-12 text-lg font-semibold"
                    />
                  </div>
                  {monto && <p className="text-sm text-muted-foreground font-medium">${formatearNumero(monto)}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="text-base font-semibold">
                  Descripción (opcional)
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalles adicionales del egreso..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              <Button
                onClick={agregarEgreso}
                disabled={!concepto || !monto}
                className="w-full h-12 text-lg bg-orange-600 hover:bg-orange-700 text-white"
                size="lg"
              >
                <Plus className="mr-2 w-5 h-5" />
                Agregar Egreso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Egresos */}
        {egresos.length > 0 && (
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShoppingCart className="w-6 h-6" />
                Egresos del Día
              </CardTitle>
              <CardDescription>
                {egresos.length} egreso{egresos.length !== 1 ? "s" : ""} registrado{egresos.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {egresos.map((egreso) => (
                  <Card key={egreso.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold text-lg">{egreso.concepto}</p>
                          {egreso.descripcion && <p className="text-sm text-muted-foreground">{egreso.descripcion}</p>}
                          <p className="text-2xl font-bold text-red-600">${formatearNumero(egreso.monto)}</p>
                        </div>
                        <Button
                          onClick={() => eliminarEgreso(egreso.id)}
                          variant="destructive"
                          size="icon"
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Total de Egresos */}
                <Card className="bg-gradient-to-r from-red-600 to-rose-600 text-white border-0 shadow-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8" />
                        <div>
                          <p className="text-sm opacity-90 font-medium">Total Egresos</p>
                          <p className="text-4xl font-bold tracking-tight">
                            ${formatearNumero(calcularTotalEgresos().toString())}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Botón Guardar */}
                <Button
                  onClick={guardarEgresos}
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  size="lg"
                >
                  <Save className="mr-2 w-5 h-5" />
                  Guardar Egresos del Día
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje cuando no hay egresos */}
        {egresos.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-lg text-muted-foreground">No hay egresos registrados para el día de hoy</p>
              <p className="text-sm text-muted-foreground mt-2">Agrega un egreso usando el formulario de arriba</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
