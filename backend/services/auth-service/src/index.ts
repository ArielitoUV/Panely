import express from 'express';
import cors from 'cors'; // Importante para conectar con el frontend
import router from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Configuración de CORS (Permitir que el puerto 3000 hable con el 3001)
app.use(cors({
  origin: true, // Esto acepta cualquier origen automáticamente
  credentials: true
}));

// 2. Permitir recibir JSON
app.use(express.json());

// --- DEBUG: Loguear cada petición que llega ---
app.use((req, res, next) => {
  console.log(`📡 [REQUEST] ${req.method} ${req.url}`);
  next();
});

// 3. Montar las rutas con el prefijo '/api'
// Esto significa que todas las rutas serán: http://localhost:3001/api/...
app.use('/api', router);

// 4. Ruta de prueba para verificar que el servidor vive
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Auth Service' });
});

// --- MANEJO DE ERRORES (Para evitar el error <!DOCTYPE...) ---

// Middleware para 404 (Ruta no encontrada)
app.use((req, res) => {
  console.error(`❌ [404] Ruta no encontrada: ${req.url}`);
  res.status(404).json({ error: 'Ruta no encontrada', path: req.url });
});

// Middleware para 500 (Errores internos)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 [500] Error del servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor', details: err.message });
});

// En backend/services/auth-service/src/index.ts
app.listen(Number(PORT), '0.0.0.0', () => { // <--- Agrega '0.0.0.0'
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});