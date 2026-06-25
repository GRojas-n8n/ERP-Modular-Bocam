## ADDED Requirements

### Requirement: Sección de veredicto general del Residente al pie del cuadro

Al pie del cuadro comparativo, antes del botón de firma, el sistema SHALL mostrar una sección "Veredicto del Residente" con:
1. Un textarea de veredicto técnico general (texto libre, obligatorio para firmar)
2. Un selector múltiple de proveedor(es) recomendado(s) de la lista del cuadro (al menos uno obligatorio para firmar)

Esta sección es visible para el Residente y de solo lectura para Compras y GT una vez firmada.

#### Scenario: Sección de veredicto visible en la evaluación

- **WHEN** el Residente está evaluando el cuadro (estado `EN_EVALUACION_TECNICA`) y todos los renglones tienen evaluación C, NC o DA (sin "?")
- **THEN** aparece al pie del cuadro la sección "Veredicto del Residente"
- **THEN** el textarea y el selector de proveedores están activos para edición

#### Scenario: Firma bloqueada sin veredicto completo

- **WHEN** el Residente intenta firmar sin haber llenado el veredicto o sin haber seleccionado al menos un proveedor recomendado
- **THEN** el botón "Firmar y Bloquear" permanece deshabilitado
- **THEN** se muestra un mensaje: "Completa el veredicto y selecciona al menos un proveedor antes de firmar"

#### Scenario: Firma bloqueada si hay renglones sin evaluar o con "?"

- **WHEN** el Residente intenta firmar y hay renglones en estado "PENDIENTE" o "?"
- **THEN** el botón "Firmar y Bloquear" permanece deshabilitado
- **THEN** se indica qué renglones faltan

### Requirement: Veredicto persiste y es visible post-firma

Una vez firmado el cuadro, el veredicto y los proveedores recomendados SHALL mostrarse en el cuadro como información de solo lectura para todos los roles.

#### Scenario: Veredicto visible en cuadro bloqueado

- **WHEN** un usuario de cualquier rol abre un cuadro en estado `FIRMADO_BLOQUEADO`
- **THEN** ve la sección "Veredicto del Residente" con el texto y los proveedores sugeridos en modo solo lectura
- **THEN** se muestra el nombre del Residente firmante y la fecha/hora de la firma
