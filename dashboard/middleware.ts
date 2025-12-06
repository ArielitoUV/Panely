import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Obtener la ruta actual
  const path = request.nextUrl.pathname

  // 2. Definir rutas públicas (que no requieren login)
  const isPublicPath = path === '/' || path.startsWith('/auth') || path.startsWith('/_next') || path.startsWith('/static') || path.includes('.')
  
  return NextResponse.next()
}

// Configuración de rutas a las que aplica (opcional si usas la estrategia de componente)
export const config = {
  matcher: ['/dashboard/:path*'],
}