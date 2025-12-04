import { Router } from 'express';
import { register, login, me } from './authController';
import { authenticateToken } from './authService';

// Importar getTiposPresentacion y updateInsumo
import { 
    getInsumos, 
    createInsumo, 
    deleteInsumo, 
    updateInsumo, 
    getTiposInsumo, 
    getTiposPresentacion 
} from './insumoController';

import { getRecetas, createReceta, deleteReceta, updateReceta, createPedido } from './recetaController';
import { getCajaDiaria, abrirCaja, cerrarCaja, getHistorialCajas } from './cajaController';
import { registrarIngreso, getMovimientosHoy } from './finanzasController';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);

// Insumos
router.get('/insumos', authenticateToken, getInsumos);
router.get('/insumos/tipos', authenticateToken, getTiposInsumo);
router.get('/insumos/presentaciones', authenticateToken, getTiposPresentacion); // <--- NUEVA
router.post('/insumos', authenticateToken, createInsumo);
router.put('/insumos/:id', authenticateToken, updateInsumo); // <--- NUEVA (Modificar)
router.delete('/insumos/:id', authenticateToken, deleteInsumo);

// Recetas
router.get('/recetas', authenticateToken, getRecetas);
router.post('/recetas', authenticateToken, createReceta);
router.put('/recetas/:id', authenticateToken, updateReceta);
router.delete('/recetas/:id', authenticateToken, deleteReceta);
router.post('/pedidos', authenticateToken, createPedido);

// Caja
router.get('/caja/hoy', authenticateToken, getCajaDiaria);
router.post('/caja/abrir', authenticateToken, abrirCaja);
router.post('/caja/cerrar', authenticateToken, cerrarCaja);
router.get('/caja/historial', authenticateToken, getHistorialCajas);

// Finanzas
router.post('/finanzas/ingreso', authenticateToken, registrarIngreso);
router.get('/finanzas/movimientos/hoy', authenticateToken, getMovimientosHoy);

export default router;