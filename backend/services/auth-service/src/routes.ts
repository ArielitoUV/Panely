import { Router } from 'express';
import { register, login, me } from './authController';
import { authenticateToken } from './authService';
import { getInsumos, createInsumo, deleteInsumo, updateInsumo, getTiposInsumo, getTiposPresentacion } from './insumoController';
import { getRecetas, createReceta, deleteReceta, updateReceta, createPedido, getPedidos } from './recetaController';
import { getCajaDiaria, abrirCaja, cerrarCaja, getHistorialCajas } from './cajaController';
import { registrarIngreso, getMovimientosHoy, registrarEgreso, getEgresos, getDashboardData } from './finanzasController';
// IMPORTAR ADMIN Y REPORTES
import { getReporte } from './reportesController';
import { adminLogin, getAllUsers, deleteUser } from './adminController'; // <--- IMPORTANTE

const router = Router();

// --- RUTAS PÚBLICAS ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/admin/login', adminLogin); // <--- RUTA DE LOGIN ADMIN

// --- RUTAS PROTEGIDAS (Requieren Token) ---
router.get('/auth/me', authenticateToken, me);

// Insumos
router.get('/insumos', authenticateToken, getInsumos);
router.get('/insumos/tipos', authenticateToken, getTiposInsumo);
router.get('/insumos/presentaciones', authenticateToken, getTiposPresentacion);
router.post('/insumos', authenticateToken, createInsumo);
router.put('/insumos/:id', authenticateToken, updateInsumo);
router.delete('/insumos/:id', authenticateToken, deleteInsumo);

// Recetas
router.get('/recetas', authenticateToken, getRecetas);
router.post('/recetas', authenticateToken, createReceta);
router.put('/recetas/:id', authenticateToken, updateReceta);
router.delete('/recetas/:id', authenticateToken, deleteReceta);

// Pedidos
router.post('/pedidos', authenticateToken, createPedido);
router.get('/pedidos', authenticateToken, getPedidos);

// Caja
router.get('/caja/hoy', authenticateToken, getCajaDiaria);
router.post('/caja/abrir', authenticateToken, abrirCaja);
router.post('/caja/cerrar', authenticateToken, cerrarCaja);
router.get('/caja/historial', authenticateToken, getHistorialCajas);

// Finanzas
router.post('/finanzas/ingreso', authenticateToken, registrarIngreso);
router.get('/finanzas/movimientos/hoy', authenticateToken, getMovimientosHoy);
router.post('/finanzas/egreso', authenticateToken, registrarEgreso);
router.get('/finanzas/egresos', authenticateToken, getEgresos);
router.get('/finanzas/dashboard', authenticateToken, getDashboardData);

// Reportes
router.get('/reportes', authenticateToken, getReporte);

// Panel Admin (Rutas Protegidas de Admin)
router.get('/admin/users', authenticateToken, getAllUsers); 
router.delete('/admin/users/:id', authenticateToken, deleteUser);

export default router;