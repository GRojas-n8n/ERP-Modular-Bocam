import { describe, expect, it } from 'vitest';
import { leerColumnaCsv } from './csvImport';

/**
 * Ver openspec/changes/normalizar-encabezados-carga-masiva. Reproduce el
 * bug real de producción (2026-07-13, importación de 51 clientes): un
 * encabezado natural en español ("RAZÓN SOCIAL") nunca emparejaba con el
 * alias interno (razon_social) porque la comparación anterior era exacta
 * (solo trim + minúsculas, sin quitar acentos ni tratar espacios como
 * guion bajo) — todas las filas se marcaban en error por falta de dato,
 * aunque el Excel sí lo traía.
 */

describe('leerColumnaCsv', () => {
  it('reproduce el bug real de producción: "RAZÓN SOCIAL" empareja con razon_social', () => {
    const row = { 'RAZÓN SOCIAL': 'Constructora Bocam SA de CV', RFC: 'ABC010101AAA' };

    expect(leerColumnaCsv(row, 'razon_social', 'nombre')).toBe('Constructora Bocam SA de CV');
  });

  it('encabezado con palabra conectora ("Fecha de Ingreso") empareja con fecha_ingreso', () => {
    const row = { 'Fecha de Ingreso': '2026-01-15' };

    expect(leerColumnaCsv(row, 'fecha_ingreso')).toBe('2026-01-15');
  });

  it('encabezado sin ninguna coincidencia real no empareja (sin falsos positivos)', () => {
    const row = { 'Compañía': 'Constructora Bocam' };

    expect(leerColumnaCsv(row, 'razon_social', 'nombre')).toBe('');
  });

  it('respeta "primer match gana" cuando el archivo trae ambos alias', () => {
    const row = { razon_social: 'Valor A', nombre: 'Valor B' };

    expect(leerColumnaCsv(row, 'razon_social', 'nombre')).toBe('Valor A');
  });

  it('sigue funcionando con el encabezado snake_case exacto (sin regresión)', () => {
    const row = { rfc_tax_id: 'ABC010101AAA' };

    expect(leerColumnaCsv(row, 'rfc_tax_id', 'rfc')).toBe('ABC010101AAA');
  });

  it('acepta el alias corto también con mayúsculas/acentos', () => {
    const row = { 'Código': '001' };

    expect(leerColumnaCsv(row, 'codigo_cliente', 'codigo')).toBe('001');
  });
});
