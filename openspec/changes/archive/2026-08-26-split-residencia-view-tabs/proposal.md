## Why

`apps/app-shell/src/views/ResidenciaView.tsx` tiene 3311 líneas y concentra los 5 tabs del módulo de Residencia (`estimaciones`, `nomina`, `asistencia`, `equipo`, `requisiciones`) en un único componente/archivo. Con el piloto en marcha, un fix urgente en un tab obliga a tocar el mismo archivo que los otros cuatro, arrastrando riesgo de romper tabs que no tienen relación con el bug. Separar el archivo por tab aísla ese riesgo antes de que empiecen a llegar bugs de campo.

## What Changes

- Extraer el contenido de cada uno de los 5 tabs de `ResidenciaView.tsx` a su propio archivo bajo `apps/app-shell/src/views/residencia/` (uno por tab: estimaciones, nómina, asistencia, equipo, requisiciones).
- `ResidenciaView.tsx` queda como orquestador delgado: mantiene el layout compartido (header, navegación de tabs, `HelpPanel`, diálogos globales) y selecciona qué tab renderizar según `activeSubView`, igual que hoy.
- Mover tipos y utilidades usadas por más de un tab a un módulo compartido (`residencia/shared.ts` o similar); lo que sea propio de un solo tab se mueve junto con ese tab.
- **Solo reorganización estructural.** Ningún cambio de comportamiento, rutas, contratos de API, textos de UI, ni lógica de negocio. Es refactor puro de un archivo legacy — no toca lógica.
- El named export `ResidenciaView` (`React.FC<{ activeSubView?: string }>`) se mantiene exactamente igual para no romper el import existente en `App.tsx` ni en los tests que ya cubren este archivo.

## Capabilities

### New Capabilities
- `residencia-view-modularizacion-por-tab`: estructura del código de la vista de Residencia dividida en un módulo por tab, para aislar el blast radius de un fix a un solo tab.

### Modified Capabilities
(ninguna — no cambian requisitos de comportamiento observable, solo la organización interna del código)

## Impact

- **Código afectado:** `apps/app-shell/src/views/ResidenciaView.tsx` (legacy, ~3311 líneas) y sus 6 tests existentes (`ResidenciaView.*.test.tsx`), que importan `{ ResidenciaView } from './ResidenciaView'` y deben seguir pasando sin modificación de aserciones.
- **Nuevos archivos:** `apps/app-shell/src/views/residencia/{EstimacionesTab,NominaTab,AsistenciaTab,EquipoTab,RequisicionesTab}.tsx` + módulo(s) compartido(s) de tipos/helpers.
- **Sin impacto** en backend, rutas de API, otros microservicios, ni en otras vistas (`App.tsx` solo necesita seguir resolviendo `./views/ResidenciaView`).
- **Riesgo a mitigar en la implementación:** el archivo actual comparte hooks/estado de React entre tabs (ver `activeTab`, efectos con dependencias cruzadas). Cualquier estado realmente compartido entre tabs debe quedarse en el orquestador y pasarse como props explícitas a los tabs que lo necesiten — no se debe duplicar ni asumir independencia de estado que hoy no existe.
