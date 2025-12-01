"use client"

import { useState, useEffect } from "react"
import { DollarSign, Lock, Unlock, Calendar, TrendingUp, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function IngresosPage() {
  const [caja, setCaja] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [montoInicial, setMontoInicial] = useState("")
  const [ventasEfectivo, setVentasEfectivo] = useState("")
  const [ventasTarjeta, setVentasTarjeta] = useState("")
  const [ventasTransferencia, setVentasTransferencia] = useState("")

  const fechaHoy = new Date().toISOString().split("T")[0]
  const fechaDisplay = new Date()
    .toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .replace(/^\w/, (c) => c.toUpperCase())

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

  useEffect(() => {
    const cargarCaja = async () => {
      if (!token) return

      try {
        const res = await fetch(`http://localhost:3001/caja/hoy`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (data.caja) {
          setCaja(data.caja)
          setMontoInicial(data.caja.montoInicial.toString())
          setVentasEfectivo(data.caja.efectivo.toString())
          setVentasTarjeta(data.caja.tarjeta.toString())
          setVentasTransferencia(data.caja.transferencia.toString())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    cargarCaja()
  }, [token])

  const formatearNumero = (valor: string | number) => {
    const num = typeof valor === "string" ? Number.parseInt(valor) || 0 : valor
    return num.toLocaleString("es-CL")
  }

  const calcularTotal = () => {
    const inicial = Number(montoInicial) || 0
    const efectivo = Number(ventasEfectivo) || 0
    const tarjeta = Number(ventasTarjeta) || 0
    const transferencia = Number(ventasTransferencia) || 0
    return inicial + efectivo + tarjeta + transferencia
  }

  const handleAbrirCaja = async () => {
    if (!montoInicial || Number(montoInicial) <= 0) {
      toast.error("Ingresa un monto inicial válido")
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch("http://localhost:3001/caja/abrir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify({ montoInicial: Number(montoInicial) }),
      })

      const data = await res.json()
      if (res.ok) {
        setCaja(data.caja)
        toast.success("¡Caja abierta correctamente!")
      } else {
        toast.error(data.error || "Error al abrir caja")
      }
    } catch (err) {
      toast.error("Error de conexión")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCerrarCaja = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`http://localhost:3001/caja/cerrar/${caja.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token!}`,
        },
        body: JSON.stringify({
          efectivo: Number(ventasEfectivo) || 0,
          tarjeta: Number(ventasTarjeta) || 0,
          transferencia: Number(ventasTransferencia) || 0,
        }),
      })

      if (res.ok) {
        toast.success("¡Caja cerrada y guardada correctamente!")
        setCaja({ ...caja, estado: "CERRADA" })
      } else {
        const data = await res.json()
        toast.error(data.error || "Error al cerrar caja")
      }
    } catch (err) {
      toast.error("Error de conexión")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  const cajaAbierta = caja?.estado === "ABIERTA"
  const cajaCerradaHoy = caja?.estado === "CERRADA"

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary text-primary-foreground rounded-full text-base font-semibold shadow-lg">
            <Calendar className="w-5 h-5" />
            {fechaDisplay}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Cierre de Caja</h1>
          <p className="text-lg text-muted-foreground">Registra los ingresos diarios de tu panadería</p>
        </div>

        <Card className="shadow-xl border-2">
          <CardHeader className="text-center border-b pb-6">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl sm:text-3xl">
              {cajaAbierta ? (
                <>
                  <Unlock className="w-8 h-8 text-green-600" />
                  <span className="text-green-600">Caja Abierta</span>
                </>
              ) : cajaCerradaHoy ? (
                <>
                  <Lock className="w-8 h-8 text-muted-foreground" />
                  <span className="text-muted-foreground">Caja Cerrada Hoy</span>
                </>
              ) : (
                <>
                  <Lock className="w-8 h-8 text-red-600" />
                  <span className="text-red-600">Caja Cerrada</span>
                </>
              )}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {cajaAbierta
                ? "Registra todas las ventas del día"
                : cajaCerradaHoy
                  ? "Ya cerraste la caja de hoy"
                  : "Abre la caja para comenzar el día"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            {/* Monto Inicial */}
            <div className="space-y-3">
              <Label htmlFor="montoInicial" className="text-lg font-semibold">
                Monto Inicial en Caja
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  id="montoInicial"
                  type="number"
                  placeholder="50000"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  disabled={!!caja}
                  className="pl-12 h-14 text-xl font-bold"
                />
              </div>
              {montoInicial && (
                <p className="text-right text-sm text-muted-foreground font-medium">${formatearNumero(montoInicial)}</p>
              )}
            </div>

            {/* ABRIR CAJA */}
            {!caja && (
              <Button
                onClick={handleAbrirCaja}
                disabled={isSaving || !montoInicial}
                className="w-full h-14 text-xl font-bold bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Unlock className="mr-3 h-6 w-6" />}
                Abrir Caja
              </Button>
            )}

            {/* VENTAS DEL DÍA */}
            {cajaAbierta && (
              <div className="space-y-8 pt-6 border-t-2">
                <h3 className="text-xl font-bold text-foreground">Ventas del Día</h3>

                <div className="grid gap-6 sm:grid-cols-3">
                  {[
                    {
                      id: "ventasEfectivo",
                      label: "Efectivo",
                      color: "green",
                      value: ventasEfectivo,
                      set: setVentasEfectivo,
                    },
                    {
                      id: "ventasTarjeta",
                      label: "Tarjeta",
                      color: "blue",
                      value: ventasTarjeta,
                      set: setVentasTarjeta,
                    },
                    {
                      id: "ventasTransferencia",
                      label: "Transferencia",
                      color: "purple",
                      value: ventasTransferencia,
                      set: setVentasTransferencia,
                    },
                  ].map((item) => (
                    <div key={item.id} className="space-y-3">
                      <Label htmlFor={item.id} className="flex items-center gap-2 text-base font-semibold">
                        <span
                          className={`w-3 h-3 rounded-full ${item.color === "green" ? "bg-green-500" : item.color === "blue" ? "bg-blue-500" : "bg-purple-500"}`}
                        />
                        {item.label}
                      </Label>
                      <div className="relative">
                        <DollarSign
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${item.color === "green" ? "text-green-600" : item.color === "blue" ? "text-blue-600" : "text-purple-600"}`}
                        />
                        <Input
                          id={item.id}
                          type="number"
                          placeholder="0"
                          value={item.value}
                          onChange={(e) => item.set(e.target.value)}
                          className="pl-10 h-12 text-lg font-bold"
                        />
                      </div>
                      {item.value && (
                        <p className="text-right text-sm text-muted-foreground font-medium">
                          ${formatearNumero(item.value)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <Card className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-xl border-0">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <TrendingUp className="w-12 h-12" />
                      <div className="text-center sm:text-left">
                        <p className="text-lg opacity-90 font-medium">Total en Caja</p>
                        <p className="text-5xl sm:text-6xl font-bold tracking-tight">
                          ${formatearNumero(calcularTotal())}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleCerrarCaja}
                  disabled={isSaving}
                  className="w-full h-16 text-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-xl"
                >
                  {isSaving ? <Loader2 className="mr-3 h-7 w-7 animate-spin" /> : <Save className="mr-3 h-7 w-7" />}
                  Cerrar Caja y Guardar
                </Button>
              </div>
            )}

            {/* CAJA YA CERRADA HOY */}
            {cajaCerradaHoy && (
              <div className="text-center py-12">
                <Lock className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground mb-4">La caja de hoy ya fue cerrada</p>
                <div className="inline-block px-8 py-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total Final</p>
                  <p className="text-5xl font-bold text-green-600">${formatearNumero(caja.totalFinal)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
