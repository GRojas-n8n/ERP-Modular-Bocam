## ADDED Requirements

### Requirement: Cada tab de Residencia vive en su propio archivo
El código fuente de la vista de Residencia SHALL organizarse con un archivo de componente independiente por tab (`estimaciones`, `nomina`, `asistencia`, `equipo`, `requisiciones`) bajo `apps/app-shell/src/views/residencia/`, en vez de concentrarse en un único archivo.

#### Scenario: Ubicación del código de un tab
- **WHEN** se necesita modificar la lógica o el render del tab `asistencia`
- **THEN** el cambio se hace en `apps/app-shell/src/views/residencia/AsistenciaTab.tsx`, sin editar el archivo de ningún otro tab

#### Scenario: Estado y efectos propios de cada tab
- **WHEN** un tab carga sus datos (por ejemplo, `equipo` carga `equipoPorCategoria` al activarse)
- **THEN** ese estado (`useState`) y ese efecto (`useEffect`) de carga viven dentro del archivo de ese tab, no en el orquestador ni en el archivo de otro tab

### Requirement: `ResidenciaView` mantiene su contrato público sin cambios
El componente exportado `ResidenciaView` SHALL seguir siendo un `React.FC<{ activeSubView?: string }>` exportado con nombre (`export const ResidenciaView`) desde `apps/app-shell/src/views/ResidenciaView.tsx`, y SHALL producir exactamente el mismo comportamiento observable (render, llamadas a API, textos) que antes de la modularización.

#### Scenario: Import existente no se rompe
- **WHEN** `App.tsx` importa `{ ResidenciaView } from './views/ResidenciaView'` y lo renderiza con `activeSubView={currentSubView}`
- **THEN** el import sigue resolviendo sin cambios y el componente se comporta igual que antes del refactor

#### Scenario: Tests existentes no requieren modificación
- **WHEN** se ejecutan los tests `ResidenciaView.*.test.tsx` existentes (que importan `{ ResidenciaView } from './ResidenciaView'` y lo renderizan)
- **THEN** todos pasan sin necesidad de modificar sus aserciones ni sus imports

### Requirement: Lógica y tipos compartidos entre tabs viven en un módulo común
El código (tipos, badges de estado, helpers de formato, componentes genéricos) usado por más de un tab SHALL residir en un módulo compartido (`apps/app-shell/src/views/residencia/shared.tsx`) importado por los tabs que lo necesiten, en vez de duplicarse en cada archivo de tab.

#### Scenario: Un helper usado por dos tabs
- **WHEN** un badge de estado o un helper de formato es usado tanto por `EstimacionesTab` como por `NominaTab`
- **THEN** ambos lo importan desde `residencia/shared.tsx`; ninguno redefine su propia copia local

### Requirement: Aislamiento de riesgo entre tabs
Un cambio que solo afecta a un tab SHALL requerir modificar únicamente el archivo de ese tab (y, si aplica, `residencia/shared.tsx` cuando el cambio toca algo compartido) — no SHALL requerir tocar el archivo de ningún otro tab.

#### Scenario: Fix urgente en un tab durante el piloto
- **WHEN** aparece un bug de campo que solo afecta al tab `requisiciones`
- **THEN** el fix se implementa y se prueba tocando `RequisicionesTab.tsx` (y `shared.tsx` solo si el bug está en algo compartido), sin necesidad de revisar ni de arriesgar cambios en `EstimacionesTab.tsx`, `NominaTab.tsx`, `AsistenciaTab.tsx` ni `EquipoTab.tsx`
