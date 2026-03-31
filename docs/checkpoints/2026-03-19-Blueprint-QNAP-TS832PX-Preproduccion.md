# Checkpoint: Blueprint de despliegue en QNAP TS-832PX para preproduccion interna

**Fecha:** 2026-03-19  
**Responsable:** Codex  
**Estado:** Documento de arquitectura / operacion

---

## 1. Veredicto ejecutivo

**Si, es posible y funcional** desplegar este sistema SaaS en un **QNAP TS-832PX** para:

- uso exclusivo de la empresa duena del NAS
- pruebas operativas internas
- ajustes funcionales durante el resto del anio
- consolidacion previa al salto a un VPS dedicado

**No lo recomiendo** como hosting final para la etapa de comercializacion SaaS multi-cliente.

El uso correcto del NAS en este contexto es:

- **preproduccion interna estable**
- **pilotaje empresarial**
- **validacion operativa**

No debe considerarse la plataforma definitiva de produccion comercial.

---

## 2. Base tecnica que si soporta el plan

El **TS-832PX** ofrece:

- CPU ARM Cortex-A57 64-bit
- 4 GB RAM base, expandible a 16 GB
- 8 bahias SATA
- 2 puertos 10GbE SFP+
- 2 puertos 2.5GbE
- soporte de snapshots
- soporte de contenedores via QNAP / Container Station

Esto lo hace suficiente para una etapa interna de validacion, siempre que el despliegue se haga con contenedores y no como instalacion manual del stack.

---

## 3. Lo que el repo ya tiene y lo que todavia falta

### Ya existe

- [docker-compose.yml](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker-compose.yml)
- [docker-compose.prod.yml](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker-compose.prod.yml)
- [apps/app-shell/Dockerfile](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/Dockerfile)
- [apps/compras/Dockerfile](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/Dockerfile)
- [apps/gerencia-tecnica/Dockerfile](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/Dockerfile)
- [\.env.prod.example](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/.env.prod.example)

### Todavia falta para desplegar el sistema completo

No encontre `Dockerfile` para:

- `auth`
- `finanzas`
- `control-obra`
- `contabilidad`
- `personal`
- `seguridad`

Ademas, [docker-compose.prod.yml](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker-compose.prod.yml) hoy solo contempla:

- `postgres.prod`
- `redis.prod`
- `rabbitmq.prod`
- `gerencia-tecnica`
- `compras`
- `app-shell`

Eso significa que **hoy el repo no esta listo para levantar en el NAS el SaaS completo**.  
Si esta listo como base, pero no como entrega operativa final.

---

## 4. Recomendacion de arquitectura en el NAS

### Estrategia

Usar el QNAP como un **entorno de preproduccion containerizado** con esta topologia:

#### Capa de entrada

- `reverse-proxy`
  - Nginx o Traefik
  - TLS
  - rutas hacia microservicios
  - opcionalmente solo accesible por VPN o red corporativa

#### Frontend

- `app-shell`

#### Core de identidad y negocio

- `auth`
- `gerencia-tecnica`
- `compras`
- `finanzas`
- `control-obra`
- `contabilidad`
- `personal`
- `seguridad`

#### Infraestructura

- `postgres`
- `rabbitmq`
- `redis`

#### Operacion

- `sat-worker` o worker de integracion, si se mantiene separado del servicio principal

---

## 5. Topologia de datos recomendada para el TS-832PX

### Para esta fase interna

#### Opcion recomendada

- **1 solo clúster PostgreSQL**
- **1 sola instancia RabbitMQ**
- **1 sola instancia Redis**
- **1 red Docker privada**
- **1 proxy de entrada**

Cada modulo sigue siendo soberano por:

- schema propio o base propia dentro de PostgreSQL
- RLS
- anti-join entre modulos
- comunicacion por HTTP/eventos

### Lo que no recomiendo en el NAS

- un PostgreSQL por contenedor/modulo
- demasiadas redes separadas
- demasiados sidecars

Eso complica operacion y consume RAM innecesariamente para esta etapa.

---

## 6. Requisitos minimos antes de subirlo al NAS

### Hardware / sistema

- subir RAM del NAS a **16 GB**
- usar **SSD** para las cargas de base de datos si es posible
- habilitar **snapshots**
- tener **UPS**
- separar volumen de datos del volumen de backups si el layout del NAS lo permite

### Red y seguridad

- **no exponer** el NAS directamente a internet publica si no es estrictamente necesario
- preferir:
  - VPN corporativa
  - ACL por IP
  - reverse proxy con TLS
- no reutilizar usuarios/password default del NAS
- rotar secretos de:
  - JWT
  - PostgreSQL
  - RabbitMQ
  - SAT callback

### Aplicacion

Antes del despliegue completo hay que:

1. crear `Dockerfile` de todos los modulos faltantes
2. extender `docker-compose.prod.yml` al sistema completo
3. validar que todo corra en **ARM64**
4. verificar Prisma y dependencias nativas en esa arquitectura
5. preparar archivos `.env` reales por entorno

---

## 7. Blueprint operativo recomendado

### Fase A. Preparacion del NAS

1. Actualizar QTS / QuTS a una version estable.
2. Instalar **Container Station**.
3. Crear volumen para:
   - `postgres-data`
   - `rabbitmq-data`
   - `redis-data`
   - `uploads` / `backups`
4. Crear red interna de contenedores.
5. Configurar reverse proxy y certificados.

### Fase B. Adaptacion del repositorio

1. Completar Dockerfiles faltantes.
2. Crear compose de preproduccion para **todos los modulos**.
3. Definir healthchecks.
4. Definir restart policies.
5. Definir volumes persistentes.

### Fase C. Validacion tecnica

1. Levantar infraestructura base.
2. Levantar microservicios.
3. Ejecutar migraciones Prisma.
4. Correr pruebas criticas:
   - reconciliacion
   - seguridad RBAC
   - idempotencia
   - integracion RabbitMQ
5. Validar observabilidad y logs.

### Fase D. Operacion interna

1. Acceso solo usuarios internos.
2. Monitoreo diario de:
   - RAM
   - CPU
   - disco
   - colas RabbitMQ
   - crecimiento de PostgreSQL
3. Snapshots y backup recurrente.
4. Registro de incidencias y tuning.

---

## 8. Lo que si seria funcional durante este anio

### Casos buenos para el NAS

- pruebas funcionales reales
- operacion de usuarios internos
- validacion de flujos multi-modulo
- pruebas de carga moderadas
- depuracion de despliegue y observabilidad
- ensayo de backups y restore

### Casos donde empezara a doler

- muchos usuarios concurrentes
- internet publica abierta
- SLAs estrictos
- alta disponibilidad
- comercializacion multi-cliente

---

## 9. Riesgos reales

### Riesgo 1. Arquitectura ARM64

El NAS es ARM64.  
Hay que validar que:

- Prisma
- Node
- dependencias nativas
- imagenes base

funcionen bien en `linux/arm64`.

### Riesgo 2. El repo aun no esta containerizado completo

Hoy faltan Dockerfiles y compose expandido para todos los servicios.

### Riesgo 3. El NAS no debe ser la plataforma comercial final

Aunque funcione para la empresa duena, no es la base ideal para vender el SaaS.

### Riesgo 4. Seguridad perimetral

Exponer un NAS a internet publica aumenta superficie de ataque.

---

## 10. Recomendacion final

### Si recomiendo el plan, con estas condiciones

- uso interno
- fase temporal
- acceso controlado
- contenedores
- RAM ampliada
- despliegue completo endurecido
- salida planeada a VPS dedicado

### No recomiendo

- usar el NAS como plataforma comercial final
- exponerlo como SaaS publico multi-cliente
- asumir que el compose actual ya esta listo para eso

---

## 11. Siguiente paso correcto

El siguiente paso con mas valor es **preparar el stack real para el NAS**, en este orden:

1. completar `Dockerfile` de todos los modulos faltantes
2. construir un `docker-compose.qnap.yml` de preproduccion interna
3. definir estrategia de volumenes/backups
4. validar `linux/arm64`
5. probar el despliegue completo del sistema en contenedores

---

## 12. Conclusion

**Si, tu idea es viable y funcional** para el objetivo que planteas.  
La forma correcta de hacerlo es tratar el QNAP TS-832PX como un **entorno interno serio de preproduccion**, no como el hosting definitivo del SaaS comercial.
