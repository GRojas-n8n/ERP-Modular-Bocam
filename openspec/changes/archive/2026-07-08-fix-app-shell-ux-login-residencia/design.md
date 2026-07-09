## Context

Son dos fixes pequeños y no relacionados entre sí, agrupados en un solo change por
cerrarse el mismo día de la misma sesión de pruebas. Ninguno requiere diseño
técnico más allá de lo descrito en el proposal.

## Goals / Non-Goals

**Goals:**
- Permitir verificar visualmente la contraseña escrita en el login.
- Que ninguna vista en producción muestre indicadores de "demo" a usuarios reales.

**Non-Goals:**
- No se audita el resto de la aplicación buscando otros posibles badges o textos
  de demo sin guard — se corrige puntualmente el caso encontrado.
- No se agrega mostrar/ocultar contraseña a otros formularios (AdminView,
  MasterView) que también tienen campos de contraseña sin esta función — queda
  como mejora futura, no reportada como bug por ningún usuario todavía.

## Decisions

- **El ícono de mostrar/ocultar contraseña usa `Eye`/`EyeOff` de `lucide-react`**,
  ya usado en el resto del proyecto (consistencia de iconografía) en vez de un SVG
  custom nuevo.
- **El fix de `ResidenciaView.tsx` es un guard mínimo (`{isDemo && ...}`)**, igual
  al patrón ya usado en el resto del mismo archivo — no se refactoriza el
  mecanismo de detección de demo (`tenant?.id === 'iretum-demo'`), solo se aplica
  consistentemente donde faltaba.

## Risks / Trade-offs

- Ninguno relevante — son cambios de UI aislados, sin impacto en datos ni en otros
  módulos.
