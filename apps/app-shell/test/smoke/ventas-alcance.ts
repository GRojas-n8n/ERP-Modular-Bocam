/**
 * Alcance de las peticiones project-scoped que el smoke post-deploy vigila
 * con una sesión sin proyecto activo.
 *
 * Contrato (change fix-clientes-sin-proyecto-y-edicion-rfc, #173): en Ventas,
 * Clientes es catálogo por tenant y es lo ÚNICO que puede consultarse sin
 * proyecto; Cotizaciones, Facturas y cualquier otra ruta de Ventas siguen
 * siendo project-scoped. Por eso la excepción es una coincidencia exacta de
 * método + ruta (la query string no participa porque se compara `pathname`),
 * nunca un prefijo: `/api/v1/ventas/` también cubriría Cotizaciones.
 *
 * Vive fuera del spec de Playwright para poder probar su lógica con Vitest
 * sin credenciales ni producción.
 */

export const PREFIJOS_PROJECT_SCOPED = [
  '/api/v1/gerencia-tecnica/',
  '/api/v1/compras/',
  '/api/v1/almacen/',
  '/api/v1/control-proyectos/',
  '/api/v1/seguridad/',
  '/api/v1/ventas/',
] as const;

/** Única petición project-scoped permitida sin proyecto activo. */
export const PETICION_PERMITIDA_SIN_PROYECTO = {
  method: 'GET',
  pathname: '/api/v1/ventas/clientes',
} as const;

export const AVISO_VENTAS_SIN_PROYECTO = 'Selecciona un proyecto activo para consultar cotizaciones y facturas.';

export interface PeticionObservada {
  method: string;
  url: string;
}

export function pathnameDe(url: string): string {
  return new URL(url, 'https://smoke.invalid').pathname;
}

export function esPeticionClientesPermitida(method: string, url: string): boolean {
  return method.toUpperCase() === PETICION_PERMITIDA_SIN_PROYECTO.method
    && pathnameDe(url) === PETICION_PERMITIDA_SIN_PROYECTO.pathname;
}

/**
 * Peticiones project-scoped observadas que NO están permitidas sin proyecto,
 * con el formato `MÉTODO /ruta` (sin query string, para no filtrar parámetros).
 */
export function peticionesProhibidasSinProyecto(peticiones: PeticionObservada[]): string[] {
  const prohibidas: string[] = [];
  for (const { method, url } of peticiones) {
    const pathname = pathnameDe(url);
    if (!PREFIJOS_PROJECT_SCOPED.some(prefijo => pathname.startsWith(prefijo))) continue;
    if (esPeticionClientesPermitida(method, url)) continue;
    prohibidas.push(`${method.toUpperCase()} ${pathname}`);
  }
  return prohibidas;
}
