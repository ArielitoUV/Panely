import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Obtener la ruta actual
  const path = request.nextUrl.pathname

  // 2. Definir rutas públicas (que no requieren login)
  const isPublicPath = path === '/' || path.startsWith('/auth') || path.startsWith('/_next') || path.startsWith('/static') || path.includes('.')

  // 3. Verificar si hay token (en una cookie o header - simplificado para demo localStorage)
  // NOTA: Next.js middleware corre en el servidor/edge, no tiene acceso directo a localStorage.
  // Para una defensa rápida y efectiva, la validación real la hace el layout del dashboard.
  // Pero podemos hacer una redirección básica si intentan acceder a rutas protegidas.
  
  // Como estamos usando localStorage para guardar el token (práctica común en SPAs simples), 
  // el middleware de servidor no puede leerlo.
  // ESTRATEGIA ALTERNATIVA PARA DEFENSA: 
  // Usaremos un componente "AuthGuard" en el layout del dashboard.
  
  return NextResponse.next()
}

// Configuración de rutas a las que aplica (opcional si usas la estrategia de componente)
export const config = {
  matcher: ['/dashboard/:path*'],
}