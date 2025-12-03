import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, LogIn, UserPlus, LayoutDashboard } from "lucide-react"

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-background">
      
      {/* --- IMAGEN DE FONDO --- */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/fondo-principal.png" // Asegúrate de que esta imagen exista en la carpeta public
          alt="Panadería Panely" 
          fill 
          className="object-cover" 
          priority 
        />
        {/* Capa oscura para mejorar la lectura del texto blanco */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* --- HEADER (BOTONES CENTRADOS) --- */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-center px-4">
          
          <nav className="flex gap-4 items-center">
            <Link href="/auth/registro">
              <Button size="default" className="bg-orange-600 hover:bg-orange-700 gap-2 text-white font-medium shadow-lg border-0">
                <UserPlus className="h-4 w-4" />
                Registro
              </Button>
            </Link>

            <Link href="/auth/iniciar-sesion">
              <Button 
                size="default" 
                variant="outline"
                className="gap-2 font-medium bg-white/10 hover:bg-white/20 text-white border-white/50 backdrop-blur-sm"
              >
                <LogIn className="h-4 w-4" />
                Iniciar Sesión
              </Button>
            </Link>

            {/* Botón Dashboard (Visible siempre o condicionalmente si quisieras) */}
            <Link href="/dashboard">
               <Button size="default" variant="secondary" className="gap-2 shadow-lg bg-white/90 text-black hover:bg-white hidden sm:flex">
                 <LayoutDashboard className="h-4 w-4" />
                 Dashboard
               </Button>
            </Link>
          </nav>

        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL (ALINEADO A LA IZQUIERDA) --- */}
      <main className="flex-1 flex items-center relative z-10 container mx-auto px-6 md:px-12">
        <div className="flex flex-col items-start text-left space-y-6 max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
          
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-orange-500/30 px-3 py-1 text-sm font-medium transition-colors bg-black/40 text-orange-300 backdrop-blur-sm shadow-sm">
            🚀 Gestión Inteligente para Panaderías
          </div>
          
          {/* Título */}
          <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl text-white pb-2 drop-shadow-xl">
            Tu Panadería,<br /> 
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Bajo Control.</span>
          </h1>
          
          {/* Descripción */}
          <p className="text-gray-200 text-lg md:text-xl leading-relaxed drop-shadow-md max-w-lg">
            Administra insumos, calcula costos de recetas y controla tu caja diaria. Todo en una sola plataforma diseñada para tu panaderia.
          </p>
          
          {/* Botones de Acción (CTA) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <Link href="/auth/registro">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-orange-600 hover:bg-orange-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-white font-bold">
                Comenzar Gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/iniciar-sesion">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 border-white/50 bg-black/30 text-white hover:bg-white/20 hover:text-white hover:border-white shadow-lg backdrop-blur-sm">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>

        </div>
      </main>

      {/* --- FOOTER (FIJO) --- */}
      <footer className="py-4 border-t border-white/10 bg-black/40 backdrop-blur-sm relative z-10 text-white/70">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
          <p className="text-center text-xs md:text-sm">
            © 2025 Panely. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs md:text-sm">
            <Link href="#" className="hover:text-white transition-colors">Términos</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-white transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}