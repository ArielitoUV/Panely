import { Router } from 'express';
import { register, login, me } from './authController';
import { authenticateToken } from './authService';

// Importamos todos los controladores necesarios
import { getInsumos, createInsumo, deleteInsumo } from './insumoController';
import { getRecetas, createReceta, deleteReceta, createPedido } from './recetaController';
import { getCajaDiaria, abrirCaja, cerrarCaja, getHistorialCajas } from './cajaController';
import { registrarIngreso, getMovimientosHoy } from './finanzasController'; // <--- IMPORTAR ESTO

const router = Router();

// --- AUTH ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);

// --- INSUMOS ---
router.get('/insumos', authenticateToken, getInsumos);
router.post('/insumos', authenticateToken, createInsumo);
router.delete('/insumos/:id', authenticateToken, deleteInsumo);

// --- RECETAS ---
router.get('/recetas', authenticateToken, getRecetas);
router.post('/recetas', authenticateToken, createReceta);
router.delete('/recetas/:id', authenticateToken, deleteReceta);
router.post('/pedidos', authenticateToken, createPedido);

// --- CAJA (Gestión) ---
router.get('/caja/hoy', authenticateToken, getCajaDiaria);
router.post('/caja/abrir', authenticateToken, abrirCaja);
router.post('/caja/cerrar', authenticateToken, cerrarCaja);
router.get('/caja/historial', authenticateToken, getHistorialCajas);

// --- FINANZAS (Movimientos Diarios) ---
// Estas son las rutas que usará tu página de Ingresos
router.post('/finanzas/ingreso', authenticateToken, registrarIngreso);
router.get('/finanzas/movimientos/hoy', authenticateToken, getMovimientosHoy);

export default router;