# Overview SaaS VPS

## Objetivo
Este documento resume la arquitectura objetivo del ERP Modular BOCAM desplegado en un VPS Hostinger bajo un modelo SaaS Multi-Tenant y Multi-Proyecto.

## Principios
- Cada modulo es un servicio independiente.
- Cada modulo es soberano de sus datos.
- Toda operacion transaccional debe respetar `tenant_id` y `proyecto_id`.
- La comunicacion entre modulos se hace por HTTP interno o eventos RabbitMQ.
- Solo el reverse proxy publica puertos a internet.

## Componentes principales
- `caddy` o `nginx`: borde publico y TLS.
- `app-shell`: frontend principal.
- `auth`: identidad, JWT, proyectos autorizados, refresh tokens.
- `gerencia-tecnica`: catalogo tecnico y presupuesto base.
- `compras`: requisiciones, comparativas y ordenes de compra.
- `finanzas`: suficiencia presupuestal, compromisos y pagos.
- `control-obra`: avances fisicos, bitacoras y estimaciones.
- `contabilidad`: asientos, conciliaciones y cierre fiscal.
- `contabilidad-sat-worker`: procesos asincronos SAT.
- `personal`: talento, asignaciones y prenomina.
- `seguridad`: incidentes, inspecciones, permisos y capacitaciones.
- `ventas`: clientes, cotizaciones y facturas.
- `postgres`: motor de base de datos.
- `rabbitmq`: bus de eventos.
- `redis`: cache y soporte a procesos rapidos.

## Topologia objetivo en VPS
- Un VPS Hostinger corre todos los contenedores Docker.
- Cada modulo backend corre en su propio contenedor.
- `postgres`, `rabbitmq`, `redis` y `app-shell` corren tambien en contenedores separados.
- El reverse proxy es el unico servicio expuesto por `80` y `443`.

## Aislamiento de datos
La arquitectura objetivo usa una base de datos por modulo dentro del mismo motor PostgreSQL:
- `bocam_auth`
- `bocam_gerencia_tecnica`
- `bocam_compras`
- `bocam_finanzas`
- `bocam_control_obra`
- `bocam_contabilidad`
- `bocam_personal`
- `bocam_seguridad`
- `bocam_ventas`

Esto reduce acoplamiento y mantiene soberania de datos sin multiplicar motores de base de datos.

## Contexto de seguridad
- El `tenant_id` y `proyecto_id` deben salir del JWT verificado.
- El backend nunca debe confiar ciegamente en payloads de frontend para decidir el contexto.
- Las politicas RLS deben reforzar en PostgreSQL el mismo contexto de seguridad.

## Flujos de comunicacion
- Lecturas sincronas: HTTP interno entre contenedores.
- Reacciones asincronas: RabbitMQ.
- Ejemplo: Compras consulta a Finanzas por suficiencia y luego publica eventos consumidos por Finanzas y Contabilidad.

## Estado esperado para deploy
- `docker-compose.vps.yml` es la unica fuente operativa del stack VPS.
- `.env.vps` define secretos y URLs reales.
- Cada modulo apunta a su propia base.
- El stack cuenta con healthchecks, backups y smoke tests.
