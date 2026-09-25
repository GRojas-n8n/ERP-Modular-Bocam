# frontend-control-presupuestal

## Purpose

Describe el comportamiento de la tabla de Control Presupuestal de Gerencia Técnica (`InsumosView`) y del widget resumen en Compras: columnas, filtros, búsqueda, exportación y salto directo a Trazabilidad. Las secciones descriptivas históricas se conservan tal cual; los requisitos normativos nuevos viven en `## Requirements`.

## Tab Control Presupuestal en GerenciaTecnicaView (InsumosView)

`GerenciaTecnicaView.tsx` / `InsumosView.tsx` incluye pestaña "Control Presupuestal" que llama únicamente a `GET /api/v1/gerencia-tecnica/reportes/control-presupuestal` (no cross-service en frontend).

### Scenarios

#### Scenario: Tabla de partidas cargada
- **WHEN** el CC activo tiene presupuesto aprobado
- **THEN** tabla con columnas: Clave, Descripción, Categoría, Presupuestado, Comprometido, Pagado, Disponible, % Ejercido — filas ordenadas por clave

#### Scenario: Barra de progreso por partida
- **WHEN** `pct_ejercido > 0`
- **THEN** mini barra de progreso con color: verde ≤ 70%, amarillo 71-90%, rojo > 90%

#### Scenario: Alerta de partida en riesgo
- **WHEN** `comprometido > presupuestado * 0.90`
- **THEN** fila con fondo ámbar + badge "En riesgo"

#### Scenario: Partidas sin clasificar
- **WHEN** el reporte incluye montos sin `concepto_id` (OCs/pagos legacy)
- **THEN** fila "[Sin partida]" al final con los montos sin asignar

#### Scenario: Filtro por categoría
- **WHEN** usuario selecciona categoría (TODAS / MATERIAL / MANO_DE_OBRA / EQUIPO / SUBCONTRATO / INDIRECTO)
- **THEN** tabla filtra filas por `categoria_predominante`

#### Scenario: Respuesta parcial
- **WHEN** endpoint retorna `parcial: true`
- **THEN** banner amarillo: "Datos incompletos — uno o más servicios no respondieron. Los montos mostrados pueden ser aproximados."

#### Scenario: Exportar PDF
- **WHEN** usuario clic "Exportar PDF"
- **THEN** `POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export` con `{ formato: "PDF" }` — descarga archivo vía `URL.createObjectURL`

#### Scenario: Exportar Excel
- **WHEN** usuario clic "Exportar Excel"
- **THEN** `POST /api/v1/gerencia-tecnica/reportes/control-presupuestal/export` con `{ formato: "XLSX" }` — descarga archivo

---

## Widget resumen en ComprasView

`ComprasView.tsx` muestra widget compacto en la tab de trazabilidad. Llama al mismo endpoint `/api/v1/gerencia-tecnica/reportes/control-presupuestal` desde el frontend (datos cruzados via backend GT, no via BD directa).

### Scenarios

#### Scenario: Widget muestra totales del CC activo
- **WHEN** tab trazabilidad activa y proyecto seleccionado
- **THEN** panel con: Total Presupuestado, Comprometido, Pagado, Disponible y % ejercido global

#### Scenario: Alerta global de presupuesto
- **WHEN** `total_comprometido > total_presupuestado * 0.85`
- **THEN** badge rojo "Presupuesto en riesgo"

#### Scenario: Sin presupuesto activo
- **WHEN** endpoint retorna 404
- **THEN** widget muestra "Sin presupuesto activo para este proyecto"
## Requirements
### Requirement: Búsqueda por clave o descripción en la tabla de Control Presupuestal
El sistema SHALL permitir al usuario filtrar las filas de `ControlPresupuestalTabla` mediante un campo de búsqueda por clave o descripción de partida, combinado (AND) con el filtro de categoría existente, sin realizar una llamada adicional al backend.

#### Scenario: Búsqueda filtra por clave
- **WHEN** el usuario escribe un texto que coincide con la clave de una o más partidas en el campo de búsqueda de `ControlPresupuestalTabla`
- **THEN** la tabla muestra solo las filas cuya clave contiene ese texto (sin distinguir mayúsculas/minúsculas)

#### Scenario: Búsqueda filtra por descripción
- **WHEN** el usuario escribe un texto que no coincide con ninguna clave pero sí con la descripción de una o más partidas
- **THEN** la tabla muestra las filas cuya descripción contiene ese texto

#### Scenario: Búsqueda y filtro de categoría se combinan
- **WHEN** el usuario tiene seleccionada una categoría distinta de "TODAS" y además escribe un término de búsqueda
- **THEN** la tabla muestra solo las filas que cumplen ambos criterios a la vez

#### Scenario: Fila "[Sin partida]" respeta la búsqueda
- **WHEN** hay montos sin `concepto_id` (fila "[Sin partida]") y el usuario tiene un término de búsqueda activo que no coincide con "sin partida"
- **THEN** la fila "[Sin partida]" no se muestra

#### Scenario: Sin resultados
- **WHEN** ningún registro coincide con la combinación de búsqueda y categoría seleccionada
- **THEN** la tabla muestra un estado vacío indicando que no hay partidas que coincidan con el filtro

### Requirement: Salto directo de una partida a la pestaña Trazabilidad
El sistema SHALL permitir, desde una fila de la tabla de Control Presupuestal en `InsumosView`, saltar directamente a la pestaña "Trazabilidad" mostrando la misma partida (`concepto_id`) expandida, sin que el usuario tenga que volver a ubicarla manualmente.

#### Scenario: Usuario salta desde Control Presupuestal a Trazabilidad
- **WHEN** el usuario hace clic en la acción "Ver en Trazabilidad" de una fila de partida en la tabla de Control Presupuestal
- **THEN** el sistema cambia a la pestaña "Trazabilidad" y muestra esa misma partida expandida, sin requerir scroll ni búsqueda adicional

#### Scenario: Acción no visible en el uso de solo lectura de Control de Proyectos
- **WHEN** `ControlPresupuestalTabla` se usa desde `ControlObraView` (rol `control_proyectos`), que no tiene pestaña de Trazabilidad
- **THEN** la acción "Ver en Trazabilidad" no se muestra en esa vista
