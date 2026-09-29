import { describe, expect, it } from 'vitest';
import {
  esPeticionClientesPermitida,
  peticionesProhibidasSinProyecto,
  type PeticionObservada,
} from './ventas-alcance';

/**
 * Lógica que decide qué peticiones deja pasar el smoke post-deploy sin proyecto activo.
 * Change fix-clientes-sin-proyecto-y-edicion-rfc: solo GET exacto a /clientes (con o sin query string).
 */
const B = 'https://iretum.com';
const get = (path: string): PeticionObservada => ({ method: 'GET', url: `${B}${path}` });
const con = (method: string, path: string): PeticionObservada => ({ method, url: `${B}${path}` });

describe('smoke › alcance de peticiones sin proyecto activo', () => {
  it('permite únicamente GET exacto a Clientes, con o sin query string', () => {
    expect(peticionesProhibidasSinProyecto([get('/api/v1/ventas/clientes')])).toEqual([]);
    expect(peticionesProhibidasSinProyecto([get('/api/v1/ventas/clientes?limit=50&q=abc')])).toEqual([]);
    expect(esPeticionClientesPermitida('get', `${B}/api/v1/ventas/clientes`)).toBe(true);
  });

  it('prohíbe Cotizaciones y Facturas (falla si salen peticiones sin proyecto)', () => {
    expect(peticionesProhibidasSinProyecto([get('/api/v1/ventas/cotizaciones')])).toEqual(['GET /api/v1/ventas/cotizaciones']);
    expect(peticionesProhibidasSinProyecto([get('/api/v1/ventas/facturas?estatus=PENDIENTE')])).toEqual(['GET /api/v1/ventas/facturas']);
    expect(peticionesProhibidasSinProyecto([con('POST', '/api/v1/ventas/cotizaciones/abc/aceptar')])).toEqual(['POST /api/v1/ventas/cotizaciones/abc/aceptar']);
  });

  it('la excepción no se extiende a otras rutas ni métodos de Clientes', () => {
    for (const p of [
      con('POST', '/api/v1/ventas/clientes'),
      con('PUT', '/api/v1/ventas/clientes/abc'),
      con('POST', '/api/v1/ventas/clientes/importar-lote'),
      get('/api/v1/ventas/clientes/abc'),
      get('/api/v1/ventas/clientes/'),
      get('/api/v1/ventas/clientes-otros'),
      get('/api/v1/ventas/otra-ruta'),
    ]) {
      expect(peticionesProhibidasSinProyecto([p]), `${p.method} ${p.url}`).toHaveLength(1);
    }
  });

  it('no se deja engañar por una query string que imita la ruta permitida', () => {
    expect(peticionesProhibidasSinProyecto([get('/api/v1/ventas/cotizaciones?x=/api/v1/ventas/clientes')])).toHaveLength(1);
  });

  it('el resto de módulos project-scoped sigue sin permitir ninguna petición', () => {
    const rutas = [
      '/api/v1/gerencia-tecnica/presupuestos', '/api/v1/compras/ordenes', '/api/v1/almacen/inventario',
      '/api/v1/control-proyectos/dashboard', '/api/v1/seguridad/incidentes',
    ];
    expect(peticionesProhibidasSinProyecto(rutas.map(get))).toHaveLength(rutas.length);
    // /api/v1/compras/proveedores tampoco se exime: el smoke no clasifica excepciones de otros módulos.
    expect(peticionesProhibidasSinProyecto([get('/api/v1/compras/proveedores')])).toHaveLength(1);
  });

  it('ignora rutas que no son project-scoped (auth, estáticos)', () => {
    expect(peticionesProhibidasSinProyecto([get('/api/v1/auth/login'), get('/assets/app.js'), get('/')])).toEqual([]);
  });

  it('no incluye la query string en el reporte (evita filtrar parámetros)', () => {
    expect(peticionesProhibidasSinProyecto([get('/api/v1/ventas/facturas?token=secreto')])).toEqual(['GET /api/v1/ventas/facturas']);
  });
});
