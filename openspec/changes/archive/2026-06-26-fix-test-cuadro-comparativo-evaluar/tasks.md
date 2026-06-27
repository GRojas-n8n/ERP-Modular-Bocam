# fix-test-cuadro-comparativo-evaluar — Tasks

## Contexto

`apps/compras/test/integration/cuadro-comparativo-dos-etapas.integration.test.ts`
falla en el Paso 2 (`PATCH /evaluar`) con 400.

**Root cause:** El test envía `evaluacion_tecnica: 'APROBADO'` pero el endpoint
`/evaluar` cambió su vocabulario a `['C', 'NC', 'DA', '?', 'PENDIENTE']` cuando se
implementó `comparativa-evaluacion-v2`. `'APROBADO'` ya no es un valor válido.

**Error observado:**
```
400 → "Valor de evaluación inválido: 'APROBADO'. Valores permitidos: C, NC, DA, ?, PENDIENTE"
```

**Código del endpoint (main.ts:2527):**
```typescript
const VALID_VALUES = new Set(['C', 'NC', 'DA', '?', 'PENDIENTE']);
```

**Archivo afectado:**
- `apps/compras/test/integration/cuadro-comparativo-dos-etapas.integration.test.ts`

## Tasks

- [x] 1. En `testHappyPathCompleto`, Paso 2 (`PATCH /evaluar`):
  - Cambiar `evaluacion_tecnica: 'APROBADO'` → `evaluacion_tecnica: 'C'`
  - `'C'` = Cumple (equivalente semántico de APROBADO en el nuevo vocabulario)
  - Ajustar la aserción `b2.data.detalles[0].evaluacion_tecnica` → `'C'` (ya no `'APROBADO'`)

- [x] 2. Buscar si otros tests en el mismo archivo usan valores legacy (`'APROBADO'`, `'RECHAZADO'`)
  y actualizarlos al nuevo vocabulario:
  - `'APROBADO'` → `'C'`
  - `'RECHAZADO'` → `'NC'`

- [x] 3. Revisar `seedCuadroEnAprobacionGT()`: tiene `evaluacion_tecnica: 'APROBADO'` en
  el detalle seed (línea ~175). Si la BD tiene un check constraint, actualizar a `'C'`
  (o verificar que el schema lo permita como valor legacy).

- [x] 4. Correr el test en VPS y verificar PASS:
  ```bash
  DATABASE_URL=postgresql://bocam_admin:S77S.52p-016t4t5n7nt@172.18.0.3:5432/bocam_compras \
  JWT_SECRET=bocam-e2e-secret \
  node -r ./node_modules/ts-node/register/transpile-only \
    apps/compras/test/integration/cuadro-comparativo-dos-etapas.integration.test.ts
  ```
