const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RequisicionParaSolicitud {
  tenant_id: string;
  proyecto_id: string;
}

/**
 * Resuelve el proyecto_id que debe escribirse en una SolicitudCotizacion.
 * SIEMPRE viene de la requisición de origen — nunca del proyecto activo de la
 * sesión del usuario, que puede no coincidir (roles tenant-level con varios
 * proyectos) o venir vacío.
 */
export function resolveProyectoIdParaSolicitud(
  requisicion: RequisicionParaSolicitud | null,
  tenantId: string
): string {
  if (!requisicion || requisicion.tenant_id !== tenantId) {
    throw new Error('REQUISICION_NOT_FOUND');
  }

  if (!UUID_PATTERN.test(requisicion.proyecto_id)) {
    throw new Error('REQUISICION_PROYECTO_INVALIDO');
  }

  return requisicion.proyecto_id;
}
