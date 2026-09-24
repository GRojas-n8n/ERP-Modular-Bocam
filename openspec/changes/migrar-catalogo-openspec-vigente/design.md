## Context

Baseline estricto del 2026-09-24: 155 specs canónicas, 28 válidas y 127
inválidas; 22 changes activos, 21 válidos y uno inválido. Las fallas se agrupan
en 96 specs sin secciones canónicas, 31 propósitos placeholder y un delta que
omite escenarios.

## Decisions

### 1. Migración estructural y revisión semántica son trabajos distintos

Los encabezados antiguos pueden transformarse mecánicamente si una comparación
normalizada demuestra que requisitos y escenarios no cambiaron. Los propósitos
requieren revisión humana porque resumen el contrato funcional.

### 2. Lotes por dominio

Cada PR abarca un dominio coherente, ejecuta validación estricta y adjunta una
comparación antes/después. No se crea un único PR de 127 archivos.

### 3. Gate al final, no allowlist permanente

Durante la migración se publica el conteo restante. Cuando llegue a cero, CI
ejecuta `openspec validate --all --strict` como gate obligatorio, sin una lista
de excepciones heredadas.

### 4. El change inválido se corrige de forma conservadora

Los escenarios existentes de `centro-costos-alta` se copian al bloque
`MODIFIED`; ningún escenario se elimina durante el archivo.

## Risks / Trade-offs

- Un formateo masivo puede ocultar cambios semánticos; se mitiga comparando la
  estructura normalizada y limitando cada PR.
- Los propósitos derivados pueden interpretar mal el dominio; requieren revisión
  humana del responsable funcional.
- Activar el gate demasiado pronto bloquearía todos los PR; se activa al final.
