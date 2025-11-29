import Link from "next/link"
import Image from "next/image"
import { ArrowRight, UserPlus, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="fondo2.png" alt="Panadería Panely" fill className="object-cover" priority />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <nav className="relative z-10 flex justify-end items-center p-6 gap-3">
        <Link href="/auth/registro">
          <Button size="default" variant="default" className="group shadow-lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Registro
          </Button>
        </Link>

        <Link href="/auth/iniciar-sesion">
          <Button
            size="default"
            variant="outline"
            className="group bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-2"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
          </Button>
        </Link>

        <Link href="/dashboard">
          <Button size="default" variant="secondary" className="group shadow-lg">
            Dashboard
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </nav>
      {/* </CHANGE> */}
    </div>
  )
}
