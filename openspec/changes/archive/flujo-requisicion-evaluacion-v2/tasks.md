## 1. Schema compras — req_detalles: especificaciones por renglón

- [x] 1.1 Agregar campos `especificacion_marca_modelo` (VarChar(200), nullable) y `especificacion_detalle` (Text, nullable) al modelo `ReqDetalle` en `apps/compras/prisma/schema.prisma`
- [x] 1.2 Ejecutar `npx prisma migrate dev --name add_specs_req_detalle` en `apps/compras`
- [x] 1.3 Regenerar cliente Prisma: `npx prisma generate` en `apps/compras`

## 2. Schema compras — cuadros_comparativos: veredicto y bloqueo

- [x] 2.1 Agregar a `CuadroComparativo` en schema: `veredicto_residente` (Text, nullable), `proveedores_sugeridos` (Text, nullable — JSON-serializado), `estado` extender con valor `FIRMADO_BLOQUEADO` y `REVISION_SOLICITADA`
- [x] 2.2 Agregar modelo `AuditoriaDesbloqueoComparativa`: `id_auditoria` (UUID PK), `tenant_id` (@db.Uuid), `cuadro_id` (UUID FK), `desbloqueado_por` (UUID), `timestamp_desbloqueo` (DateTime @default(now())), `justificacion` (Text), `@@index([tenant_id, cuadro_id])`
- [x] 2.3 Ejecutar `npx prisma migrate dev --name add_veredicto_bloqueo_auditoria` en `apps/compras`
- [x] 2.4 Regenerar cliente Prisma: `npx prisma generate` en `apps/compras`

## 3. Schema compras — comparativa_detalles: respuesta a preguntas de revisión

- [x] 3.1 Agregar campo `pregunta_residente` (Text, nullable) y `respuesta_compras` (Text, nullable) al modelo `ComparativaDetalle` (o equivalente de `comparativa_lineas`) en schema
- [x] 3.2 Ejecutar `npx prisma migrate dev --name add_pregunta_respuesta_linea` en `apps/compras`
- [x] 3.3 Regenerar cliente Prisma

## 4. Backend compras — endpoints especificaciones en req

- [x] 4.1 Modificar `PUT /api/v1/compras/requisiciones/:id/detalles/:detalleId` (o equivalente) para aceptar y guardar `especificacion_marca_modelo` y `especificacion_detalle`
- [x] 4.2 Ampliar `GET /api/v1/compras/requisiciones/:id` para devolver `especificacion_marca_modelo` y `especificacion_detalle` en cada ítem del array `detalles`
- [x] 4.3 Ampliar `GET /api/v1/compras/comparativas/:id` para incluir specs de la req en el payload de las líneas (`especificacion_marca_modelo`, `especificacion_detalle` heredados desde `req_detalles` vía join o lookup)

## 5. Backend compras — endpoint creación de requisición con specs

- [x] 5.1 Modificar `POST /api/v1/compras/requisiciones` para aceptar en cada ítem del body los campos `especificacion_marca_modelo` y `especificacion_detalle` opcionales y persistirlos en `req_detalles`

## 6. Backend compras — endpoint revisión con preguntas "?"

- [x] 6.1 Implementar `POST /api/v1/compras/comparativas/:id/revision-con-preguntas` — roles: `resident`, `admin`; acepta array de `{ detalle_id, evaluacion_tecnica, comentario_tecnico, pregunta_residente }` donde al menos uno tiene `evaluacion_tecnica: '?'`; crea nueva revisión del cuadro (copia completa con `revision` incrementado A→B, `estado: 'BORRADOR'`, `revision_padre_id`); transiciona el cuadro original a `REVISION_SOLICITADA`; devuelve `{ nueva_revision_id, revision_label }`
- [x] 6.2 Implementar `PUT /api/v1/compras/comparativas/:id/responder-preguntas` — roles: `procurement`, `admin`; acepta array de `{ detalle_id, respuesta_compras }`; guarda respuestas en los renglones de la nueva revisión; validar que el cuadro esté en `BORRADOR` y sea una revisión (tiene `revision_padre_id`)

## 7. Backend compras — endpoint veredicto

- [x] 7.1 Implementar `PUT /api/v1/compras/comparativas/:id/veredicto` — roles: `resident`, `admin`; acepta `{ veredicto_residente: string, proveedores_sugeridos: string[] }`; valida que cuadro esté en `EN_EVALUACION_TECNICA`; guarda campos; respuesta 200

## 8. Backend compras — endpoint firma y bloqueo

- [x] 8.1 Modificar o crear `POST /api/v1/compras/comparativas/:id/firmar` para: validar que todos los renglones tengan evaluación C/NC/DA (ningún "?" ni PENDIENTE); validar que `veredicto_residente` y `proveedores_sugeridos` estén poblados; transicionar estado a `FIRMADO_BLOQUEADO`; registrar `firmado_por` y `fecha_firma`
- [x] 8.2 Agregar validación en todos los endpoints de modificación del cuadro: si `estado === 'FIRMADO_BLOQUEADO'` y el rol NO es `admin`, rechazar con `403`

## 9. Backend compras — endpoint desbloqueo admin

- [x] 9.1 Implementar `POST /api/v1/compras/comparativas/:id/desbloquear` — roles: `admin` exclusivamente; requiere body `{ justificacion: string }` (mínimo 10 chars); crea registro en `AuditoriaDesbloqueoComparativa`; transiciona cuadro a `EN_EVALUACION_TECNICA`; respuesta 200 con el cuadro actualizado
- [x] 9.2 Implementar `GET /api/v1/compras/comparativas/:id/auditoria-desbloqueos` — roles: `admin`; devuelve array de registros de `AuditoriaDesbloqueoComparativa` para ese cuadro, ordenados por `timestamp_desbloqueo` desc

## 10. Frontend — Formulario de requisición: specs por renglón

- [x] 10.1 En el formulario de creación de requisición en `ResidenciaView` (y en `ComprasView`), agregar debajo de cada renglón de material dos inputs opcionales: "Marca / Modelo ref." (input texto, maxLength 200) y "Especificaciones técnicas" (textarea)
- [x] 10.2 Ampliar el tipo local de ítem de requisición con `especificacion_marca_modelo?: string` y `especificacion_detalle?: string`
- [x] 10.3 Enviar los campos al backend en el POST/PUT de la requisición
- [x] 10.4 Mostrar los campos (solo lectura) en la vista de detalle de una requisición existente (panel solicitud cotización en ComprasView)

## 11. Frontend — ResidenciaView: tab "Para evaluar"

- [x] 11.1 Agregar `'evaluacion'` al tipo `TabId` de `ResidenciaView` — implementado en ComprasView como `pendientes-eval` tab con Layout subItem
- [x] 11.2 Agregar tab "Para evaluar" con badge de conteo en el header de tabs (naranja/ámbar cuando hay pendientes)
- [x] 11.3 En el `useEffect` de carga de datos, incluir `GET /api/v1/compras/comparativas/pendientes-evaluacion` y guardar en estado `pendientesEval`
- [x] 11.4 Renderizar en el tab lista de cuadros pendientes (folio de req, código de cuadro, revisión, fecha de envío)
- [x] 11.5 Al hacer clic en un cuadro, renderizar `<ComparativaDetail modo="residente" ... />`

## 12. Frontend — ComparativaDetail: prop `modo` y vista Residente

- [x] 12.1 Agregar prop `modo: 'compras' | 'residente'` a la interfaz `Props` de `ComparativaDetail` (default: `'compras'` para no romper usos actuales)
- [x] 12.2 En la tabla de cotizaciones, cuando `modo === 'residente'`: ocultar columnas de precio (`linea.precios`), ocultar columna "Ganador", ocultar fila de "Total estimado" y totales por proveedor; mostrar columna "Lo que ofrece" por proveedor (campo `valor_ofrecido_spec` si existe)
- [x] 12.3 En modo residente, ocultar el botón de subir PDF de cotización y el panel IA
- [x] 12.4 En modo residente, mostrar las especificaciones de la req (`especificacion_marca_modelo`, `especificacion_detalle`) por renglón en la columna de descripción
- [x] 12.5 Actualizar `ESTADO_STYLE` con: `FIRMADO_BLOQUEADO` (badge rojo oscuro, label "🔒 Firmado y Bloqueado"), `REVISION_SOLICITADA` (badge naranja, label "Revisión Solicitada")
- [x] 12.6 Actualizar el stepper a 5 pasos: 1. Especificaciones, 2. Cotizando, 3. Evaluación Técnica, 4. Aprob. GT, 5. OC Emitida; mapear `REVISION_SOLICITADA` al paso 3 con estilo de alerta

## 13. Frontend — ComparativaDetail: campo de pregunta al marcar "?"

- [x] 13.1 En el panel de evaluación técnica, cuando el Residente selecciona "?" para un renglón, mostrar inmediatamente un textarea "¿Qué necesitas aclarar?" en la parte baja de ese renglón
- [x] 13.2 Deshabilitar el botón "Guardar Evaluación" mientras algún renglón en "?" no tenga texto de pregunta
- [x] 13.3 Al guardar, detectar si hay renglones con "?": si los hay, llamar `POST /comparativas/:id/revision-con-preguntas` en lugar del endpoint normal de evaluación; si no los hay, continuar con el flujo normal
- [x] 13.4 Post-creación de revisión: mostrar mensaje "Se creó la revisión [X]. Compras verá tus preguntas." y navegar de regreso a la lista

## 14. Frontend — ComparativaDetail: respuesta de Compras a preguntas

- [x] 14.1 En modo `compras`, cuando el cuadro es una revisión (`revision_padre_id` presente) y un renglón tiene `pregunta_residente`, mostrar la pregunta con fondo ámbar en ese renglón
- [x] 14.2 Agregar campo "Respuesta:" (textarea) por renglón con pregunta pendiente
- [x] 14.3 Al guardar respuestas, llamar `PUT /comparativas/:id/responder-preguntas`
- [x] 14.4 En la revisión siguiente (modo residente), mostrar en cada renglón con pregunta: el texto de la pregunta y la respuesta de Compras (fondo verde si respondida)

## 15. Frontend — ComparativaDetail: sección veredicto del Residente

- [x] 15.1 Agregar interfaz `ComparativaLocal.veredicto_residente?: string` y `proveedores_sugeridos?: string[]`
- [x] 15.2 Al pie del cuadro, cuando `estado === 'EN_EVALUACION_TECNICA'` y rol es residente, renderizar la sección "Veredicto del Residente": textarea de veredicto + checkboxes de proveedores del cuadro para seleccionar recomendados
- [x] 15.3 Auto-guardar veredicto con debounce al llamar `PUT /comparativas/:id/veredicto`
- [x] 15.4 Habilitar el botón "Firmar y Bloquear" solo cuando: todos los renglones tienen C/NC/DA, veredicto no vacío, y al menos un proveedor recomendado seleccionado
- [x] 15.5 En modo solo lectura (post-firma), mostrar el veredicto y proveedores sugeridos como info card con nombre del firmante y fecha/hora

## 16. Frontend — ComparativaDetail: firma actualizada y estado FIRMADO_BLOQUEADO

- [x] 16.1 Actualizar el modal de firma para mostrar el veredicto y proveedores sugeridos como resumen antes de confirmar
- [x] 16.2 En el modal de firma, cambiar el texto de confirmación a: "Al firmar, este cuadro quedará bloqueado permanentemente. Solo el administrador podrá desbloquearlo. ¿Confirmas?"
- [x] 16.3 Al confirmar firma exitosa, actualizar el estado local a `FIRMADO_BLOQUEADO` y recargar datos
- [x] 16.4 En estado `FIRMADO_BLOQUEADO`, deshabilitar todos los controles de edición para todos los roles excepto el botón de desbloqueo para `admin`

## 17. Frontend — ComparativaDetail: desbloqueo admin y auditoría

- [x] 17.1 Cuando `estado === 'FIRMADO_BLOQUEADO'` y rol es `admin`, mostrar botón "Desbloquear" con tono destructivo (rojo)
- [x] 17.2 Al hacer clic, mostrar modal con campo "Justificación del desbloqueo" (textarea, requerido, mín 10 chars) y botón de confirmar deshabilitado hasta cumplir mínimo
- [x] 17.3 Al confirmar, llamar `POST /comparativas/:id/desbloquear`; actualizar estado local a `EN_EVALUACION_TECNICA`; mostrar notificación de éxito
- [x] 17.4 Al final del cuadro, para rol `admin`, mostrar sección "Historial de desbloqueos" cargada desde `GET /comparativas/:id/auditoria-desbloqueos`; mostrar: fecha/hora (formato local MX), nombre del admin, justificación

## 18. Integración y deploy

- [x] 18.1 Aplicar migraciones en VPS: `docker exec bocam-vps-compras npx prisma migrate deploy`
- [x] 18.2 Rebuild y restart del servicio `compras` en VPS
- [x] 18.3 Rebuild y restart de `app-shell` en VPS
- [ ] 18.4 Verificar: el Residente crea una req con specs por renglón y los campos se guardan
- [ ] 18.5 Verificar: el Residente abre un cuadro desde ComprasView tab "Eval. Técnica" y NO ve precios
- [ ] 18.6 Verificar: el Residente marca "?" en un renglón, escribe pregunta, guarda → se crea revisión B; Compras ve la pregunta y puede responder
- [ ] 18.7 Verificar: el Residente llena veredicto + proveedores sugeridos → firma → cuadro pasa a FIRMADO_BLOQUEADO
- [ ] 18.8 Verificar: admin puede desbloquear con justificación y el historial queda registrado
- [ ] 18.9 Verificar: ningún rol no-admin puede modificar un cuadro FIRMADO_BLOQUEADO (probar en UI y directo en API)
