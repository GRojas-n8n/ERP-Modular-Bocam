# Deudas independientes observadas — 2026-09-30

Se registran como evidencia. Ninguna se implementa en este change ni depende de él.

## D-1. Prueba flaky `outbox-dispatcher-arranque` (Compras): `EADDRINUSE`

- **Síntoma:** `Error: fallo en el hijo (valor "1"): excepción no controlada: Error: listen EADDRINUSE: address already in use :::45906` en el paso `Run Compras outbox integration` de `backend-e2e`; falla `npm run test:integration:outbox-dispatcher-arranque`.
- **Run afectado observado:** `36756776129` (`pull_request`, sha `49141e3`, PR #187, solo documental), job `110028914344`. Volvió a correr en verde con el commit siguiente del mismo PR (run `36757987659`) y en los runs posteriores (#188: `36758959516`), sin cambios de código. Una sola ocurrencia registrada.
- **Causa probable (por lectura del código):** `apps/compras/test/integration/outbox-dispatcher-arranque.integration.test.ts:28` fija `process.env.PORT = 45000 + floor(random × 2000)`. Es un puerto aleatorio de un rango de 2000 sin comprobar que esté libre: dos arranques consecutivos (la prueba levanta procesos hijos por valor de variable) o cualquier otro proceso del runner pueden chocar.
- **No confundir con:** los fallos `36669509255` y `36669022748` (`recepcion-oc-compras-almacen`, 2026-09-30 ~04:30 UTC) fueron otra causa (filas pendientes compartidas del outbox) y se corrigieron en #186.
- **Recomendación (change pequeño de CI, separado):** reservar el puerto de forma segura: abrir un servidor en el puerto `0`, leer el puerto asignado por el sistema, cerrarlo y pasarlo al hijo (o hacer que el servicio acepte `PORT=0` y reporte el puerto real al padre); añadir reintento acotado solo ante `EADDRINUSE`. No ampliar reintentos de toda la suite.

## D-2. Fallo transitorio de `ssh-keyscan` en el despliegue

- **Evidencia para `deploy-ssh-host-key-pinning`:** el run `36749362201` (`Deploy Backend al VPS`, #185, merge `8da1afe`), intento 1, job `110003773463` (17:09:34–17:09:42 UTC), falló en el paso `Configurar llave SSH` con `ssh-keyscan -H *** >> ~/.ssh/known_hosts 2>/dev/null` → `Process completed with exit code 1`. Falló antes de cualquier acción en producción (el smoke quedó `skipped`). El intento 2 del mismo run terminó en `success`.
- **Lectura:** el workflow obtiene la clave de host del VPS en cada despliegue con `ssh-keyscan`, que es a la vez un punto de fallo transitorio (el escaneo no devolvió clave) y un riesgo de confianza en el primer uso. Es precisamente el alcance de `deploy-ssh-host-key-pinning`.
- **Acción:** esta evidencia se referencia desde aquí. No se modifica la carpeta local `openspec/changes/deploy-ssh-host-key-pinning` (sin versionar) ni se toca ningún workflow.
