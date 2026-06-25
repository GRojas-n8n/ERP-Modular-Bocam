## ADDED Requirements

### Requirement: Resolución de presupuesto activo antes de ejecutar la conversión a OC
Antes de que el usuario pueda ejecutar "Autorizar" (convertir-oc) desde `ComparativaDetail`, el sistema SHALL obtener el listado de presupuestos activos del proyecto desde el módulo Finanzas y resolverlo sin requerir input adicional cuando sea posible.

#### Scenario: Exactamente un presupuesto activo
- **WHEN** Finanzas retorna exactamente 1 presupuesto activo para el proyecto
- **THEN** ese `presupuesto_id` se usa automáticamente y el usuario no ve ningún selector adicional

#### Scenario: Múltiples presupuestos activos
- **WHEN** Finanzas retorna más de 1 presupuesto activo para el proyecto
- **THEN** el dialog de autorización muestra un `<select>` con los presupuestos disponibles (nombre + disponible) y el usuario debe elegir uno antes de confirmar

#### Scenario: Sin presupuesto activo
- **WHEN** Finanzas no retorna presupuestos activos para el proyecto (lista vacía o error)
- **THEN** el botón "Autorizar" queda deshabilitado y se muestra el mensaje "Sin presupuesto activo — contacta al módulo de Finanzas"

### Requirement: presupuesto_id enviado al backend en la llamada a convertir-oc
El frontend SHALL incluir `presupuesto_id` en el body del `POST /comparativas/:id/convertir-oc`. El backend ya lo requiere; sin este campo retorna `400`.

#### Scenario: Llamada con presupuesto_id resuelto
- **WHEN** el usuario confirma la autorización con `presupuesto_id` válido
- **THEN** el frontend llama `POST /comparativas/:id/convertir-oc` con `{ presupuesto_id: "<uuid>" }` y el backend procede

#### Scenario: Backend rechaza presupuesto_id inválido
- **WHEN** el `presupuesto_id` enviado no corresponde a un presupuesto activo
- **THEN** Finanzas retorna error, el backend retorna `422` o `502`, y el frontend muestra el mensaje de error al usuario

### Requirement: Endpoint GET /presupuestos en módulo Finanzas (si no existe)
Si el módulo Finanzas no expone un endpoint para listar presupuestos activos por proyecto, SHALL crearse `GET /api/v1/finanzas/presupuestos` que retorne la lista de presupuestos activos del `proyecto_id` del JWT, con al menos los campos `id_presupuesto`, `nombre`, `monto_disponible`.

#### Scenario: Llamada exitosa a GET /presupuestos
- **WHEN** el frontend llama `GET /api/v1/finanzas/presupuestos` con un JWT válido
- **THEN** retorna `{ success: true, data: [{ id_presupuesto, nombre, monto_disponible }] }`

#### Scenario: Endpoint no existe en Finanzas (ya existe uno equivalente)
- **WHEN** ya existe un endpoint con datos equivalentes en el módulo Finanzas
- **THEN** usar ese endpoint directamente sin crear uno nuevo
