# Checklist Post Deploy

## Infraestructura
- [ ] El VPS responde por SSH.
- [ ] Docker y Docker Compose funcionan.
- [ ] UFW esta activo.
- [ ] El dominio resuelve al VPS.

## Contenedores
- [ ] `postgres` esta arriba.
- [ ] `rabbitmq` esta arriba.
- [ ] `redis` esta arriba si el perfil lo requiere.
- [ ] `auth` esta arriba.
- [ ] `gerencia-tecnica` esta arriba.
- [ ] `compras` esta arriba.
- [ ] `finanzas` esta arriba.
- [ ] `control-obra` esta arriba.
- [ ] `contabilidad` esta arriba.
- [ ] `contabilidad-sat-worker` esta arriba.
- [ ] `personal` esta arriba si aplica.
- [ ] `seguridad` esta arriba si aplica.
- [ ] `app-shell` esta arriba.
- [ ] `caddy` o `nginx` esta arriba.

## Datos
- [ ] Existen bases por modulo en PostgreSQL.
- [ ] Prisma generate se ejecuto correctamente.
- [ ] Las migraciones corrieron.
- [ ] RLS se aplico donde corresponde.

## Salud
- [ ] `/api/v1/auth/health`
- [ ] `/api/v1/gerencia-tecnica/health`
- [ ] `/api/v1/compras/health`
- [ ] `/api/v1/finanzas/health`
- [ ] `/api/v1/control-obra/health`
- [ ] `/api/v1/contabilidad/health`
- [ ] `/api/v1/personal/health`
- [ ] `/api/v1/seguridad/health`

## Funcional
- [ ] Login funciona.
- [ ] El JWT trae `tenant_id`.
- [ ] El JWT trae `proyecto_id`.
- [ ] Un endpoint protegido responde con token valido.
- [ ] Compras consulta a Finanzas correctamente.
- [ ] Finanzas publica/consume eventos correctamente.
- [ ] Contabilidad recibe eventos correctamente.

## Seguridad y borde
- [ ] HTTPS responde.
- [ ] Solo `80` y `443` estan expuestos publicamente.
- [ ] No hay backends expuestos directos.

## Backups
- [ ] Se genero backup inicial.
- [ ] El directorio de backups existe.

## Cierre
- [ ] El stack quedo listo para pruebas internas.
- [ ] Los issues detectados quedaron registrados en GitHub.
