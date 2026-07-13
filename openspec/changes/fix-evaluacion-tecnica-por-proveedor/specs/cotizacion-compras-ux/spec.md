## ADDED Requirements

### Requirement: La evaluación técnica del panel simple SHALL registrarse por proveedor, no por renglón agregado
El sistema SHALL permitir al Residente (o `admin`) registrar una decisión C/NC/DA/?
independiente para cada proveedor de cada renglón sin especificaciones estructuradas
capturadas, y SHALL persistir la evaluación de todos los proveedores al guardar — no solo
la del primero. El botón "🔒 Firmar y Bloquear →" SHALL permanecer deshabilitado mientras
exista al menos un proveedor de algún renglón sin evaluar.

#### Scenario: Cuadro con 3 proveedores en un mismo renglón
- **WHEN** el Residente abre el panel "Registrar Evaluación Técnica →" de un renglón
  cotizado por 3 proveedores
- **THEN** ve 3 bloques de evaluación independientes (uno por proveedor), cada uno con sus
  propios controles C/NC/DA/? y comentario

#### Scenario: Guardar la evaluación persiste los 3 proveedores
- **WHEN** el Residente evalúa los 3 proveedores de un renglón con decisiones distintas y
  guarda
- **THEN** los 3 `ComparativaDetalle` de ese renglón (uno por proveedor) quedan con su
  `evaluacion_tecnica` correspondiente — ninguno queda en `PENDIENTE`

#### Scenario: Firmar exige evaluar a todos los proveedores, no solo uno por renglón
- **WHEN** el Residente evaluó solo 1 de 3 proveedores de un renglón y falta el resto
- **THEN** el botón "🔒 Firmar y Bloquear →" no está habilitado, aunque el renglón
  muestre alguna evaluación

#### Scenario: Proveedor sin precio capturado en un renglón no requiere evaluación
- **WHEN** un renglón tiene 3 proveedores en el cuadro pero solo 2 capturaron precio para
  ese renglón específico
- **THEN** el panel solo pide evaluar a los 2 proveedores que sí cotizaron ese renglón
