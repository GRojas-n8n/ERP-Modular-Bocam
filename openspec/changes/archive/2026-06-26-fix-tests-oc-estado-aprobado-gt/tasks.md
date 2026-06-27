# fix-tests-oc-estado-aprobado-gt — Tasks

## Contexto

Dos tests de compras llaman a `POST /comparativas/:id/convertir-oc` con una comparativa
en estado `ABIERTO`. El endpoint ahora exige `estado === 'APROBADO_GT'` (negocio: la OC
solo puede generarse tras la doble aprobación Residente + GT). Los seeds no se actualizaron
cuando se implementó `cuadro-comparativo-aprobacion-dos-etapas`.

**Error observado:**
```
Error al convertir: "La OC solo puede generarse de un cuadro aprobado por Gerencia Técnica. Estado actual: ABIERTO"
→ 500 en reconciliacion.e2e   |   500 en oc-error-alert integration (esperado 502)
```

**Archivos afectados:**
- `apps/compras/test/e2e/reconciliacion.e2e.test.ts` → función `seedComparativa()`
- `apps/compras/test/integration/oc-error-alert.integration.test.ts` → función `seedComparativaConGanador()`

## Tasks

- [x] 1. Actualizar `seedComparativa()` en `reconciliacion.e2e.test.ts`
  - Cambiar `estado: 'ABIERTO'` → `estado: 'APROBADO_GT'`
  - Agregar campos requeridos: `evaluacion_residente_id: randomUUID()`, `fecha_evaluacion_tecnica: new Date()`, `gerente_tecnico_id: randomUUID()`, `fecha_aprobacion_gt: new Date()`
  - En el detalle del cuadro: agregar `evaluacion_tecnica: 'C'`, `aprobacion_gt: 'APROBADO'`
  - Verificar que `testComparativaToOcFlow` pasa (respuesta 200 → OC EMITIDA)
  - Verificar que `testOcCancelFlow` sigue pasando

- [x] 2. Actualizar `seedComparativaConGanador()` en `oc-error-alert.integration.test.ts`
  - Mismos cambios de estado y campos que task 1
  - Verificar que `testAlertaGeneradaEnFalloSincrono` ahora llega al step de comprometer-fondos
    y retorna 502 (Finanzas stub falla → OC queda en `ERROR_FINANZAS`) en vez de 500

- [x] 3. Correr ambos tests en VPS y verificar PASS
  - `reconciliacion.e2e.test.ts` → PASS (6 aserciones)
  - `oc-error-alert.integration.test.ts` → PASS (5 aserciones)
