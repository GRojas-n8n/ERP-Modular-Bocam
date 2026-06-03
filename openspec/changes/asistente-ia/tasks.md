# Tasks — Asistente IA

## Bloque 0 — Scaffolding del microservicio

- [x] Crear `apps/asistente/package.json` (nombre: `@bocam/asistente`, port 3011, deps: express, @anthropic-ai/sdk, multer, express-rate-limit, axios, dotenv)
- [x] Crear `apps/asistente/tsconfig.json` (extiende `../../tsconfig.base.json`, `verbatimModuleSyntax: true`)
- [x] Crear `apps/asistente/.env.example` con las 9 variables del design (PORT, JWT_SECRET, ANTHROPIC_API_KEY, ANTHROPIC_TIMEOUT_MS, *_URL)
- [x] Crear `apps/asistente/src/types.ts` — interfaces: `RenglonCotizacion`, `ResumenEjecutivo`, `AlertaPredictiva`
- [x] Crear `apps/asistente/src/main.ts` — Express setup + `createAuthMiddleware` + `createObservabilityMiddleware` + rate limiter + routes + `/health`
- [x] Crear `apps/asistente/src/prompts.ts` — los 3 system prompts como constantes con `cache_control: { type: 'ephemeral' }`

## Bloque 1 — Endpoint `leer-cotizacion`

- [x] Crear `apps/asistente/src/routes/leer-cotizacion.ts`
  - `POST /api/v1/asistente/leer-cotizacion` con `requireRoles('procurement', 'admin')`
  - Middleware multer: acepta solo PDF, max 10 MB
  - Leer buffer → base64 → llamada Claude con `document` content block
  - Parsear JSON de respuesta, validar schema `{ proveedor, renglones[] }`
  - Respuestas: 200 éxito / 400 no PDF / 413 excede tamaño / 503 Claude timeout

## Bloque 2 — Endpoint `resumen-ejecutivo`

- [x] Crear `apps/asistente/src/routes/resumen-ejecutivo.ts`
  - `GET /api/v1/asistente/resumen-ejecutivo` con `requireRoles('superintendent', 'admin')`
  - `Promise.allSettled` a los 6 módulos con `buildForwardHeaders(req)`
  - Consolidar KPIs en objeto estructurado; anotar módulos que fallaron
  - Llamada Claude con KPIs + system prompt analista
  - Devolver `{ resumen, modulos_con_error, generado_en }`

## Bloque 3 — Endpoint `alertas-predictivas`

- [x] Crear `apps/asistente/src/routes/alertas-predictivas.ts`
  - `GET /api/v1/asistente/alertas-predictivas` con `requireRoles('superintendent', 'admin', 'finance')`
  - Fetch presupuestos (finanzas) + avances físicos (control-obra) con `buildForwardHeaders`
  - Regresión lineal simple en memoria por capítulo (≥ 3 puntos)
  - Si no hay capítulos en riesgo → devolver `{ alertas: [], proyecto_saludable: true }` sin llamar Claude
  - Si hay riesgo → llamar Claude para narrativa, parsear `{ alertas[] }`
  - Devolver `{ alertas, proyecto_saludable }`

## Bloque 4 — Infraestructura

- [x] Crear `apps/asistente/Dockerfile` (patrón: `COPY . .` + `npm_config_production=false npm ci`, igual que `Dockerfile.reportes`)
- [x] Agregar servicio `asistente` en `docker-compose.vps.yml` (profile: `core`, puerto 3011, `ANTHROPIC_API_KEY` desde `.env`)
- [x] Agregar bloque proxy en `docker/nginx.qnap.conf`:
  ```
  location /api/v1/asistente/ {
      proxy_pass http://asistente:3011;
  }
  ```
- [x] Agregar `ASISTENTE_URL=http://asistente:3011/api/v1/asistente` al env de `app-shell` en docker-compose (para que el frontend pueda llamar por nombre de servicio)
- [x] Agregar `asistente` al workspace en `pnpm-workspace.yaml` (o verificar glob `apps/*`)

## Bloque 5 — Frontend: ComprasView (subir cotización PDF)

- [x] Agregar función `leerCotizacionPDF(proveedorNombre, file)` en `apps/app-shell/src/lib/api.ts` — `POST /api/v1/asistente/leer-cotizacion` multipart
- [x] En `ComprasView.tsx`: agregar botón "Subir cotización PDF" por proveedor en el cuadro comparativo
- [x] Mostrar spinner/loading mientras Claude procesa (estado `uploading`)
- [x] Abrir `SideSheet` de revisión con tabla editable de renglones extraídos
  - Columnas: descripción, unidad, cantidad, precio unitario
  - Cada celda editable antes de aplicar
- [x] Botón "Aplicar al cuadro" → poblar las celdas del proveedor en la tabla comparativa existente
- [x] Manejo de errores: toast si el backend devuelve 503 ("Claude no disponible") o 413 ("PDF muy grande")

## Bloque 6 — Frontend: DashboardView (resumen + alertas)

- [x] Agregar función `getResumenEjecutivo()` en `api.ts` — `GET /api/v1/asistente/resumen-ejecutivo`
- [x] Agregar función `getAlertasPredictivas()` en `api.ts` — `GET /api/v1/asistente/alertas-predictivas`
- [x] En `DashboardView.tsx`: botón "¿Cómo va la obra? ↗" en el `OperationalBanner`
  - Click → spinner 3-8s + `SideSheet` con texto del resumen narrativo
  - Texto con `whitespace-pre-wrap` para respetar párrafos
- [x] Sección de alertas predictivas debajo del hero de avance:
  - Se carga con `useEffect` al montar el dashboard (solo para `superintendent`/`admin`)
  - Renderizar solo si `alertas.length > 0` (silencio si está sano)
  - Máximo 3 alertas, badge de severidad: `alta` → rojo, `media` → ámbar
  - Cada alerta: título + descripción + recomendación en card colapsable

## Bloque 7 — Demo mode

- [x] En `demoData.ts`: agregar `demoResumenEjecutivo` y `demoAlertasPredictivas` con datos narrativos
- [x] En `DashboardView.tsx`: si `isDemo` → usar `demoData` en lugar de llamar al backend en ambas funciones
- [x] En `ComprasView.tsx`: si `isDemo` → botón no se muestra (comportamiento silencioso correcto)

## Bloque 8 — Health & verificación

- [x] Verificar `GET /api/v1/asistente/health` responde `{"status":"ok","module":"asistente"}`
- [x] Verificar `POST /api/v1/asistente/leer-cotizacion` sin auth devuelve 401
- [x] Verificar rate limiter: 11 requests en < 1 min → 429
- [x] Build TypeScript sin errores: `npx tsc --noEmit` en `apps/asistente/` — solo errores pre-existentes del monorepo
