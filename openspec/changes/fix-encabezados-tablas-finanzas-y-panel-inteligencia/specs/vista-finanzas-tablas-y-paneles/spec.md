## ADDED Requirements

### Requirement: Encabezado y filas comparten la estructura de columnas
Las tablas "Presupuestos asignados" y "Pagos de OCs" de la vista de Finanzas SHALL renderizar el encabezado como `thead > tr > th`, con un `th` por cada `td` de las filas y en el mismo orden. Los títulos de columnas de montos SHALL ir alineados a la derecha, igual que sus celdas.

#### Scenario: Encabezado de Presupuestos asignados
- **WHEN** la vista muestra al menos un presupuesto asignado
- **THEN** la tabla tiene un único `thead` con una fila de 7 `th`: Código, Descripción, Capítulo, Autorizado, Comprometido, Ejercido y Disponible, y cada fila del cuerpo tiene 7 `td`

#### Scenario: Montos alineados a la derecha
- **WHEN** se renderiza el encabezado de Presupuestos asignados
- **THEN** los `th` de Autorizado, Comprometido, Ejercido y Disponible tienen alineación a la derecha

#### Scenario: Encabezado de Pagos de OCs
- **WHEN** la vista muestra al menos un pago de OC
- **THEN** la tabla tiene un único `thead > tr`, con tantos `th` como `td` tiene cada fila del cuerpo

### Requirement: Panel "Inteligencia financiera" oculto hasta usar datos reales
El panel "Inteligencia financiera" SHALL renderizarse solo cuando la bandera `inteligenciaFinanciera` esté activa. La bandera SHALL estar desactivada salvo que el build defina `VITE_FLAG_INTELIGENCIA_FINANCIERA=true`.

#### Scenario: Bandera apagada (por defecto)
- **WHEN** la vista de Finanzas se renderiza sin la bandera
- **THEN** no aparecen el título "Inteligencia Financiera" ni los textos "punto critico del 85%" y "$3,712.58"

#### Scenario: Bandera encendida
- **WHEN** la bandera `inteligenciaFinanciera` está activa
- **THEN** el panel se renderiza con su contenido actual
