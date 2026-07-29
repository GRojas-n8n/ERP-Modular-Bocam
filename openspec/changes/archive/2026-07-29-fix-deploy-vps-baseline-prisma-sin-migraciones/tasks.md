## 1. Verificación previa (ya completada en la sesión de diseño)

- [x] 1.1 Confirmar acceso SSH real al VPS (`~/.ssh/bocam_vps_key`, `root@72.60.114.12`) y estado de los 5 contenedores afectados.
- [x] 1.2 Confirmar en las 5 bases reales que `_prisma_migrations` no existe o está vacía (P3005 latente en las 5).
- [x] 1.3 Comparar tablas reales (`information_schema.tables`) contra `@@map` de cada `schema.prisma` — coinciden 1:1 en los 5 servicios.
- [x] 1.4 Para `contabilidad` (bloquea el fix pendiente), comparar columna por columna (`information_schema.columns`) contra el schema — coincide exactamente (96/96 columnas).

## 2. Generar migraciones baseline (local, sin tocar producción)

- [x] 2.1 Para cada uno de los 5 servicios (`contabilidad` primero), correr `prisma migrate diff --from-empty --to-schema-datamodel apps/<svc>/prisma/schema.prisma --script --output apps/<svc>/prisma/migrations/<timestamp>_baseline/migration.sql`.
- [x] 2.2 Revisar cada `migration.sql` generado: confirmar que crea exactamente las tablas/columnas ya verificadas en el paso 1, nada más y nada menos. (Coinciden exactamente: contabilidad 5 tablas, seguridad 6, ventas 3, almacen 2, control-proyectos 7)
- [x] 2.3 Commitear las 5 carpetas `migrations/<timestamp>_baseline/` (sin PR de código de aplicación, solo migraciones). (commit `20195d3`, pusheado)

## 3. Aplicar el baseline en producción (requiere confirmación explícita antes de ejecutar)

**Pausa obligatoria**: antes de correr cualquier comando de este grupo contra el VPS real, mostrar al usuario el comando exacto y esperar confirmación explícita — es una operación sobre producción, aunque sea de solo metadata. (Confirmado por el usuario 2026-07-29.)

- [x] 3.1 `contabilidad`: rebuild de imagen (para incluir la migración nueva) + `docker compose -f docker-compose.vps.yml run --rm contabilidad node_modules/.bin/prisma migrate resolve --applied 20260729052247_baseline --schema apps/contabilidad/prisma/schema.prisma` vía SSH.
- [x] 3.2 Verificado: `bocam_contabilidad._prisma_migrations` tiene 1 fila, `finished_at` no nulo, `applied_steps_count=0`.
- [x] 3.3 Repetido para `seguridad` (20260729052315_baseline), `ventas` (20260729052319_baseline), `almacen` (20260729052323_baseline — la tabla ya existía vacía, ahora tiene el registro), `control-proyectos` (20260729052327_baseline). Las 5 bases verificadas con exactamente 1 fila cada una.

## 4. Desbloquear y verificar el fix de roles pendiente

- [x] 4.1 Se optó por rebuild + `up -d` manual vía SSH en vez de re-disparar el workflow (más rápido, mismo resultado real): `docker compose build contabilidad && docker compose up -d contabilidad` — sin error P3005 (el baseline ya estaba aplicado).
- [x] 4.2 `bocam-vps-contabilidad` healthy con la imagen nueva (`erp-modular-bocam-contabilidad`, no el hash viejo de 2 días). Verificado además a nivel de código: `grep -c "'finance'"` = 0, `grep -c "'finanzas'"` = 18 dentro del contenedor corriendo.
- [ ] 4.3 Retomar la task 4.1 de `fix-rol-finance-conciliar-cfdi` (verificación manual con usuario real de Finanzas contra conciliar-cfdi/reportes) ahora que el deploy sí llegó a producción.

## 5. Cierre

- [x] 5.1 Validado con el pipeline real (no solo réplica manual por SSH): `gh workflow run deploy-vps-backend.yml -f services="seguridad ventas almacen control-proyectos"` (run 30425640599) completó build+migrate+up+healthy+smoke-test en verde para los 4. `contabilidad` sola (run 30425562294) también completó build+migrate+up+healthy — el P3005 está resuelto — pero ese run falló DESPUÉS en un paso no relacionado (ver hallazgo nuevo abajo).
- [x] 5.2 Memoria actualizada (ver `fix-deploy-vps-baseline-prisma-sin-migraciones-2026-07-29.md`).

## 6. Hallazgo nuevo, fuera de alcance de este change

- [x] 6.1 El run de `contabilidad` sola (30425562294) reveló un bug preexistente y distinto en `deploy-vps-backend.yml`: el paso final `if [ "$svc" = "contabilidad" ]; then build contabilidad-sat-worker; fi` no pasa `--profile sat`, y ese servicio está `profiles: ["sat"]` (desactivado en este VPS, SAT real no está en producción). Falla con `no such service: contabilidad` y aborta el script completo (`set -eu`) — bloquea que el pipeline termine limpio cuando `contabilidad` está en la lista de servicios, aunque el propio deploy de contabilidad ya haya quedado healthy antes de ese punto. Documentado en memoria como pendiente, candidato a su propio bug-fix (agregar `--profile sat` o envolver ese paso en un check de si el profile está activo).
