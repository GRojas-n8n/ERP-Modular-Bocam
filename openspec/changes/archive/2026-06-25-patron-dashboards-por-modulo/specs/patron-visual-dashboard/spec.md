## ADDED Requirements

### Requirement: Layout estándar de dashboard de módulo
La sección de dashboard de cada módulo SHALL seguir el layout: (1) fila de 4 KPI cards, (2) sección de alertas (solo visible si hay alertas), (3) tabla de actividad reciente. Este layout es la pantalla de entrada visible antes de cualquier tab.

#### Scenario: Entrada al módulo muestra dashboard
- **WHEN** usuario navega a la ruta raíz del módulo (ej. `/compras`)
- **THEN** la primera sección visible es el dashboard con las 4 KPI cards antes de los tabs de navegación

#### Scenario: Sin alertas activas
- **WHEN** no hay items en la lista `alertas` del endpoint `/dashboard`
- **THEN** la sección de alertas no se renderiza (no ocupa espacio vacío)

#### Scenario: Con alertas activas
- **WHEN** `alertas.length > 0`
- **THEN** aparece una sección destacada (borde amber o rojo según severidad) listando cada alerta con un CTA (botón de acción directa)

### Requirement: KPI cards con valor, label e ícono
Cada KPI card SHALL mostrar: valor numérico prominente, label descriptivo, ícono representativo, y color semántico (verde=positivo, amber=advertencia, rojo=crítico, slate=neutro).

#### Scenario: Card con valor 0
- **WHEN** un KPI tiene valor 0
- **THEN** la card se renderiza normalmente con "0" — no se oculta ni muestra "N/A"

#### Scenario: Card de alerta con valor > umbral
- **WHEN** un KPI supera su umbral de alerta (ej. "OCs vencidas > 0")
- **THEN** la card usa color rojo o amber para llamar la atención
