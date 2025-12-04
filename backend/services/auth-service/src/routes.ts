import { Router } from 'express';
import { register, login, me } from './authController';
import { authenticateToken } from './authService';

import { getInsumos, createInsumo, deleteInsumo } from './insumoController';
// Importamos updateReceta
import { getRecetas, createReceta, deleteReceta, updateReceta, createPedido } from './recetaController';
import { getCajaDiaria, abrirCaja, cerrarCaja, registrarMovimiento, getHistorialCajas } from './cajaController';

const router = Router();

// ... (Auth e Insumos igual que antes) ...
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);

router.get('/insumos', authenticateToken, getInsumos);
router.post('/insumos', authenticateToken, createInsumo);
router.delete('/insumos/:id', authenticateToken, deleteInsumo);

// --- RECETAS ACTUALIZADAS ---
router.get('/recetas', authenticateToken, getRecetas);
router.post('/recetas', authenticateToken, createReceta);
router.put('/recetas/:id', authenticateToken, updateReceta); // <--- NUEVA
router.delete('/recetas/:id', authenticateToken, deleteReceta);

router.post('/pedidos', authenticateToken, createPedido);

// ... (Caja igual que antes) ...
router.get('/caja/hoy', authenticateToken, getCajaDiaria);
router.post('/caja/abrir', authenticateToken, abrirCaja);
router.post('/caja/cerrar', authenticateToken, cerrarCaja);
router.post('/caja/movimiento', authenticateToken, registrarMovimiento);
router.get('/caja/historial', authenticateToken, getHistorialCajas);

export default router;