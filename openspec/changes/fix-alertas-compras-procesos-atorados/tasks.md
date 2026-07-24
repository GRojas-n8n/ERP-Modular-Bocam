## 1. Backend — constante de umbral

- [x] 1.1 Agregar constante `DIAS_ALERTA_PROCESO_ATORADO = 5` en `apps/compras/src/main.ts`, cerca de `OC_STATUS`.

## 2. Backend — alerta `oc_error_finanzas` en el dashboard

- [x] 2.1 Test de integración: `GET /api/v1/compras/dashboard` con una fila `AlertaOcError` (`resuelta: false`) para el tenant/proyecto activo — reproduce el bug (hoy NO aparece en `alertas[]`). Test escrito y en rojo antes de tocar el handler.
- [x] 2.2 Test: una `AlertaOcError` con `resuelta: true` NO aparece en `alertas[]`.
- [x] 2.3 Test: una `AlertaOcError` de otro `tenant_id`/`proyecto_id` no aparece (aislamiento). **Hallazgo real durante la implementación:** la primera versión de la query no filtraba explícitamente por `tenant_id`/`proyecto_id` (dependía solo de RLS) y el test detectó una fuga cross-tenant real en el entorno local (donde `DATABASE_URL` usa el superusuario `postgres`, que bypasea RLS igual que `bocam_admin` en prod — ver memoria `hallazgo-rls-bypass-bocam-admin`). Corregido agregando filtro explícito, mismo patrón ya usado en el resto del archivo.
- [x] 2.4 Implementar: agregar la query de `alertaOcError.findMany({ where: { resuelta: false, tenant_id, proyecto_id } })` al `Promise.all` del handler del dashboard (`main.ts:~4157`) y mapear a `{ tipo: "oc_error_finanzas", oc_id, oc_codigo, error_message, dias_vencida }`. Tests de 2.1-2.3 en verde.

## 3. Backend — alerta `requisicion_sin_cuadro`

- [x] 3.1 Test: una `Requisicion` `APROBADA` sin `CuadroComparativo`, con `fecha_solicitud` de hace más de `DIAS_ALERTA_PROCESO_ATORADO` días, aparece en `alertas[]` con `tipo: "requisicion_sin_cuadro"` y `dias_vencida` correcto. Test escrito y en rojo primero.
- [x] 3.2 Test: la misma situación pero con `fecha_solicitud` de hace menos del umbral NO aparece.
- [x] 3.3 Test: una `Requisicion` `APROBADA` que SÍ tiene un `CuadroComparativo` asociado (aunque sea reciente) no aparece, sin importar antigüedad.
- [x] 3.4 Implementar la query (requisiciones `APROBADA` con `cuadros_comparativos` vacío, filtro de antigüedad, filtro explícito tenant/proyecto) y el mapeo a `alertas[]`. Tests 3.1-3.3 en verde.

## 4. Backend — alerta `cuadro_atorado`

- [x] 4.1 Test: un `CuadroComparativo` en `BORRADOR` con `fecha_creacion` de hace más del umbral aparece en `alertas[]` con `tipo: "cuadro_atorado"`.
- [x] 4.2 Test parametrizado: cada uno de los estados no terminales (`CON_SOLICITUD`, `EN_COTIZACION`, `EN_EVALUACION_TECNICA`, `EVALUADO_TECNICAMENTE`, `EN_APROBACION_GT`, `REVISION_SOLICITADA`, `FIRMADO_BLOQUEADO`) con antigüedad excedida aparece en `alertas[]`. **`LOCKED` excluido deliberadamente del seed parametrizado**: un trigger de BD (`fn_prevent_locked_comparativa_modification`) hace inmutable cualquier fila `estado='LOCKED'` (ni UPDATE ni DELETE posibles tras crearla) — sembrar una en test dejaría basura permanente en la BD. La lógica de `CUADRO_ESTADOS_TERMINALES` trata `LOCKED` igual que `FIRMADO_BLOQUEADO` (mismo `notIn`), cubierto por revisión de código en vez de seed directo.
- [x] 4.3 Test: cada uno de los estados terminales (`APROBADO_GT`, `RECHAZADO_GT`, `CERRADO`, `SUPERSEDIDO`) NO aparece sin importar antigüedad.
- [x] 4.4 Test: un cuadro no terminal con antigüedad por debajo del umbral no aparece.
- [x] 4.5 Implementar la query (con filtro explícito tenant/proyecto) y el mapeo a `alertas[]`. Tests 4.1-4.4 en verde.

## 5. Backend — resolución de alerta en `reconciliar-finanzas`

- [x] 5.1 Test de integración que reproduce el bug real de producción: una OC en `ERROR_FINANZAS` con `AlertaOcError.resuelta = false`, se llama `POST /ordenes-compra/:id/reconciliar-finanzas` con Finanzas respondiendo éxito (stub) — confirmado en rojo antes del fix (la OC pasaba a `EMITIDA` pero la alerta quedaba `resuelta: false` para siempre).
- [x] 5.2 Test: reconciliación exitosa de una OC sin fila de `AlertaOcError` asociada no lanza error.
- [x] 5.3 Test: reconciliación que vuelve a fallar (Finanzas responde error) no toca `AlertaOcError.resuelta` y el endpoint retorna el error explícito (502, ya cubierto por el `catch` existente — sin cambio de código, solo test nuevo).
- [x] 5.4 Implementar `prisma.alertaOcError.updateMany({ where: { tenant_id, oc_id: id }, data: { resuelta: true } })` en la rama de éxito de `reconciliar-finanzas` (`main.ts:~4582`, antes de responder). Tests 5.1-5.3 en verde.

## 6. Frontend — sección de alertas en el dashboard de Compras

- [x] 6.1 Sección "Alertas" en `ComprasView.tsx` reescrita para renderizar los 4 tipos de `alertas[]` (el dashboard ya se consumía en esa vista; se amplió el tipo de `dashboardData.alertas` con los campos nuevos opcionales).
- [x] 6.2 Para `tipo: "oc_error_finanzas"`: muestra `error_message` y botón "Reintentar" (gateado por `isProcurement`, mismo set de roles que el backend) que llama a `reconciliar-finanzas` y refresca vía `fetchData()`.
- [x] 6.3 Reintento fallido muestra `notify({ type: 'error', ... })` con el mensaje del backend — no se silencia.
- [x] 6.4 `requisicion_sin_cuadro` y `cuadro_atorado` muestran folio/código, estado y antigüedad, sin acción adicional (como definido en el spec).

## 7. Verificación

- [x] 7.1 Suite de tests de `apps/compras` (runner propio del proyecto, no vitest — `npm run test:integration:*` / `test:e2e:*`) en verde: 9 tests nuevos en `dashboard-alertas-procesos-atorados.integration.test.ts`, 3 tests nuevos + 6 existentes en `reconciliacion.e2e.test.ts`, y toda la suite preexistente de compras (`oc-error-alert`, `finanzas-feedback`, `seguridad`, `oc-enviar-correo`, `estado-respuesta-proveedor`, `fecha-entrega-partida`, `fichas-tecnicas-adjuntas`, `proveedores-importar-lote`) sin regresiones.
- [x] 7.2 `npx tsc -b` en `app-shell` sin errores. `npx tsc --noEmit` en `compras` sin errores.
- [ ] 7.3 Verificación manual contra el VPS de producción (solo lectura hasta este punto): confirmar que las 3 requisiciones/cuadros/OC reales identificados en la auditoría (`REQ-1783617019976`, `REQ-1784043026310`, `REQ-1784042683588`) aparecen correctamente clasificados en `alertas[]` una vez desplegado el fix. **Pendiente** — requiere el fix desplegado en el VPS.
- [ ] 7.4 Verificación manual en navegador: la sección de alertas se ve en el dashboard de Compras y el botón "Reintentar" resuelve realmente la OC `OC-AUTO-1784066268618-1` (o confirma que Finanzas sigue rechazando el presupuesto, en cuyo caso queda documentado como hallazgo separado fuera de alcance de este fix). **Pendiente** — el entorno local de `auth` tiene 3 migraciones de Prisma sin aplicar y en estado no baseline-able directo (`P3005`, la BD ya tiene datos no rastreados por el historial de migraciones); no se forzó una resolución de esquema para no arriesgar el entorno de desarrollo compartido. Verificación de UI en navegador queda para hacerse contra el VPS tras desplegar, o resolviendo el drift de migraciones de `auth` en una sesión aparte.
