import express from 'express';
import dotenv from 'dotenv';
import clienteRoutes from './routes/cliente.routes';

// Cargar variables de entorno (.env)
dotenv.config();

const app = express();

// Middlewares básicos
app.use(express.json());

// Registro de Rutas Modulares
app.use('/api/ventas/clientes', clienteRoutes);

// Ruta de salud (Health Check) para confirmar que el módulo está vivo
app.get('/health', (req, res) => {
  res.json({ status: 'Ventas Module Online', timestamp: new Date() });
});

const PORT = process.env.PORT_VENTAS || 3012;

app.listen(PORT, () => {
  console.log('==============================================');
  console.log(`🚀 ERP BOCAM: Módulo de Ventas activo`);
  console.log(`📡 Puerto: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}/api/ventas/clientes`);
  console.log('==============================================');
});