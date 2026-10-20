/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Clasificación: Estrictamente Confidencial.
 * ---------------------------------------------------------------------------
 * Catálogo canónico de roles del ERP.
 *
 * Única fuente de verdad de qué roles existen. Lo consumen:
 * - `apps/auth` para validar el alta y edición de usuarios (Zod).
 * - `apps/app-shell` para el selector de roles de Administración.
 * - El test guardián `roles-catalogo.test.ts`, que recorre todos los
 *   `apps/…/src/*.ts` y falla si un servicio exige un rol que no está aquí.
 *
 * Sin paquete compartido, el selector de alta de usuarios y los `requireRoles`
 * de los 13 servicios derivaron por separado: llegó a haber roles exigidos por
 * el backend que no se podían asignar desde la interfaz (no había forma de dar
 * de alta un almacenista), y roles asignables que no abrían ningún endpoint.
 *
 * Este módulo NO tiene dependencias a propósito — lo importan tanto servicios
 * Express como el bundle del navegador.
 * ---------------------------------------------------------------------------
 */

/** Cómo se comporta un rol frente al alta de usuarios. */
export type EstadoRol =
  /** Asignable desde Administración. El caso normal. */
  | 'asignable'
  /**
   * Sinónimo histórico de otro rol, aún exigido por algunos `requireRoles`.
   * Se acepta en un JWT existente pero NO se ofrece al crear usuarios nuevos:
   * asignarlo produciría accesos distintos según el endpoint.
   */
  | 'alias'
  /**
   * Reconocido pero sin endpoints propios todavía. Asignarlo hoy deja al
   * usuario viendo su módulo en el menú y recibiendo 403 en cada llamada.
   */
  | 'sin-backend';

export interface DefinicionRol {
  id: string;
  /** Etiqueta que ve el administrador. */
  label: string;
  estado: EstadoRol;
  /** Para `alias`: el rol canónico que debería usarse en su lugar. */
  canonico?: string;
  /** Por qué está en este estado. Se muestra como ayuda en el selector. */
  nota?: string;
}

export const ROLES: readonly DefinicionRol[] = [
  // ── Transversales ────────────────────────────────────────────────────────
  { id: 'admin',            label: 'Administrador',           estado: 'asignable' },
  { id: 'superintendent',   label: 'Superintendencia',        estado: 'asignable' },
  {
    id: 'director',
    label: 'Dirección',
    estado: 'asignable',
    nota: 'Acceso de lectura a Finanzas y Control de Proyectos.',
  },

  // ── Por módulo ───────────────────────────────────────────────────────────
  { id: 'procurement',      label: 'Compras',                 estado: 'asignable' },
  { id: 'gerencia_tecnica', label: 'Gerencia Técnica',        estado: 'asignable' },
  { id: 'residencia',       label: 'Residencia de Obra',      estado: 'asignable' },
  { id: 'control_obra',     label: 'Control de Obra',         estado: 'asignable' },
  {
    id: 'control_proyectos',
    label: 'Control de Proyectos',
    estado: 'asignable',
    nota: 'Programación, EVM y alertas. Distinto de Control de Obra.',
  },
  { id: 'finanzas',         label: 'Finanzas',                estado: 'asignable' },
  { id: 'personal_rh',      label: 'Personal / RH',           estado: 'asignable' },
  { id: 'calidad',          label: 'Calidad / SGC',           estado: 'asignable' },
  {
    id: 'warehouse',
    label: 'Almacén',
    estado: 'asignable',
    nota: 'Inventario, movimientos y activos fijos.',
  },

  // ── Reconocidos pero sin endpoints propios ───────────────────────────────
  // Los módulos existen en el menú, pero sus servicios exigen otros roles.
  // Asignarlos hoy produce 403 en todas las llamadas del módulo.
  {
    id: 'contabilidad',
    label: 'Contabilidad',
    estado: 'sin-backend',
    nota: 'El servicio de Contabilidad exige admin o finanzas; este rol todavía no abre nada.',
  },
  {
    id: 'seguridad_hse',
    label: 'Seguridad HSE',
    estado: 'sin-backend',
    nota: 'El servicio de Seguridad todavía no comprueba este rol en sus endpoints.',
  },
  {
    id: 'ventas',
    label: 'Ventas',
    estado: 'sin-backend',
    nota: 'El servicio de Ventas solo comprueba admin por ahora.',
  },
] as const;

/** Todos los ids reconocidos, incluidos alias y los que aún no abren nada. */
export const ROLES_VALIDOS: readonly string[] = ROLES.map(r => r.id);

/** Los que se ofrecen al crear o editar un usuario. */
export const ROLES_ASIGNABLES: readonly DefinicionRol[] = ROLES.filter(
  r => r.estado === 'asignable' || r.estado === 'sin-backend'
);

export function esRolValido(id: string): boolean {
  return ROLES_VALIDOS.includes(id);
}

export function definicionDeRol(id: string): DefinicionRol | undefined {
  return ROLES.find(r => r.id === id);
}

/** Etiqueta legible; devuelve el id crudo si el rol no está catalogado. */
export function etiquetaDeRol(id: string): string {
  return definicionDeRol(id)?.label ?? id;
}
