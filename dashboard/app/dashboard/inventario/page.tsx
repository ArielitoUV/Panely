"use client"

import { Package, AlertTriangle, CheckCircle, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Datos de ejemplo
  const inventario = [
    { id: 1, insumo: "Harina de Trigo", stock: 50, minimo: 20, estado: "normal" },
    { id: 2, insumo: "Azúcar Blanca", stock: 15, minimo: 25, estado: "bajo" },
    { id: 3, insumo: "Aceite Vegetal", stock: 30, minimo: 15, estado: "normal" },
    { id: 4, insumo: "Sal", stock: 100, minimo: 30, estado: "normal" },
    { id: 5, insumo: "Levadura", stock: 8, minimo: 10, estado: "bajo" },
    { id: 6, insumo: "Mantequilla", stock: 25, minimo: 20, estado: "normal" },
    { id: 7, insumo: "Huevos (docena)", stock: 40, minimo: 15, estado: "normal" },
    { id: 8, insumo: "Leche (litros)", stock: 12, minimo: 20, estado: "bajo" },
    { id: 9, insumo: "Chocolate en Polvo", stock: 35, minimo: 10, estado: "normal" },
    { id: 10, insumo: "Vainilla", stock: 18, minimo: 8, estado: "normal" },
  ]

  const filteredInventario = inventario.filter((item) => item.insumo.toLowerCase().includes(searchTerm.toLowerCase()))

  const insumosNormales = inventario.filter((item) => item.estado === "normal").length
  const insumosBajos = inventario.filter((item) => item.estado === "bajo").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Inventario</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona y controla tus insumos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Insumo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Insumos</p>
              <p className="text-2xl font-bold text-foreground mt-1 sm:text-3xl">{inventario.length}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock Normal</p>
              <p className="text-2xl font-bold text-foreground mt-1 sm:text-3xl">{insumosNormales}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
              <p className="text-2xl font-bold text-foreground mt-1 sm:text-3xl">{insumosBajos}</p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* barra search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar insumo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-foreground">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">INSUMO</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">STOCK</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">MÍNIMO</th>
                <th className="text-left p-4 text-sm font-semibold text-foreground">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInventario.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-muted-foreground">#{item.id.toString().padStart(3, "0")}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.insumo}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-sm font-semibold ${
                        item.stock < item.minimo ? "text-red-600 dark:text-red-400" : "text-foreground"
                      }`}
                    >
                      {item.stock} unidades
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{item.minimo} unidades</td>
                  <td className="p-4">
                    {item.estado === "bajo" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        Stock Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" />
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventario.length === 0 && (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No se encontraron insumos</p>
          </div>
        )}
      </div>
    </div>
  )
}
