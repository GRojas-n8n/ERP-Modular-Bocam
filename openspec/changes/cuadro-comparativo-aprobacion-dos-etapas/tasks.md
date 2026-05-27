## 1. Migración del Schema Prisma (Compras)

- [x] 1.1 Agregar campos de auditoría de evaluación técnica en `CuadroComparativo`: `evaluacion_residente_id`, `fecha_evaluacion_tecnica`, `gerente_tecnico_id`, `fecha_aprobacion_gt`, `comentario_gt_general`
- [x] 1.2 Agregar campos de evaluación por renglón en `ComparativaDetalle`: `evaluacion_tecnica` (String default `PENDIENTE`), `comentario_tecnico`, `aprobacion_gt` (String default `PENDIENTE`), `comentario_gt`
- [x] 1.3 Ejecutar `prisma migrate dev --name cuadro-comparativo-aprobacion-dos-etapas` y verificar que el SQL generado incluye el `UPDATE` de migración de estados (`ABIERTO→BORRADOR`, `APROBADO→APROBADO_GT`)
- [x] 1.4 Agregar el SQL de migración de datos en el archivo de migración generado antes de aplicarlo: `UPDATE cuadros_comparativos SET estado='BORRADOR' WHERE estado='ABIERTO'; UPDATE cuadros_comparativos SET estado='APROBADO_GT' WHERE estado='APROBADO';`
- [x] 1.5 Ejecutar `prisma generate` y verificar que los tipos TypeScript generados incluyen los nuevos campos

## 2. Endpoints Backend — Nuevas Transiciones de Estado

- [x] 2.1 Implementar `PATCH /api/v1/compras/comparativas/:id/enviar-evaluacion` — `requireRoles('procurement', 'admin')`, valida `estado === BORRADOR`, transiciona a `EN_EVALUACION_TECNICA` y setea `evaluacion_tecnica = PENDIENTE` en todos los detalles
- [x] 2.2 Implementar `PATCH /api/v1/compras/comparativas/:id/evaluar` — `requireRoles('resident', 'control_obra', 'superintendent')`, valida `estado === EN_EVALUACION_TECNICA`, actualiza `evaluacion_tecnica` y `comentario_tecnico` por detalle, registra `evaluacion_residente_id` y `fecha_evaluacion_tecnica`, transiciona a `EVALUADO_TECNICAMENTE`
- [x] 2.3 Implementar `PATCH /api/v1/compras/comparativas/:id/enviar-gt` — `requireRoles('resident', 'control_obra', 'procurement', 'superintendent')`, valida `estado === EVALUADO_TECNICAMENTE` y existencia de al menos un detalle con `evaluacion_tecnica = APROBADO`, transiciona a `EN_APROBACION_GT`
- [x] 2.4 Implementar `PATCH /api/v1/compras/comparativas/:id/revisar-gt` — `requireRoles('gerencia_tecnica', 'superintendent', 'admin')`, valida `estado === EN_APROBACION_GT`, bloquea cualquier `aprobacion_gt = APROBADO` sobre detalles con `evaluacion_tecnica = RECHAZADO`, actualiza campos GT, determina estado final (`APROBADO_GT` o `RECHAZADO_GT`) según si hay al menos un aprobado

## 3. Endpoint Backend — Publicación de Evento

- [x] 3.1 En el handler `revisar-gt`, al transicionar a `APROBADO_GT`, publicar evento `compras.comparativa_aprobada_gt` con `buildEventContext(req)` y payload `{ cuadro_id, codigo, requisicion_id, renglones_aprobados }` — con degradación elegante si el bus no está disponible

## 4. Endpoints Backend — Bandejas de Trabajo

- [x] 4.1 Implementar `GET /api/v1/compras/comparativas/pendientes-evaluacion` — `requireRoles('resident', 'control_obra', 'superintendent')`, retorna cuadros con `estado = EN_EVALUACION_TECNICA` del proyecto activo, incluyendo detalles con proveedor y datos de la requisición
- [x] 4.2 Implementar `GET /api/v1/compras/comparativas/pendientes-gt` — `requireRoles('gerencia_tecnica', 'superintendent')`, retorna cuadros con `estado = EN_APROBACION_GT` del proyecto activo, incluyendo detalles completos con evaluación técnica visible

## 5. Modificación de Endpoint Existente — convertir-oc

- [x] 5.1 Agregar validación en `POST /api/v1/compras/comparativas/:id/convertir-oc`: si `estado !== APROBADO_GT`, responder `400` con mensaje claro indicando el estado actual
- [x] 5.2 Modificar la query de detalles ganadores para filtrar por `aprobacion_gt = APROBADO` además de `es_ganador = true`
- [x] 5.3 Corregir el comportamiento del `CERRADO` del cuadro: solo cerrar cuando la OC queda en `EMITIDA` (mantener en `APROBADO_GT` si la OC queda en `ERROR_FINANZAS`)

## 6. Frontend — Estado Visual del Cuadro Comparativo

- [x] 6.1 En `ComparativaDetail.tsx` (o donde se renderiza el cuadro), añadir un componente de etiqueta/badge para todos los estados del flujo: `BORRADOR`, `EN_EVALUACION_TECNICA`, `EVALUADO_TECNICAMENTE`, `EN_APROBACION_GT`, `APROBADO_GT`, `RECHAZADO_GT`, `CERRADO` — con colores semánticos (amber para en-proceso, emerald para aprobado, red para rechazado)
- [x] 6.2 Condicionar la visibilidad de botones de acción según el rol del usuario (`useAuth`/`TenantContext`) y el estado del cuadro: `procurement` ve "Enviar a Evaluación"; `resident`/`control_obra` ve "Registrar Evaluación" o "Enviar al GT"; `gerencia_tecnica` ve "Revisar y Aprobar"; `procurement` ve "Generar OC" solo en `APROBADO_GT`
- [x] 6.3 Ocultar el botón "Generar OC" (o reemplazarlo por mensaje informativo) cuando el cuadro está en `RECHAZADO_GT`, `EN_EVALUACION_TECNICA`, `EN_APROBACION_GT` o `EVALUADO_TECNICAMENTE`

## 7. Frontend — Formulario de Evaluación Técnica (Residente)

- [x] 7.1 Crear panel/formulario de evaluación técnica accesible desde el botón "Registrar Evaluación Técnica": tabla con un renglón por `ComparativaDetalle` mostrando descripción del insumo, proveedor, precio, y controles APROBADO/RECHAZADO + campo de comentario
- [x] 7.2 Al guardar, llamar `PATCH /api/v1/compras/comparativas/:id/evaluar` con el array de evaluaciones y mostrar toast de confirmación
- [x] 7.3 Mostrar botón "Enviar al Gerente Técnico" tras evaluación exitosa (si el estado pasa a `EVALUADO_TECNICAMENTE`), que llama `PATCH /enviar-gt` y actualiza la UI

## 8. Frontend — Formulario de Revisión GT

- [x] 8.1 Crear panel/formulario de revisión GT accesible desde el botón "Revisar y Aprobar": tabla que muestra por renglón: descripción, proveedor, precio, evaluación del Residente (con su comentario, en solo lectura), y controles APROBADO/RECHAZADO para el GT + campo de comentario del GT
- [x] 8.2 Deshabilitar visualmente (y bloquear en UI) el control APROBADO del GT para renglones donde `evaluacion_tecnica = RECHAZADO`, con tooltip explicativo "Rechazado en evaluación técnica"
- [x] 8.3 Agregar campo opcional "Comentario general" para el GT
- [x] 8.4 Al guardar, llamar `PATCH /api/v1/compras/comparativas/:id/revisar-gt` y mostrar toast con resultado: "Cuadro aprobado por Gerencia Técnica" (emerald) o "Cuadro rechazado por Gerencia Técnica" (red)

## 9. Frontend — Bandejas de Pendientes (Opcional en esta iteración)

- [x] 9.1 Agregar sub-tab o sección "Pendientes de Evaluación" en la vista de Compras (visible solo para roles `resident`, `control_obra`) que consuma `GET /comparativas/pendientes-evaluacion`
- [x] 9.2 Agregar sub-tab o sección "Pendientes de Aprobación GT" en la vista de Compras (visible solo para rol `gerencia_tecnica`) que consuma `GET /comparativas/pendientes-gt`

## 10. Demo Mode — demoData.ts

- [x] 10.1 Actualizar `DEMO_COMPARATIVAS` en `apps/app-shell/src/lib/demoData.ts` para incluir cuadros en los nuevos estados (`EN_EVALUACION_TECNICA`, `EN_APROBACION_GT`, `APROBADO_GT`) con los campos de evaluación técnica y aprobación GT rellenos, de modo que el demo mode muestre el flujo completo

## 11. Tests de Integración

- [x] 11.1 Test: flujo completo happy path — `BORRADOR → EN_EVALUACION_TECNICA → EVALUADO_TECNICAMENTE → EN_APROBACION_GT → APROBADO_GT → CERRADO (OC EMITIDA)`
- [x] 11.2 Test: intento de aprobar en GT un renglón rechazado por el Residente → `400`
- [x] 11.3 Test: cuadro con todos los renglones rechazados por GT → `RECHAZADO_GT`
- [x] 11.4 Test: intento de `convertir-oc` con estado `EN_APROBACION_GT` → `400`
- [x] 11.5 Test: OC generada solo con renglones `aprobacion_gt = APROBADO`

## 12. Deploy a VPS

- [ ] 12.1 Aplicar migración en VPS: `docker compose exec compras npx prisma migrate deploy` (o verificar que el contenedor la aplica al arrancar)
- [ ] 12.2 Rebuild y redeploy del contenedor `compras`: `docker compose -f docker-compose.vps.yml --profile core build --no-cache compras && docker compose -f docker-compose.vps.yml --profile core up -d compras`
- [ ] 12.3 Rebuild y redeploy del contenedor `app-shell` con los cambios de frontend
- [ ] 12.4 Verificar en producción que cuadros existentes tienen `estado = BORRADOR` (migrados desde `ABIERTO`) y que el flujo completo funciona con un cuadro de prueba
