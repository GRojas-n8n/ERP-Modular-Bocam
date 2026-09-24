## Why

La validación estricta integral del catálogo falla en 128 de 177 elementos. La
mayoría de las especificaciones canónicas conserva un formato anterior o un
propósito placeholder. Mientras esa deuda exista, CI no puede distinguir una
regresión nueva de la línea base histórica y el catálogo no puede funcionar
como contrato confiable del sistema.

## What Changes

- Migrar 96 specs canónicas al formato vigente sin alterar el texto de sus
  requisitos ni escenarios.
- Reemplazar 31 propósitos placeholder mediante revisión por dominio.
- Corregir el delta de Centro de Costos que omite escenarios vigentes.
- Dividir el trabajo en lotes por dominio, cada uno con validación estricta.
- Activar el gate integral en CI únicamente al alcanzar cero fallas.

## Capabilities

### New Capabilities

- `calidad-catalogo-openspec`: garantiza que el catálogo SDD completo sea válido,
  semánticamente revisado y protegido contra regresiones.

### Modified Capabilities

(ninguna funcional; la migración no cambia comportamiento del producto)

## Impact

- Solo documentación OpenSpec y configuración de CI al final.
- Alto volumen de archivos; se divide en PRs pequeños por dominio.
- No se permite reescritura automática de requisitos o escenarios.
