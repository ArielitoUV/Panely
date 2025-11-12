import { TrendingDown, Construction } from "lucide-react"

export default function EgresosPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-8">
              <TrendingDown className="w-16 h-16 text-primary mx-auto" />
              <Construction className="w-8 h-8 text-secondary absolute -bottom-2 -right-2 bg-card border-2 border-border rounded-full p-1" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Egresos</h1>
          <p className="text-lg text-muted-foreground">Esta sección está en construcción</p>
          <p className="text-sm text-muted-foreground/80">Pronto podrás registrar y gestionar todos tus egresos</p>
        </div>

        <div className="pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Próximamente</span>
          </div>
        </div>
      </div>
    </div>
  )
}
