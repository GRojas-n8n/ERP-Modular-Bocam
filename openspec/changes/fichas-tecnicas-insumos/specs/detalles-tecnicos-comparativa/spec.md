## ADDED Requirements

### Requirement: Compras puede registrar detalles técnicos por partida
El sistema SHALL permitir al rol `procurement` (o `admin`) registrar `marca_modelo_ref` y `especificaciones_requeridas` por cada partida (insumo) del cuadro comparativo mientras el estado sea `BORRADOR`. Estos campos se guardan en la tabla `ComparativaLinea` (una fila por cuadro × insumo).

#### Scenario: Guardar detalles técnicos en estado BORRADOR
- **WHEN** el usuario con rol `procurement` edita el campo `marca_modelo_ref` o `especificaciones_requeridas` de una partida en el cuadro comparativo con estado `BORRADOR`
- **THEN** el sistema persiste los valores en `ComparativaLinea` y responde `200` con los datos actualizados

#### Scenario: Intento de editar detalles técnicos fuera de BORRADOR
- **WHEN** el cuadro comparativo tiene estado distinto de `BORRADOR` y se intenta modificar `marca_modelo_ref` o `especificaciones_requeridas`
- **THEN** los campos se renderizan en solo lectura — el endpoint devuelve `403` si se intenta vía API directa

#### Scenario: Partida sin ComparativaLinea existente
- **WHEN** se carga un cuadro comparativo cuyas partidas no tienen fila `ComparativaLinea` (cuadros anteriores a la migración)
- **THEN** el sistema trata los campos como cadena vacía y permite crearlos sin error

### Requirement: Detalles técnicos son visibles en modo solo lectura para todos los participantes del flujo
El sistema SHALL mostrar `marca_modelo_ref` y `especificaciones_requeridas` en modo solo lectura a cualquier usuario con acceso al cuadro comparativo (procurement, resident, gerencia_tecnica, superintendent, admin) en cualquier estado posterior a BORRADOR.

#### Scenario: Residente ve detalles técnicos en su panel de evaluación
- **WHEN** el Residente abre el panel "Evaluación Técnica" de un cuadro en estado `EN_EVALUACION_TECNICA`
- **THEN** por cada partida se muestran `marca_modelo_ref` y `especificaciones_requeridas` junto al precio de cada proveedor y el badge de fichas técnicas disponibles
