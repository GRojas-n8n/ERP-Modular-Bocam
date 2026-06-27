# fix-tests-req-imprevisto-y-finanzas-db — Tasks

## Contexto

Dos tests fallan por campos faltantes o URL de BD mal derivada.

---

### Bug A — `req-imprevisto-aprobar` (tests 9.1 y 9.2 fallan)

**Archivo:** `apps/compras/test/integration/req-imprevisto-aprobar.integration.test.ts`

**Error:** `POST /api/v1/compras/requisiciones` devuelve 400 en tests 9.1 y 9.2.

**Root cause (completo):** El endpoint requiere `concepto_id` (añadido por `control-costos-wbs`)
Y `justificacion` en cada ítem con `es_imprevisto: true` (línea 163 en `main.ts`). Los tests
9.1 y 9.2 no incluían ninguno de los dos campos.

**Validaciones en main.ts:**
```typescript
// línea 149
if (!concepto_id) return res.status(400)...

// línea 163
if ((esImprevisto || excede) && (!item.justificacion || ...trim() === '')) {
  return res.status(400)...
}
```

---

### Bug B — `finanzas.feedback` integration test

**Archivo:** `apps/compras/test/integration/finanzas.feedback.integration.test.ts`

**Error:** `PrismaClientInitializationError: Can't reach database server at localhost:5432`

**Root cause:** La URL de Finanzas se derivaba de la URL de Compras reemplazando
`schema=compras` → `schema=finanzas`. Ese patrón era válido con una BD mono-schema,
pero en la arquitectura actual cada microservicio tiene su propia BD con credenciales
distintas. En VPS no hay `localhost:5432` accesible; el runner debe pasar
`FINANZAS_DATABASE_URL`.

---

## Tasks

- [x] A1. En `test91()` y `test92()`, agregar `concepto_id: randomUUID()` al body del POST
  y `justificacion` a cada ítem `es_imprevisto: true`.

- [x] A2. Correr req-imprevisto en VPS → 6/6 tests PASS.

- [x] B1. Reemplazar la derivación `finanzasDbUrl` por lectura directa de env var:
  ```typescript
  const finanzasDbUrl = process.env.FINANZAS_DATABASE_URL || (
    comprasDbUrl.includes('schema=compras')
      ? comprasDbUrl.replace('schema=compras', 'schema=finanzas')
      : 'postgresql://postgres:bocam_dev_password@localhost:5432/bocam_erp?schema=finanzas'
  );
  ```

- [x] B2. Script runner del VPS ya exporta `FINANZAS_DATABASE_URL` apuntando a `bocam_finanzas`.

- [x] B3. Correr `finanzas.feedback.integration.test.ts` en VPS → PASS (5 aserciones).
