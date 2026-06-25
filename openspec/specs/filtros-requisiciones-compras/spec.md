# Spec: filtros-requisiciones-compras

## ADDED Requirements

### Requirement: Barra de filtros rápidos en Requisiciones
El sistema SHALL mostrar una barra de chips de filtro encima de la lista de requisiciones en el tab Requisiciones de ComprasView, visible únicamente para roles compras/procurement.

Los chips disponibles son:
- **Todos** — muestra todas las requisiciones (estado inicial por defecto)
- **Pendiente aprobación** — reqs sin comparativa en estado PENDIENTE o BORRADOR
- **Lista para cotizar** — reqs APROBADA sin comparativa
- **Cotizando** — reqs APROBADA con comparativa en BORRADOR
- **En evaluación técnica** — reqs APROBADA con comparativa en EN_EVALUACION_TECNICA o EVALUADO_TECNICAMENTE esperando envío a GT
- **Pendiente GT** — reqs APROBADA con comparativa en EN_APROBACION_GT o EVALUADO_TECNICAMENTE ya enviado

Solo un chip puede estar activo a la vez. El chip activo tiene estilo visual diferenciado (fondo sólido del color del estado).

#### Scenario: Estado inicial al cargar la vista
- **WHEN** el usuario compras abre la pestaña Requisiciones
- **THEN** el chip "Todos" está activo y se muestran todas las requisiciones

#### Scenario: Filtrar por estado activo
- **WHEN** el usuario hace clic en un chip de estado (ej. "Lista para cotizar")
- **THEN** la lista muestra únicamente las requisiciones cuyo estado del ciclo coincide con ese chip
- **THEN** el chip seleccionado tiene estilo activo y los demás no

#### Scenario: Volver a Todos
- **WHEN** el usuario hace clic en el chip "Todos" estando otro chip activo
- **THEN** la lista vuelve a mostrar todas las requisiciones

#### Scenario: Lista vacía para un filtro
- **WHEN** no hay requisiciones en el estado del chip seleccionado
- **THEN** se muestra el mensaje vacío existente ("Sin requisiciones")

### Requirement: Contador de requisiciones por chip
Cada chip SHALL mostrar entre paréntesis el número de requisiciones que corresponden a ese estado, calculado sobre el total cargado en memoria.

#### Scenario: Contadores reflejan el array cargado
- **WHEN** se cargan las requisiciones desde el backend
- **THEN** cada chip muestra el count correcto en tiempo real (ej. "Lista para cotizar (3)")

#### Scenario: Chip "Todos" muestra total
- **WHEN** hay N requisiciones cargadas
- **THEN** el chip "Todos" muestra "(N)"
