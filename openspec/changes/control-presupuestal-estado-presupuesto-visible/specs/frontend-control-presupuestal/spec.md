## ADDED Requirements

### Requirement: Estado "pendiente de aprobación" en la pestaña Control Presupuestal
La pestaña "Control Presupuestal" en `InsumosView.tsx` SHALL mostrar un estado explícito e informativo cuando el endpoint responda `GT_PRESUPUESTO_PENDIENTE_APROBACION`, en vez de una tabla vacía.

#### Scenario: Presupuesto pendiente, usuario con permiso de aprobar
- **WHEN** el endpoint responde 404 `GT_PRESUPUESTO_PENDIENTE_APROBACION` y el usuario tiene permiso de aprobar presupuestos
- **THEN** se muestra un panel "Presupuesto pendiente de aprobación" con botón que invoca `handleAprobarPresupuesto` sobre el `presupuesto_id` recibido

#### Scenario: Presupuesto pendiente, usuario sin permiso de aprobar
- **WHEN** el endpoint responde 404 `GT_PRESUPUESTO_PENDIENTE_APROBACION` y el usuario NO tiene permiso de aprobar presupuestos
- **THEN** se muestra el mismo panel informativo sin el botón de aprobar

### Requirement: Mensaje diferenciado en el widget de Compras
El widget resumen de Control Presupuestal en `ComprasView.tsx` SHALL diferenciar el mensaje cuando el presupuesto existe pero está pendiente de aprobación, del caso en que no existe ningún presupuesto.

#### Scenario: Widget con presupuesto pendiente de aprobación
- **WHEN** el endpoint responde 404 `GT_PRESUPUESTO_PENDIENTE_APROBACION`
- **THEN** el widget muestra "Presupuesto del proyecto pendiente de aprobación en Gerencia Técnica" (sin botón de aprobar)

## MODIFIED Requirements

### Requirement: Widget resumen — sin presupuesto activo
El widget resumen en `ComprasView.tsx` SHALL mostrar "Sin presupuesto activo para este proyecto" únicamente cuando el endpoint responda 404 `GT_NO_PRESUPUESTO` (ningún presupuesto existente), y no para el caso de presupuesto pendiente de aprobación (cubierto por un requirement separado).

#### Scenario: Sin presupuesto activo
- **WHEN** endpoint retorna 404 `GT_NO_PRESUPUESTO`
- **THEN** widget muestra "Sin presupuesto activo para este proyecto"
