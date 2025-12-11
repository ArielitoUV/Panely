"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Package, Search, Eye, Trash2, ChevronDown, ChevronUp, LogOut, Loader2, RefreshCw, AlertCircle, Store, ChefHat, ShoppingBag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedUser, setExpandedUser] = useState<number | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
      setIsLoading(true)
      setError(null)
      try {
          const token = localStorage.getItem("accessToken")
          if (!token) {
              router.push("/admin/login")
              return
          }

          const res = await fetch(`${API_URL}/admin/users`, {
              headers: { Authorization: `Bearer ${token}` }
          })

          if (res.ok) {
              setUsers(await res.json())
          } else {
              if (res.status === 401 || res.status === 403) {
                  toast({ title: "Sesión Expirada", description: "Ingresa nuevamente.", variant: "destructive" })
                  router.push("/admin/login")
              } else {
                  setError("Error al cargar datos del servidor.")
              }
          }
      } catch (err) {
          console.error(err)
          setError("No se pudo conectar con el servidor.")
      } finally {
          setIsLoading(false)
      }
  }, [router, toast])

  useEffect(() => { 
      fetchUsers() 
  }, [fetchUsers])

  const deleteUser = async (id: number) => {
      if(!confirm("¿ESTÁS SEGURO? Se borrará TODO el historial, recetas e inventario de este usuario de forma permanente.")) return;
      
      const token = localStorage.getItem("accessToken")
      try {
          const res = await fetch(`${API_URL}/admin/users/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` }
          })
          
          if (res.ok) {
              toast({ title: "Usuario Eliminado", variant: "destructive" })
              fetchUsers()
          } else {
              toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" })
          }
      } catch (error) {
          toast({ title: "Error de Conexión", description: "Intenta más tarde.", variant: "destructive" })
      }
  }

  const toggleExpandUser = (userId: number) => {
      setExpandedUser(expandedUser === userId ? null : userId)
  }

  const filteredUsuarios = users.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.nombreEmpresa && usuario.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalUsuarios = users.length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header y Salir */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Administración</h1>
                    <p className="text-muted-foreground">Control de usuarios registrados en Panely.</p>
                </div>
                <Button variant="outline" onClick={() => {
                    localStorage.clear()
                    router.push("/admin/login")
                }} className="gap-2 border-red-200 text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <LogOut className="h-4 w-4" /> Cerrar Sesión
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de Conexión</AlertTitle>
                    <AlertDescription className="flex items-center gap-4">
                        <span>{error}</span>
                        <Button variant="outline" size="sm" onClick={fetchUsers} className="h-8 bg-white/20 hover:bg-white/30 border-0 text-white">
                            <RefreshCw className="h-3 w-3 mr-2" /> Reintentar
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* SOLO TARJETA DE USUARIOS (Diseño Horizontal más limpio) */}
            <Card className="border-l-4 border-l-blue-600 bg-white dark:bg-card shadow-sm">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Usuarios Registrados</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalUsuarios}</p>
                        </div>
                    </div>
                    {/* Barra de búsqueda integrada a la derecha */}
                    <div className="relative w-full max-w-xs hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Buscador Móvil */}
            <div className="relative md:hidden">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-2 bg-white dark:bg-card"
                />
            </div>

            {/* LISTA DE USUARIOS */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                ) : filteredUsuarios.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No se encontraron usuarios.</p>
                    </div>
                ) : (
                    filteredUsuarios.map((usuario) => (
                        <Card key={usuario.id} className="overflow-hidden transition-all hover:shadow-md border bg-card">
                            <CardContent className="p-0">
                                <div className="p-5 flex flex-col md:flex-row items-start md:items-center gap-6">
                                    
                                    {/* Avatar e Info Principal */}
                                    <div className="flex items-center gap-4 min-w-[250px]">
                                        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border text-lg font-bold text-slate-600 dark:text-slate-300">
                                            {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base">{usuario.nombre} {usuario.apellido}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Store className="h-3 w-3" />
                                                {usuario.nombreEmpresa || "Sin Empresa"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Métricas del Usuario (RESUMEN DE SU ACTIVIDAD) */}
                                    <div className="flex-1 w-full grid grid-cols-3 gap-2 text-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Insumos</p>
                                            <div className="flex items-center justify-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                                                <Package className="h-3 w-3 text-orange-500" />
                                                {usuario.insumos?.length || 0}
                                            </div>
                                        </div>
                                        <div className="border-l border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Recetas</p>
                                            <div className="flex items-center justify-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                                                <ChefHat className="h-3 w-3 text-blue-500" />
                                                {usuario._count?.recetas || 0}
                                            </div>
                                        </div>
                                        <div className="border-l border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Pedidos</p>
                                            <div className="flex items-center justify-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                                                <ShoppingBag className="h-3 w-3 text-green-500" />
                                                {usuario._count?.pedidos || 0}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botones de Acción */}
                                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpandUser(usuario.id)}
                                            className="text-xs"
                                        >
                                            {expandedUser === usuario.id ? "Ocultar" : "Ver"} Detalle
                                            {expandedUser === usuario.id ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => deleteUser(usuario.id)}
                                            title="Eliminar Cuenta"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* DETALLE EXPANDIDO: INVENTARIO */}
                                {expandedUser === usuario.id && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 border-t p-6 animate-in slide-in-from-top-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                                <Package className="h-4 w-4" />
                                                Inventario Actual
                                            </h4>
                                            <span className="text-xs text-muted-foreground">
                                                {usuario.email}
                                            </span>
                                        </div>
                                        
                                        {!usuario.insumos || usuario.insumos.length === 0 ? (
                                            <div className="text-center py-6 text-sm text-muted-foreground italic">
                                                No hay insumos registrados.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {usuario.insumos.map((inv: any) => (
                                                    <div key={inv.id} className="bg-background p-3 rounded border text-sm flex justify-between items-center">
                                                        <div>
                                                            <p className="font-semibold">{inv.nombre}</p>
                                                            <p className="text-xs text-muted-foreground">{inv.presentacion}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant="secondary" className="font-mono">
                                                                {inv.unidadMedida === 'kg' 
                                                                    ? `${(inv.stockGramos / 1000).toFixed(2)} kg` 
                                                                    : `${Math.round(inv.stockGramos)} gr`}
                                                            </Badge>
                                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                                Val: ${Math.round(inv.stockGramos * inv.costoPorGramo).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    </div>
  )
}