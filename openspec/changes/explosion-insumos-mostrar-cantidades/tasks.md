## 1. Backend — cálculo de cantidad agregada

- [x] 1.1 ~~Escribir test que reproduzca el gap~~ — **Descubierto al implementar: el gap NO está en el backend.** `GET /api/v1/gerencia-tecnica/insumos/explosion` (`apps/gerencia-tecnica/src/main.ts:124-164`) YA calcula y retorna `cantidad_presupuestada` con exactamente el `groupBy`/suma descrito abajo — existía antes de este change (usado hoy por `ResidenciaView` para requisiciones "Por Insumo"). El gap real es que la pestaña "Insumos" del frontend llama al endpoint plano `GET /insumos` (sin cantidad) en vez de `/insumos/explosion`.
- [x] 1.2 ~~Implementar el groupBy/sum~~ — no aplica, ya existe (ver 1.1).
- [x] 1.3 ~~Integrar el cálculo en los handlers~~ — no aplica, `/insumos/explosion` ya lo expone. No se tocó `/insumos` (endpoint plano) para no afectar otros consumidores.
- [x] 1.4 Verificado en el código existente: un insumo sin composiciones da `cantidad_presupuestada: 0` (`explosion.get(i.id) ?? 0`), no `null`/ausente.
- [x] 1.5 No aplica (no hubo cambio de backend).

## 2. Frontend — mostrar cantidad en la vista

- [x] 2.1 `fetchInsumos` en `InsumosView.tsx` ahora llama a `/api/v1/gerencia-tecnica/insumos/explosion` en vez de `/insumos`. Se agregó columna "Cantidad" a la tabla de la pestaña Insumos, mostrando `cantidad_presupuestada` + `unidad_medida` (formato `es-MX`, 4 decimales máx., mismo patrón usado en el resto del archivo).
- [x] 2.2 Con `cantidad_presupuestada` ausente/0, se muestra "0 <unidad>" (fallback `?? 0` en el render), no en blanco.

## 3. Verificación

- [ ] 3.1 Probar manualmente en un proyecto real con Catálogo + Explosión + APU cargados y presupuesto aprobado: confirmar que las cantidades mostradas coinciden con la suma esperada de las composiciones. (Pendiente — requiere ambiente corriendo; queda para QA/revisión humana.)
- [x] 3.2 No se tocó `apps/gerencia-tecnica` (backend sin cambios) — no aplica riesgo de regresión en `aislamiento-insumos-por-proyecto-gt`. Se corrió la suite completa de `InsumosView.*.test.tsx` en `apps/app-shell`: 15/15 verde, sin regresiones.
