import { Request, Response } from 'express';
import { ClienteService } from '../services/cliente.service';

const clienteService = new ClienteService();

export class ClienteController {
  
  async crear(req: Request, res: Response) {
    try {
      // Extraemos los datos del cuerpo de la petición (body)
      const nuevoCliente = await clienteService.crearCliente(req.body);
      
      // Si todo sale bien, respondemos con un 201 (Creado)
      return res.status(201).json({
        success: true,
        data: nuevoCliente,
        message: 'Cliente registrado exitosamente en Bocam'
      });
    } catch (error: any) {
      // Si hay error (ej: RFC duplicado), respondemos con 400
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const clientes = await clienteService.listarClientes(tenantId);
      
      return res.json({
        success: true,
        data: clientes
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener los clientes'
      });
    }
  }
}