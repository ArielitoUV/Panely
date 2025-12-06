"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Calendar, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function ReportesPage() {
  const [rango, setRango] = useState("diario")
  const [dataReporte, setDataReporte] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
      const u = localStorage.getItem("user")
      if(u) setUser(JSON.parse(u))
  }, [])

  const generarReporte = async () => {
      const token = localStorage.getItem("accessToken")
      try {
          const res = await fetch(`${API_URL}/reportes?rango=${rango}`, {
              headers: { Authorization: `Bearer ${token}` }
          })
          if(res.ok) {
              setDataReporte(await res.json())
          }
      } catch(e) { console.error(e) }
  }

  // Cargar reporte al cambiar filtro
  useEffect(() => { generarReporte() }, [rango])

  const descargarPDF = () => {
      if (!dataReporte) return;

      const doc = new jsPDF();
      const empresa = user?.nombreEmpresa || "Panadería";
      
      // Encabezado
      doc.setFontSize(20);
      doc.text(`Reporte Financiero - ${rango.toUpperCase()}`, 14, 22);
      doc.setFontSize(12);
      doc.text(`Empresa: ${empresa}`, 14, 30);
      doc.text(`Fecha Emisión: ${new Date().toLocaleDateString()}`, 14, 36);
      
      // Resumen
      doc.setFillColor(240, 240, 240);
      doc.rect(14, 45, 180, 25, 'F');
      doc.setFontSize(10);
      doc.text(`Total Ingresos: $${dataReporte.resumen.totalIngresos.toLocaleString()}`, 20, 55);
      doc.text(`Total Egresos: $${dataReporte.resumen.totalEgresos.toLocaleString()}`, 20, 65);
      
      doc.setFontSize(14);
      doc.setTextColor(dataReporte.resumen.ganancia >= 0 ? 0 : 200, dataReporte.resumen.ganancia >= 0 ? 100 : 0, 0);
      doc.text(`Ganancia Neta: $${dataReporte.resumen.ganancia.toLocaleString()}`, 100, 60);
      doc.setTextColor(0,0,0);

      // Tabla Ingresos
      doc.text("Detalle de Ingresos", 14, 85);
      const rowsIngresos = dataReporte.detalles.ingresos.map((i: any) => [
          new Date(i.fecha).toLocaleDateString(),
          i.descripcion,
          i.metodoPago,
          `$${i.monto.toLocaleString()}`
      ]);
      
      autoTable(doc, {
          startY: 90,
          head: [['Fecha', 'Descripción', 'Pago', 'Monto']],
          body: rowsIngresos,
      });

      // Tabla Egresos
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY || 150;
      doc.text("Detalle de Egresos", 14, finalY + 15);
      
      const rowsEgresos = dataReporte.detalles.egresos.map((e: any) => [
          new Date(e.fecha).toLocaleDateString(),
          e.descripcion,
          e.categoria,
          `$${e.monto.toLocaleString()}`
      ]);

      autoTable(doc, {
          startY: finalY + 20,
          head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
          body: rowsEgresos,
      });

      doc.save(`reporte_${rango}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <div className="flex gap-2">
            <Select value={rango} onValueChange={setRango}>
                <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="diario">Reporte Diario</SelectItem>
                    <SelectItem value="semanal">Reporte Semanal</SelectItem>
                    <SelectItem value="mensual">Reporte Mensual</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {dataReporte && (
        <div className="space-y-6">
            {/* PREVIEW EN PANTALLA */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Ingresos</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">${dataReporte.resumen.totalIngresos.toLocaleString()}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Egresos</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">${dataReporte.resumen.totalEgresos.toLocaleString()}</div></CardContent>
                </Card>
                <Card className={dataReporte.resumen.ganancia >= 0 ? "bg-blue-50 dark:bg-blue-950/20" : "bg-red-50"}>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${dataReporte.resumen.ganancia.toLocaleString()}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vista Previa del Documento</CardTitle>
                    <CardDescription>Resumen de movimientos del periodo seleccionado.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border p-4 bg-white dark:bg-zinc-950 min-h-[300px]">
                        <p className="text-center font-bold underline mb-4 uppercase">Reporte {rango}</p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dataReporte.detalles.ingresos.slice(0, 5).map((i:any, k:number) => (
                                    <TableRow key={`i-${k}`}>
                                        <TableCell><Badge className="bg-green-500">Ingreso</Badge></TableCell>
                                        <TableCell>{i.descripcion}</TableCell>
                                        <TableCell className="text-right">+${i.monto.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                {dataReporte.detalles.egresos.slice(0, 5).map((e:any, k:number) => (
                                    <TableRow key={`e-${k}`}>
                                        <TableCell><Badge variant="destructive">Egreso</Badge></TableCell>
                                        <TableCell>{e.descripcion}</TableCell>
                                        <TableCell className="text-right">-${e.monto.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-xs text-muted-foreground">... y más registros en el PDF</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <Button className="w-full mt-4 bg-slate-900 text-white hover:bg-slate-800" onClick={descargarPDF}>
                        <Download className="mr-2 h-4 w-4" /> Descargar PDF Oficial
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  )
}