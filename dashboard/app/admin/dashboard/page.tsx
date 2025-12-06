"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Package, Search, Eye, Trash2, ChevronDown, ChevronUp, LogOut, Loader2, RefreshCw, AlertCircle, Store } from "lucide-react"
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

  // Filtrado de usuarios
  const filteredUsuarios = users.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.nombreEmpresa && usuario.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Estadísticas
  const totalUsuarios = users.length
  const totalInsumosGlobal = users.reduce((acc, u) => acc + (u.insumos?.length || 0), 0)
  const totalRecetasGlobal = users.reduce((acc, u) => acc + (u._count?.recetas || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Superior */}
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Panel de Administración</h1>
                    <p className="text-muted-foreground">Gestiona usuarios y supervisa inventarios.</p>
                </div>
                <Button variant="outline" onClick={() => {
                    localStorage.clear()
                    router.push("/admin/login")
                }} className="gap-2 border-red-200 text-red-700 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> Salir
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-blue-100 dark:border-blue-900 bg-white dark:bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                                <p className="text-4xl font-bold mt-2 text-blue-600">{totalUsuarios}</p>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-100 dark:border-orange-900 bg-white dark:bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Insumos Registrados</p>
                                <p className="text-4xl font-bold mt-2 text-orange-600">{totalInsumosGlobal}</p>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Package className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-100 dark:border-green-900 bg-white dark:bg-card">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Recetas Creadas</p>
                                <p className="text-4xl font-bold mt-2 text-green-600">{totalRecetasGlobal}</p>
                            </div>
                            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Store className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre, email o empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-2 bg-white dark:bg-card"
                />
            </div>

            {/* Users List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : filteredUsuarios.length === 0 ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="py-12">
                            <div className="text-center text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="text-lg">No se encontraron usuarios</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredUsuarios.map((usuario) => (
                        <Card key={usuario.id} className="border-2 overflow-hidden transition-all hover:shadow-md">
                            {/* User Header */}
                            <CardContent className="p-0">
                                <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-white dark:bg-card">
                                    <div className="flex items-center gap-6 flex-1 w-full">
                                        <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                            <span className="text-xl font-bold text-slate-600 dark:text-slate-300">
                                                {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="text-lg font-bold text-foreground">{usuario.nombre} {usuario.apellido}</h3>
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    ID: {usuario.id}
                                                </Badge>
                                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300">
                                                    Activo
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <p>{usuario.email}</p>
                                                <p className="font-medium text-foreground flex items-center gap-1">
                                                    <Store className="h-3 w-3" /> {usuario.nombreEmpresa || "Sin Empresa"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="hidden md:block text-center px-6 border-l-2">
                                            <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Insumos</p>
                                            <p className="text-2xl font-black text-primary">{usuario.insumos?.length || 0}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleExpandUser(usuario.id)}
                                            className={`border ${expandedUser === usuario.id ? 'bg-muted' : ''}`}
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            {expandedUser === usuario.id ? "Ocultar" : "Ver"} Inventario
                                            {expandedUser === usuario.id ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-9 w-9"
                                            onClick={() => deleteUser(usuario.id)}
                                            title="Eliminar Usuario"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Inventarios Expandidos */}
                                {expandedUser === usuario.id && (
                                    <div className="border-t bg-slate-50/50 dark:bg-slate-950/50 p-6 animate-in slide-in-from-top-2 duration-200">
                                        <h4 className="text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                            <Package className="h-4 w-4" />
                                            Inventario Detallado
                                        </h4>
                                        
                                        {!usuario.insumos || usuario.insumos.length === 0 ? (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                                <p className="text-muted-foreground">El usuario no tiene insumos registrados.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {usuario.insumos.map((inv: any) => (
                                                    <div key={inv.id} className="bg-white dark:bg-card p-4 rounded-lg border shadow-sm flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="font-bold text-base line-clamp-1" title={inv.nombre}>{inv.nombre}</p>
                                                                <Badge variant="outline" className="text-[10px] px-1 h-5">{inv.presentacion}</Badge>
                                                            </div>
                                                            <div className="flex items-baseline gap-1 text-sm text-muted-foreground mb-1">
                                                                <span>Stock:</span>
                                                                <span className="font-semibold text-foreground">
                                                                    {inv.unidadMedida === 'kg' 
                                                                        ? `${(inv.stockGramos / 1000).toFixed(2)} kg` 
                                                                        : `${inv.stockGramos} gr`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="border-t mt-3 pt-2 flex justify-between items-end">
                                                            <div className="text-xs text-muted-foreground">
                                                                <p>Costo Base</p>
                                                                <p>${inv.costoPorGramo.toFixed(2)} / gr</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs text-muted-foreground">Valor Total Stock</p>
                                                                <p className="font-bold text-green-600">
                                                                    ${Math.round(inv.stockGramos * inv.costoPorGramo).toLocaleString()}
                                                                </p>
                                                            </div>
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