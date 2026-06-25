## 1. Documentación del patrón

- [x] 1.1 Verificar que ninguna vista existente en `apps/app-shell/src/views/` realice fetch a un microservicio distinto al propio — documentar hallazgos como deuda técnica si los hay
  - HALLAZGO: `ComprasView.tsx` llama a `gerencia-tecnica/insumos` (línea 384), `gerencia-tecnica/presupuesto/activo` (línea 393) y `POST gerencia-tecnica/insumos` (línea 708). Registrado como deuda técnica en CLAUDE.md.
- [x] 1.2 Agregar comentario de arquitectura en `CLAUDE.md` bajo una sección "Dashboards por módulo" que describa la regla de no-cross-service y el patrón de endpoint `/dashboard`

## 2. Verificación de cumplimiento en vistas existentes

- [x] 2.1 Revisar `ComprasView.tsx` — confirmar que no llama a `/api/v1/finanzas/*` ni otros servicios; si lo hace, crear issue para corregirlo en el change de `dashboard-compras`
  - No llama a finanzas. Sí llama a gerencia-tecnica (3 llamadas). Deuda técnica documentada en CLAUDE.md.
- [x] 2.2 Revisar `GTView.tsx` (o equivalente) — misma verificación
  - No existe GTView.tsx independiente; la lógica GT está integrada en ComprasView.tsx bajo el tab de Compras. OK.
- [x] 2.3 Revisar `FinanzasView.tsx` — misma verificación
  - Solo llama a `/api/v1/finanzas/*`. Cumple el patrón.

## 3. Validación del patrón en los changes de dashboard

- [x] 3.1 Confirmar que cada change `dashboard-*` implementa `GET /api/v1/{servicio}/dashboard` antes de su frontend
  - Todos los changes dashboard-* tienen spec `endpoint-dashboard-{modulo}` que define el endpoint backend antes del spec frontend.
- [x] 3.2 Confirmar que cada `AlgunaView.tsx` modificada por los changes de dashboard no introduce cross-service calls
  - Los specs de todos los dashboards definen que la vista llama únicamente al endpoint `/api/v1/{su-servicio}/dashboard`. Las excepciones (GT → Compras, Residentes → Compras, Control Obra → Finanzas) son backend-to-backend, no frontend.
