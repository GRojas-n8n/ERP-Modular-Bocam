## ADDED Requirements

### Requirement: Resolución de presupuesto activo antes de ejecutar la conversión a OC
Antes de que el usuario pueda ejecutar "Autorizar" (convertir-oc) desde `ComparativaDetail`, el sistema SHALL resolver el presupuesto a comprometer sin requerir input del usuario cuando la requisición origen tiene una partida (`concepto_id`) asociada. Solo cuando la requisición NO tiene `concepto_id` SHALL el sistema recurrir a la resolución previa por lista de presupuestos activos del proyecto.

#### Scenario: Requisición con partida (concepto_id) asociada
- **WHEN** la requisición origen del cuadro comparativo tiene `concepto_id` no nulo
- **THEN** el sistema resuelve automáticamente el `presupuesto_id` correspondiente a esa partida (vía `GET /api/v1/finanzas/presupuestos/por-concepto/:conceptoId`) sin mostrar ningún selector al usuario

#### Scenario: Partida sin presupuesto sincronizado en Finanzas todavía
- **WHEN** la requisición tiene `concepto_id` pero Finanzas no tiene ningún `PresupuestoAsignado` sincronizado para esa partida (evento no procesado aún, o presupuesto de obra no aprobado en GT)
- **THEN** el botón "Autorizar" queda deshabilitado con el mensaje "Sin presupuesto sincronizado para esta partida — verifica que el presupuesto de obra esté aprobado en Gerencia Técnica"

#### Scenario: Requisición sin concepto_id — fallback a selección manual
- **WHEN** la requisición origen NO tiene `concepto_id` (caso legado o excepcional)
- **THEN** el sistema recurre al comportamiento previo: si Finanzas retorna exactamente 1 presupuesto activo del proyecto, se usa automáticamente; si retorna más de 1, se muestra el `<select>` para elegir; si no hay ninguno, el botón queda deshabilitado

### Requirement: presupuesto_id enviado al backend en la llamada a convertir-oc
El frontend SHALL incluir `presupuesto_id` en el body del `POST /comparativas/:id/convertir-oc` únicamente en el caso de fallback (requisición sin `concepto_id`, resuelto manualmente). Cuando la requisición tiene `concepto_id`, el backend SHALL resolver el presupuesto internamente y el frontend NO SHALL enviar `presupuesto_id`.

#### Scenario: Llamada con concepto_id — sin presupuesto_id en el body
- **WHEN** la requisición tiene `concepto_id` y el usuario confirma la autorización
- **THEN** el frontend llama `POST /comparativas/:id/convertir-oc` sin `presupuesto_id` en el body, y el backend resuelve el presupuesto por partida

#### Scenario: Llamada de fallback con presupuesto_id resuelto manualmente
- **WHEN** la requisición no tiene `concepto_id` y el usuario eligió un presupuesto del selector
- **THEN** el frontend llama `POST /comparativas/:id/convertir-oc` con `{ presupuesto_id: "<uuid>" }` y el backend procede como hoy

#### Scenario: Backend rechaza cuando no puede resolver presupuesto de ninguna forma
- **WHEN** no hay `concepto_id` en la requisición Y no se envía `presupuesto_id` en el body
- **THEN** el backend retorna 400, mismo comportamiento que hoy

### Requirement: Endpoint GET /presupuestos en módulo Finanzas (si no existe)
Si el módulo Finanzas no expone un endpoint para listar presupuestos activos por proyecto, SHALL crearse `GET /api/v1/finanzas/presupuestos` que retorne la lista de presupuestos activos del `proyecto_id` del JWT, con al menos los campos `id_presupuesto`, `nombre`, `monto_disponible`.

#### Scenario: Llamada exitosa a GET /presupuestos
- **WHEN** el frontend llama `GET /api/v1/finanzas/presupuestos` con un JWT válido
- **THEN** retorna `{ success: true, data: [{ id_presupuesto, nombre, monto_disponible }] }`

#### Scenario: Endpoint no existe en Finanzas (ya existe uno equivalente)
- **WHEN** ya existe un endpoint con datos equivalentes en el módulo Finanzas
- **THEN** usar ese endpoint directamente sin crear uno nuevo
