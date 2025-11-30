"use client"

import { useState } from "react"
import { DollarSign, Lock, Unlock, Calendar, TrendingUp, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function IngresosPage() {
  const [cajaAbierta, setCajaAbierta] = useState(false)
  const [montoInicial, setMontoInicial] = useState("")
  const [ventasEfectivo, setVentasEfectivo] = useState("")
  const [ventasTarjeta, setVentasTarjeta] = useState("")
  const [ventasTransferencia, setVentasTransferencia] = useState("")
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

  const calcularTotal = () => {
    const inicial = Number.parseFloat(montoInicial) || 0
    const efectivo = Number.parseFloat(ventasEfectivo) || 0
    const tarjeta = Number.parseFloat(ventasTarjeta) || 0
    const transferencia = Number.parseFloat(ventasTransferencia) || 0

    return inicial + efectivo + tarjeta + transferencia
  }

  const handleAbrirCaja = () => {
    if (montoInicial) {
      setCajaAbierta(true)
    }
  }

  const handleCerrarCaja = () => {
    console.log("[v0] Guardando cierre de caja:", {
      fecha, // Fecha en formato YYYY-MM-DD para base de datos
      fechaHora: new Date().toISOString(), // Timestamp completo
      montoInicial: Number.parseFloat(montoInicial),
      ventasEfectivo: Number.parseFloat(ventasEfectivo) || 0,
      ventasTarjeta: Number.parseFloat(ventasTarjeta) || 0,
      ventasTransferencia: Number.parseFloat(ventasTransferencia) || 0,
      total: calcularTotal(),
    })

    // Resetear formulario
    setCajaAbierta(false)
    setMontoInicial("")
    setVentasEfectivo("")
    setVentasTarjeta("")
    setVentasTransferencia("")
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
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Ingresos Diarios</h1>
          <p className="text-lg text-muted-foreground">Registra los ingresos diarios de tu panadería</p>
        </div>

        {/* Estado de Caja Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {cajaAbierta ? (
                <>
                  <Unlock className="w-6 h-6 text-green-600" />
                  Caja Abierta
                </>
              ) : (
                <>
                  <Lock className="w-6 h-6 text-red-600" />
                  Caja Cerrada
                </>
              )}
            </CardTitle>
            <CardDescription>
              {cajaAbierta
                ? "La caja está lista para registrar las ventas del día"
                : "Abre la caja con el monto inicial para comenzar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="montoInicial" className="text-base font-semibold">
                  Monto Inicial en Caja
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="montoInicial"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={montoInicial}
                    onChange={(e) => setMontoInicial(e.target.value)}
                    disabled={cajaAbierta}
                    className="pl-10 h-12 text-lg font-semibold"
                  />
                </div>
              </div>

              {!cajaAbierta ? (
                <Button
                  onClick={handleAbrirCaja}
                  disabled={!montoInicial}
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Unlock className="mr-2 w-5 h-5" />
                  Abrir Caja
                </Button>
              ) : (
                <div className="space-y-4 pt-4 border-t-2">
                  {/* Formulario de Ventas */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="ventasEfectivo" className="text-base font-semibold flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        Efectivo
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                        <Input
                          id="ventasEfectivo"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={ventasEfectivo}
                          onChange={(e) => setVentasEfectivo(e.target.value)}
                          className="pl-10 h-12 text-lg font-semibold"
                        />
                      </div>
                      {ventasEfectivo && (
                        <p className="text-sm text-muted-foreground font-medium">${formatearNumero(ventasEfectivo)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ventasTarjeta" className="text-base font-semibold flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        Tarjeta
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                        <Input
                          id="ventasTarjeta"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={ventasTarjeta}
                          onChange={(e) => setVentasTarjeta(e.target.value)}
                          className="pl-10 h-12 text-lg font-semibold"
                        />
                      </div>
                      {ventasTarjeta && (
                        <p className="text-sm text-muted-foreground font-medium">${formatearNumero(ventasTarjeta)}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ventasTransferencia" className="text-base font-semibold flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        Transferencia
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
                        <Input
                          id="ventasTransferencia"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={ventasTransferencia}
                          onChange={(e) => setVentasTransferencia(e.target.value)}
                          className="pl-10 h-12 text-lg font-semibold"
                        />
                      </div>
                      {ventasTransferencia && (
                        <p className="text-sm text-muted-foreground font-medium">
                          ${formatearNumero(ventasTransferencia)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Resumen Total */}
                  <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-xl">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-8 h-8" />
                          <div>
                            <p className="text-sm opacity-90 font-medium">Total en Caja</p>
                            <p className="text-4xl font-bold tracking-tight">
                              ${formatearNumero(calcularTotal().toString())}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Botón Cerrar Caja */}
                  <Button
                    onClick={handleCerrarCaja}
                    className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg"
                    size="lg"
                  >
                    <Save className="mr-2 w-5 h-5" />
                    Cerrar Caja y Guardar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
