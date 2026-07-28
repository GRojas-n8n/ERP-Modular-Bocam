# contraste-modo-oscuro-ui-core Specification

## Purpose
TBD - created by archiving change auditoria-contraste-ui-core-modo-oscuro. Update Purpose after archive.
## Requirements
### Requirement: `cn()` de ui-core SHALL resolver conflictos de clases Tailwind por especificidad semántica
La función `cn()` exportada por `packages/ui-core/src/primitives.tsx` SHALL combinar clases usando una utilidad de merge consciente de Tailwind (equivalente a `tailwind-merge`), de forma que cuando dos clases de un mismo grupo de utilidades (color de fondo, color de texto, borde, etc.) están presentes, la última en el orden de los argumentos gane, sin depender del orden de declaración del CSS generado.

#### Scenario: Una className de color pasada por props sobreescribe la clase base del componente
- **WHEN** un consumidor de un componente de `ui-core` (ej. `Button`) pasa una
  `className` con una clase de color de fondo distinta a la variante por defecto
- **THEN** el elemento renderizado usa el color de fondo pasado por props, no el de la
  variante base, sin importar el orden en que Tailwind haya declarado ambas clases en
  el CSS compilado

#### Scenario: Clases no conflictivas se preservan
- **WHEN** un consumidor pasa una `className` que no comparte grupo de utilidad con
  ninguna clase base del componente (ej. `mt-4` sobre un componente sin margen base)
- **THEN** la clase pasada por props se agrega sin eliminar ninguna clase base

### Requirement: Todo componente exportado por ui-core SHALL mantener contraste legible en tema claro y oscuro
Ningún componente exportado por `packages/ui-core/src/primitives.tsx` o `packages/ui-core/src/dashboard/index.tsx` SHALL usar un color de texto o fondo hardcodeado que no responda al tema activo (ej. `text-slate-900` fijo) cuando el proyecto ya tiene tokens de tema (`text-foreground`, `bg-card`, `text-muted-foreground`, etc.) disponibles para ese propósito.

#### Scenario: El título de SideSheet es legible en modo oscuro
- **WHEN** un usuario con el tema oscuro activo abre cualquier `SideSheet`
- **THEN** el título se muestra con un color de texto que contrasta con el fondo oscuro
  del panel, no con el `text-slate-900` fijo previo

#### Scenario: Un componente nuevo de ui-core se agrega al proyecto
- **WHEN** un desarrollador agrega un componente nuevo a `ui-core`
- **THEN** el componente usa tokens de color del tema (no valores de color Tailwind
  hardcodeados) para que se vea correcto en ambos temas sin auditoría adicional

