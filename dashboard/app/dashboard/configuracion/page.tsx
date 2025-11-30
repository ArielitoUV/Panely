"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Store, DollarSign, Clock, CreditCard, Bell } from "lucide-react"

export default function ConfiguracionPage() {
  const [configuracion, setConfiguracion] = useState({
    // Información del negocio
    nombreNegocio: "Panely",
    direccion: "",
    telefono: "",
    email: "",

    // Configuración fiscal
    iva: 19,

    // Métodos de pago
    aceptaEfectivo: true,
    aceptaTarjeta: true,
    aceptaTransferencia: true,

    // Configuración de caja
    montoInicialCaja: 50000,

    // Horarios
    horaApertura: "07:00",
    horaCierre: "20:00",

    // Notificaciones
    notificarCierresCaja: true,
    notificarBajoStock: false,
  })

  const handleSave = () => {
    // Aquí se guardará en la base de datos
    console.log("[v0] Guardando configuración:", {
      ...configuracion,
      fechaActualizacion: new Date().toISOString(),
    })
    alert("Configuración guardada exitosamente")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value)
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground">Administra la configuración general de tu panadería</p>
        </div>

        {/* Información del Negocio */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <CardTitle>Información del Negocio</CardTitle>
            </div>
            <CardDescription>Datos básicos de tu panadería</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombreNegocio">Nombre del Negocio</Label>
                <Input
                  id="nombreNegocio"
                  value={configuracion.nombreNegocio}
                  onChange={(e) => setConfiguracion({ ...configuracion, nombreNegocio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={configuracion.telefono}
                  onChange={(e) => setConfiguracion({ ...configuracion, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@panely.cl"
                value={configuracion.email}
                onChange={(e) => setConfiguracion({ ...configuracion, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                placeholder="Calle Principal #123, Santiago, Chile"
                value={configuracion.direccion}
                onChange={(e) => setConfiguracion({ ...configuracion, direccion: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración Fiscal */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <CardTitle>Configuración Fiscal y Caja</CardTitle>
            </div>
            <CardDescription>Parámetros de impuestos y manejo de caja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="iva">IVA (%)</Label>
                <Input
                  id="iva"
                  type="number"
                  value={configuracion.iva}
                  onChange={(e) => setConfiguracion({ ...configuracion, iva: Number(e.target.value) })}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-muted-foreground">Impuesto al Valor Agregado en Chile</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="montoInicial">Monto Inicial de Caja</Label>
                <Input
                  id="montoInicial"
                  type="number"
                  value={configuracion.montoInicialCaja}
                  onChange={(e) => setConfiguracion({ ...configuracion, montoInicialCaja: Number(e.target.value) })}
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Sugerido: {formatCurrency(configuracion.montoInicialCaja)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pago */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <CardTitle>Métodos de Pago</CardTitle>
            </div>
            <CardDescription>Selecciona los métodos de pago que aceptas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="efectivo">Efectivo</Label>
                <p className="text-sm text-muted-foreground">Aceptar pagos en efectivo</p>
              </div>
              <Switch
                id="efectivo"
                checked={configuracion.aceptaEfectivo}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, aceptaEfectivo: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tarjeta">Tarjeta (Débito/Crédito)</Label>
                <p className="text-sm text-muted-foreground">Aceptar pagos con tarjeta</p>
              </div>
              <Switch
                id="tarjeta"
                checked={configuracion.aceptaTarjeta}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, aceptaTarjeta: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transferencia">Transferencia Bancaria</Label>
                <p className="text-sm text-muted-foreground">Aceptar pagos por transferencia</p>
              </div>
              <Switch
                id="transferencia"
                checked={configuracion.aceptaTransferencia}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, aceptaTransferencia: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Horarios de Operación */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <CardTitle>Horarios de Operación</CardTitle>
            </div>
            <CardDescription>Define los horarios de tu panadería</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="horaApertura">Hora de Apertura</Label>
                <Input
                  id="horaApertura"
                  type="time"
                  value={configuracion.horaApertura}
                  onChange={(e) => setConfiguracion({ ...configuracion, horaApertura: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaCierre">Hora de Cierre</Label>
                <Input
                  id="horaCierre"
                  type="time"
                  value={configuracion.horaCierre}
                  onChange={(e) => setConfiguracion({ ...configuracion, horaCierre: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Notificaciones</CardTitle>
            </div>
            <CardDescription>Configura las alertas del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifCierres">Notificar Cierres de Caja</Label>
                <p className="text-sm text-muted-foreground">Recibir recordatorio para cerrar caja</p>
              </div>
              <Switch
                id="notifCierres"
                checked={configuracion.notificarCierresCaja}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, notificarCierresCaja: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifStock">Alertas de Bajo Stock</Label>
                <p className="text-sm text-muted-foreground">Notificar cuando productos estén bajos (próximamente)</p>
              </div>
              <Switch
                id="notifStock"
                checked={configuracion.notificarBajoStock}
                onCheckedChange={(checked) => setConfiguracion({ ...configuracion, notificarBajoStock: checked })}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} size="lg" className="gap-2">
            <Save className="w-4 h-4" />
            Guardar Configuración
          </Button>
        </div>
      </div>
    </div>
  )
}
