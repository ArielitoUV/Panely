import { Router } from 'express';
import { register, login, me } from './authController';
import { authenticateToken } from './authService';
import { getInsumos, createInsumo, deleteInsumo, updateInsumo, getTiposInsumo, getTiposPresentacion } from './insumoController';
import { getRecetas, createReceta, deleteReceta, updateReceta, createPedido, getPedidos } from './recetaController';
import { getCajaDiaria, abrirCaja, cerrarCaja, getHistorialCajas } from './cajaController';
// Importamos registrarEgreso
import { registrarIngreso, getMovimientosHoy, getEgresos, registrarEgreso, getDashboardData } from './finanzasController';

const router = Router();

// ... (Rutas anteriores se mantienen) ...
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);

router.get('/insumos', authenticateToken, getInsumos);
router.get('/insumos/tipos', authenticateToken, getTiposInsumo);
router.get('/insumos/presentaciones', authenticateToken, getTiposPresentacion);
router.post('/insumos', authenticateToken, createInsumo);
router.put('/insumos/:id', authenticateToken, updateInsumo);
router.delete('/insumos/:id', authenticateToken, deleteInsumo);

router.get('/recetas', authenticateToken, getRecetas);
router.post('/recetas', authenticateToken, createReceta);
router.put('/recetas/:id', authenticateToken, updateReceta);
router.delete('/recetas/:id', authenticateToken, deleteReceta);
router.post('/pedidos', authenticateToken, createPedido);
router.get('/pedidos', authenticateToken, getPedidos);

router.get('/caja/hoy', authenticateToken, getCajaDiaria);
router.post('/caja/abrir', authenticateToken, abrirCaja);
router.post('/caja/cerrar', authenticateToken, cerrarCaja);
router.get('/caja/historial', authenticateToken, getHistorialCajas);

// FINANZAS Y DASHBOARD
router.post('/finanzas/ingreso', authenticateToken, registrarIngreso);
router.get('/finanzas/movimientos/hoy', authenticateToken, getMovimientosHoy);
router.post('/finanzas/egreso', authenticateToken, registrarEgreso);
router.get('/finanzas/egresos', authenticateToken, getEgresos);

// RUTA MAESTRA PARA EL DASHBOARD
router.get('/finanzas/dashboard', authenticateToken, getDashboardData); 

export default router;