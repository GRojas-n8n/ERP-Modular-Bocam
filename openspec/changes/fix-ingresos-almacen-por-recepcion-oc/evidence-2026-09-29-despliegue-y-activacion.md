# Evidencia: despliegue de Compras (#169) y activación del despachador — 2026-09-29

Registro de lo ejecutado con autorización expresa del titular. No se crearon proyectos, órdenes, recepciones ni datos de prueba.

## Despliegue de Compras (#169)

| Dato | Valor |
|---|---|
| PR | #169 (rama actualizada con `main` mediante merge normal, sin rebase ni force-push) |
| Merge commit | `a7fff6c` |
| Workflow `Deploy Backend al VPS` | run `36645918565`, verde; reconstruyó únicamente `compras` |
| `Backend E2E Criticas` | run `36645918284`, verde |
| Migraciones aplicadas (`prisma migrate deploy`) | exactamente `20260925130000_outbox_eventos` y `20260925140000_snapshot_insumo_oc_items` (24 migraciones en el repo; 2 nuevas) |
| `_prisma_migrations` | ambas con `finished_at` y sin `rolled_back_at`; 0 migraciones fallidas pendientes |
| Smoke del deploy | 2 pruebas Playwright verdes |

## Esquema en producción (`bocam_compras`)

- `outbox_eventos`: 14 columnas; índices `outbox_eventos_pkey`, `uq_outbox_recepcion` y `outbox_eventos_estado_proximo_intento_en_idx`.
- RLS **habilitado y forzado** (`relrowsecurity` y `relforcerowsecurity` verdaderos); política `rls_outbox_eventos_context` (ALL, con `USING` y `WITH CHECK`). Se aplicó por la propia migración: **no se ejecutó el workflow manual de RLS** (ver tarea 6.2i).
- `ordenes_compra_items`: existen `clave_snapshot` (50), `descripcion_snapshot` (text), `unidad_snapshot` (20) y `categoria_snapshot` (50).

## Respaldos (no se borran)

- Volcado completo previo a las migraciones: `pg_dump -Fc` de `bocam_compras`, en el VPS `/root/backups/pre-pr169/bocam_compras_20260929T232643Z.dump` (+ `.sha256`).
- SHA-256 `5fce7b9031b207bc902c23270cae77d7dfd867ed6edf495be4717adaced11624`; `pg_restore -l` lo lista sin errores (no se probó una restauración).
- Copia local con checksum verificado: `D:\04_SISTEMA_Y_DEV\07 Recursos y Configuraciones\Respaldos Iretum\pre-pr169_bocam_compras_20260929T232643Z\`.
- Copia del `.env` del VPS anterior a la activación: `/root/backups/pre-pr169/env_20260929T234251Z.bak` (permisos 600).

## Activación del despachador (aprox. 2026-09-29 23:43 UTC)

- `COMPRAS_OUTBOX_DISPATCHER` no estaba en el `.env` del VPS (el compose usaba `off` por defecto). Se añadió una única línea `COMPRAS_OUTBOX_DISPATCHER=on`; el resto del archivo quedó idéntico línea por línea.
- Se recreó solo Compras (`up -d --no-build --no-deps --force-recreate compras`). RabbitMQ y Almacén no se tocaron.
- Log: `compras.outbox.dispatcher_enabled` / `dispatcher enabled`.
- `/ready` (puerto 3002): `database`, `event_bus` y `outbox_dispatcher` en `ok`, con `ultima_tanda_en` reciente y sin `ultimo_error`.
- Smoke oficial posterior (`workflow_dispatch`): run `36646776085`, 2 pruebas verdes (`login y dashboard…` y `sin proyecto activo…`).

## Estado de RabbitMQ (sin modificaciones)

- `almacen.compras_recepcion_oc_registrada_v1.v3`: 1 consumidor, 0 mensajes; es el **único binding** de `compras.recepcion_oc_registrada.v1` en `bocam.events`.
- `.v3.retry` y `.v3.dlq`: 0 mensajes.
- `.v2`, `.v2.retry` y `.v2.dlq`: intactas, vacías y sin binding. **No se borran.**

## Comprobación final de estabilidad (2026-09-29 ~23:47 UTC)

Compras `healthy`, 0 reinicios, sin OOM; `/ready` con las tres comprobaciones en `ok`; 0 líneas de error/reintento en los logs; `outbox_eventos` sin ninguna fila (ni pendientes ni fallidas); `.v3` con 1 consumidor; retry y DLQ vacías. HTTPS `/` responde 200 y la ruta protegida sin token responde 401.

## Observaciones ajenas a este change (no se corrigen aquí)

- `docker compose` avisa `The "CONTROL_OBRA_DATABASE_URL" variable is not set. Defaulting to a blank string.` Preexistente y no relacionado con el outbox.
- El runbook mencionaba `.env.vps` / `--env-file .env.vps`, pero en el VPS solo existe `/root/ERP-Modular-Bocam/.env`. Se corrigió el runbook (solo texto).
- `.env` tiene permisos 644 (legible por todos los usuarios del host). No se modificó.
