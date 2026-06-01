// -----------------------------------------------------------------------------
// Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
// Módulo: Calidad — Tipos, Enums y Constantes
// -----------------------------------------------------------------------------

export const TIPOS_DOCUMENTO = ['PLANO', 'PROCEDIMIENTO', 'INSTRUCTIVO', 'ESPECIFICACION', 'MANUAL', 'REGISTRO', 'OTRO'] as const;
export type TipoDocumento = typeof TIPOS_DOCUMENTO[number];

export const ESTADOS_DOCUMENTO = ['BORRADOR', 'EN_REVISION', 'VIGENTE', 'OBSOLETO'] as const;
export type EstadoDocumento = typeof ESTADOS_DOCUMENTO[number];

export const ACCIONES_VERSION = ['enviar_revision', 'aprobar', 'rechazar', 'obsoleto'] as const;
export type AccionVersion = typeof ACCIONES_VERSION[number];

// Transiciones válidas: estado_actual → accion → estado_siguiente
export const TRANSICIONES: Record<string, Record<string, string>> = {
  BORRADOR:    { enviar_revision: 'EN_REVISION' },
  EN_REVISION: { aprobar: 'VIGENTE', rechazar: 'BORRADOR' },
  VIGENTE:     { obsoleto: 'OBSOLETO' },
  OBSOLETO:    {},
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const EXTENSIONES_PERMITIDAS = ['.pdf', '.dwg', '.dxf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'];

export const MIME_PERMITIDOS: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.dwg':  'image/vnd.dwg',
  '.dxf':  'image/vnd.dxf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
};
