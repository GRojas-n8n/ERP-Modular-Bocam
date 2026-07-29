## 1. Verificación previa (ya completada en la sesión de diseño)

- [x] 1.1 Confirmar acceso SSH real al VPS (`~/.ssh/bocam_vps_key`, `root@72.60.114.12`) y estado de los 5 contenedores afectados.
- [x] 1.2 Confirmar en las 5 bases reales que `_prisma_migrations` no existe o está vacía (P3005 latente en las 5).
- [x] 1.3 Comparar tablas reales (`information_schema.tables`) contra `@@map` de cada `schema.prisma` — coinciden 1:1 en los 5 servicios.
- [x] 1.4 Para `contabilidad` (bloquea el fix pendiente), comparar columna por columna (`information_schema.columns`) contra el schema — coincide exactamente (96/96 columnas).

## 2. Generar migraciones baseline (local, sin tocar producción)

- [x] 2.1 Para cada uno de los 5 servicios (`contabilidad` primero), correr `prisma migrate diff --from-empty --to-schema-datamodel apps/<svc>/prisma/schema.prisma --script --output apps/<svc>/prisma/migrations/<timestamp>_baseline/migration.sql`.
- [x] 2.2 Revisar cada `migration.sql` generado: confirmar que crea exactamente las tablas/columnas ya verificadas en el paso 1, nada más y nada menos. (Coinciden exactamente: contabilidad 5 tablas, seguridad 6, ventas 3, almacen 2, control-proyectos 7)
- [ ] 2.3 Commitear las 5 carpetas `migrations/<timestamp>_baseline/` (sin PR de código de aplicación, solo migraciones).

## 3. Aplicar el baseline en producción (requiere confirmación explícita antes de ejecutar)

**Pausa obligatoria**: antes de correr cualquier comando de este grupo contra el VPS real, mostrar al usuario el comando exacto y esperar confirmación explícita — es una operación sobre producción, aunque sea de solo metadata.

- [ ] 3.1 `contabilidad`: `docker compose -f docker-compose.vps.yml run --rm contabilidad node_modules/.bin/prisma migrate resolve --applied <timestamp>_baseline --schema apps/contabilidad/prisma/schema.prisma` vía SSH.
- [ ] 3.2 Verificar `SELECT migration_name, finished_at FROM _prisma_migrations;` en `bocam_contabilidad` — debe mostrar exactamente 1 fila con `finished_at` no nulo.
- [ ] 3.3 Repetir 3.1–3.2 para `seguridad`, `ventas`, `almacen`, `control-proyectos` (uno a la vez, verificando cada uno antes de seguir).

## 4. Desbloquear y verificar el fix de roles pendiente

- [ ] 4.1 Re-disparar el deploy de `contabilidad` (`gh workflow run deploy-vps-backend.yml -f services=contabilidad`, o equivalente) y confirmar que el job "Build + Deploy backend (Docker)" ahora completa sin error P3005.
- [ ] 4.2 Verificar que el contenedor `bocam-vps-contabilidad` quedó healthy con el código de `fix-rol-finance-conciliar-cfdi` (commit `86f1cf3`) corriendo.
- [ ] 4.3 Retomar la task 4.1 de `fix-rol-finance-conciliar-cfdi` (verificación manual con usuario real de Finanzas contra conciliar-cfdi/reportes) ahora que el deploy sí llegó a producción.

## 5. Cierre

- [ ] 5.1 Confirmar que un push de prueba trivial a alguno de los 4 servicios restantes (o los 8 que ya tenían migraciones) sigue desplegando sin regresión.
- [ ] 5.2 Actualizar memoria: documentar el gap encontrado, el baseline aplicado, y que `fix-rol-finance-conciliar-cfdi` quedó verificado en producción (o lo que resulte de 4.3).
