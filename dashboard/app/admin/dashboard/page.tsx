"use client"

import { useEffect, useState } from "react"
import { Users, Trash2, Search, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const fetchUsers = async () => {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${API_URL}/admin/users:id`, {
          headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) setUsers(await res.json())
      else router.push("/admin/login") // Si no es admin, fuera
  }

  useEffect(() => { fetchUsers() }, [])

  const deleteUser = async (id: number) => {
      if(!confirm("¿ESTÁS SEGURO? Se borrará TODO el historial, recetas e inventario de este usuario.")) return;
      
      const token = localStorage.getItem("accessToken")
      await fetch(`${API_URL}/admin/users/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
      })
      toast({ title: "Usuario Eliminado", variant: "destructive" })
      fetchUsers()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Users className="h-8 w-8 text-orange-600" />
                    Panel de Superadministrador
                </h1>
                <Button variant="outline" onClick={() => {
                    localStorage.clear()
                    router.push("/admin/login")
                }}>
                    <LogOut className="mr-2 h-4 w-4" /> Salir
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Usuarios ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-center">Datos</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-mono">{u.id}</TableCell>
                                    <TableCell className="font-medium">{u.nombre} {u.apellido}</TableCell>
                                    <TableCell>{u.nombreEmpresa}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell className="text-center text-xs text-muted-foreground">
                                        {u._count.insumos} insumos | {u._count.recetas} recetas
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="destructive" onClick={() => deleteUser(u.id)}>
                                            <Trash2 className="h-4 w-4" /> Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}