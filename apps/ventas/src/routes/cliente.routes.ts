import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';

const router = Router();
const clienteController = new ClienteController();

// POST: /api/ventas/clientes (Para crear un nuevo cliente)
router.post('/', (req, res) => clienteController.crear(req, res));

// GET: /api/ventas/clientes/:tenantId (Para listar clientes de un negocio específico)
router.get('/:tenantId', (req, res) => clienteController.listar(req, res));

export default router;