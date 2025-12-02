import { Router } from 'express';
import { register, login, me } from './authController';
import { authenticateToken } from './authService';

import { 
  getInsumos, 
  createInsumo, 
  deleteInsumo 
} from './insumoController';

import { 
  getRecetas, 
  createReceta, 
  deleteReceta,
  createPedido 
} from './recetaController';

import { 
  getCajaDiaria, 
  abrirCaja, 
  cerrarCaja, 
  registrarMovimiento, 
  getHistorialCajas 
} from './cajaController';

const router = Router();

// --- Auth ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);

// --- Insumos ---
router.get('/insumos', authenticateToken, getInsumos);
router.post('/insumos', authenticateToken, createInsumo);
router.delete('/insumos/:id', authenticateToken, deleteInsumo);

// --- Recetas ---
router.get('/recetas', authenticateToken, getRecetas);
router.post('/recetas', authenticateToken, createReceta);
router.delete('/recetas/:id', authenticateToken, deleteReceta);

// --- Pedidos ---
router.post('/pedidos', authenticateToken, createPedido);

// --- Caja ---
router.get('/caja/hoy', authenticateToken, getCajaDiaria);
router.post('/caja/abrir', authenticateToken, abrirCaja);
router.post('/caja/cerrar', authenticateToken, cerrarCaja);
router.post('/caja/movimiento', authenticateToken, registrarMovimiento);
router.get('/caja/historial', authenticateToken, getHistorialCajas);

export default router;