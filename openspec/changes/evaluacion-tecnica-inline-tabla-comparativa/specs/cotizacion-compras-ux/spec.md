## MODIFIED Requirements

### Requirement: La evaluación técnica del panel simple SHALL registrarse por proveedor, no por renglón agregado
El sistema SHALL permitir al Residente (o `admin`) registrar una decisión C/NC/DA/?
independiente para cada proveedor de cada renglón sin especificaciones estructuradas
capturadas, directamente en "TABLA DE COTIZACIONES" — sin abrir un panel modal separado —
y SHALL persistir la evaluación de todos los proveedores al guardar, no solo la del
primero. El botón "🔒 Firmar y Bloquear →" SHALL permanecer deshabilitado mientras exista
al menos un proveedor de algún renglón sin evaluar.

#### Scenario: Cuadro con 3 proveedores en un mismo renglón
- **WHEN** el Residente hace clic en "Evaluar ▾" de un renglón sin especificaciones
  cotizado por 3 proveedores, dentro de "TABLA DE COTIZACIONES"
- **THEN** se expande una fila debajo del renglón, dentro de la misma tabla, con 3 bloques
  de evaluación independientes (uno por proveedor), cada uno con sus propios controles
  C/NC/DA/? y comentario — sin salir de la tabla ni abrir un modal

#### Scenario: Guardar una línea sin "?" persiste los 3 proveedores de esa línea
- **WHEN** el Residente evalúa los 3 proveedores de un renglón con decisiones C/NC/DA
  (ninguna "?") y hace clic en "Guardar" de esa sub-fila
- **THEN** los 3 `ComparativaDetalle` de ese renglón quedan con su `evaluacion_tecnica`
  correspondiente, sin afectar la evaluación de otros renglones no guardados aún

#### Scenario: Una decisión "?" en cualquier línea requiere el guardado agregado de "?"
- **WHEN** el Residente marca "?" en al menos un proveedor de cualquier renglón
- **THEN** esa línea no ofrece guardado individual — aparece un botón agregado a nivel de
  tabla ("Guardar y Crear Revisión") que, al presionarlo, envía en una sola llamada todas
  las evaluaciones pendientes (incluyendo los "?" con su pregunta) y crea una única
  revisión nueva del cuadro

#### Scenario: Firmar exige evaluar a todos los proveedores, no solo uno por renglón
- **WHEN** el Residente evaluó solo 1 de 3 proveedores de un renglón y falta el resto
- **THEN** el botón "🔒 Firmar y Bloquear →" no está habilitado, aunque el renglón
  muestre alguna evaluación

#### Scenario: Proveedor sin precio capturado en un renglón no requiere evaluación
- **WHEN** un renglón tiene 3 proveedores en el cuadro pero solo 2 capturaron precio para
  ese renglón específico
- **THEN** la sub-fila expandida solo pide evaluar a los 2 proveedores que sí cotizaron ese
  renglón
