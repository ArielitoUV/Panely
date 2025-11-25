import Link from "next/link"
import { Construction, ArrowRight, UserPlus, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-card border-2 border-primary/20 rounded-full p-8 shadow-lg">
              <Construction className="w-20 h-20 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">Sitio en Construcción</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link href="/auth/registro">
            <Button size="lg" variant="default" className="group w-full sm:w-auto">
              <UserPlus className="mr-2 h-5 w-5" />
              Registro
            </Button>
          </Link>

          <Link href="/auth/iniciar-sesion">
            <Button size="lg" variant="outline" className="group w-full sm:w-auto bg-transparent">
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar Sesión
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="group w-full sm:w-auto">
              Ir al Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
