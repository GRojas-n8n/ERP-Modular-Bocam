# Checklist QNAP y Deploy SaaS ERP Multi-Tenant

**Fecha:** 2026-03-20  
**Objetivo:** Reiniciar el proceso con una lista unica, clara y operativa para revisar el QNAP y despues desplegar el ERP SaaS multi-tenant/multi-proyecto para pruebas internas, mejoras y optimizaciones.

## Estado actual levantado en sitio

- Modelo confirmado: `TS-832PX`
- Firmware confirmado: `QTS 5.2.8.3359`
- RAM instalada actual: `4 GB`
- Memoria total reportada por QNAP: `3.85 GB`
- Memoria libre observada en captura base: `446 MB`
- Red LAN: IP fija confirmada
- `Container Station`: instalado
- `QVPN Service`: instalado
- Acceso remoto previsto: `VPN`
- Usuario tecnico: existe
- `SSH`: pendiente de confirmar

## Bloqueos actuales antes de deploy

- `4 GB` de RAM queda por debajo de la recomendacion operativa documentada para este stack en QNAP.
- El valor `3.85 GB` observado en QNAP corresponde a RAM total, no a disco libre; el NAS muestra alrededor de `446 MB` de memoria libre en la captura base.
- No se debe planear `core` o `full` como modo principal en este hardware.
- La estrategia aprobada para este NAS sera de corridas ligeras por modulo: `shell-min`, `insumos-dev`, `finanzas-dev`, `compras-dev`, `control-obra-dev`, `contabilidad-dev`, `personal-dev`, `seguridad-dev`.

---

## 1. Checklist de revision del QNAP

### 1.1 Estado base del NAS

- [x] Confirmar modelo del NAS: `TS-832PX`
- [x] Confirmar version actual de firmware QTS/QuTS
- [x] Confirmar que la version es estable, no beta
- [x] Confirmar memoria RAM instalada
- [ ] Confirmar espacio libre suficiente en almacenamiento
- [ ] Confirmar que fecha, hora y zona horaria del NAS son correctas
- [x] Confirmar que el NAS tiene IP fija o reserva DHCP

### 1.2 Red y acceso

- [x] Confirmar IP LAN del NAS
- [ ] Confirmar gateway/router de salida
- [ ] Confirmar DNS configurado en el NAS
- [ ] Confirmar que el acceso web al NAS funciona en la red local
- [x] Confirmar si se usara acceso remoto por VPN
- [ ] Confirmar si se habilitara SSH

### 1.3 Seguridad minima

- [ ] No usar `admin` como usuario cotidiano de acceso remoto
- [x] Crear usuario tecnico dedicado, por ejemplo `erp-tech`
- [ ] Asignar contrasena fuerte a `erp-tech`
- [ ] Confirmar si `erp-tech` estara temporalmente en `administrators`
- [ ] Confirmar que no hay credenciales del ERP guardadas en notas o archivos inseguros del NAS

### 1.4 Aplicaciones necesarias en el NAS

- [x] Confirmar que `Container Station` esta instalado
- [x] Confirmar que `QVPN Service` esta instalado
- [ ] Confirmar que el servicio SSH esta habilitable desde `Telnet/SSH`
- [ ] Confirmar que se pueden crear carpetas compartidas para proyecto, datos y backup

---

## 2. Checklist de acceso remoto seguro

### 2.1 OpenVPN

- [ ] `QVPN Service > OpenVPN` habilitado
- [ ] Puerto configurado: `UDP 1194`
- [ ] Rango IP VPN definido y sin choque con LAN
- [ ] Maximo de clientes definido
- [ ] Cifrado fuerte habilitado
- [ ] DNS definido
- [ ] Certificado actualizado
- [ ] Archivo `.ovpn` descargado
- [ ] `erp-tech` con permiso `OpenVPN`

### 2.2 Router / salida a internet

- [ ] Confirmar IP publica del sitio
- [ ] Configurar `port forwarding` de `UDP 1194 -> IP_DEL_NAS`
- [ ] Confirmar que el router no bloquea VPN
- [ ] Confirmar si hay CGNAT o doble NAT

### 2.3 SSH

- [ ] Habilitar `SSH` en `Panel de control > Telnet / SSH`
- [ ] Confirmar que `erp-tech` puede iniciar sesion por SSH
- [ ] Probar acceso local por SSH antes de probar remoto

### 2.4 Prueba remota

- [ ] Instalar `OpenVPN Connect` en la laptop
- [ ] Importar el archivo `.ovpn`
- [ ] Probar conexion desde otra red distinta
- [ ] Probar acceso web al NAS via VPN
- [ ] Probar `ssh erp-tech@IP_DEL_NAS`

---

## 3. Checklist de preparacion para deploy del ERP

### 3.1 Repo y archivos base

- [ ] Copiar el repositorio completo al NAS
- [ ] Confirmar que existen:
  - [ ] [docker-compose.qnap.yml](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker-compose.qnap.yml)
  - [ ] [docker/Dockerfile.backend](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker/Dockerfile.backend)
  - [ ] [docker/Dockerfile.app-shell](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker/Dockerfile.app-shell)
  - [ ] [docker/Dockerfile.tooling](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/docker/Dockerfile.tooling)
  - [ ] [scripts/qnap/01-start-stack.sh](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/01-start-stack.sh)
  - [ ] [scripts/qnap/02-init-datastores.sh](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/02-init-datastores.sh)
  - [ ] [scripts/qnap/03-smoke-test.sh](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/scripts/qnap/03-smoke-test.sh)

### 3.2 Variables de entorno

- [ ] Copiar [\.env.qnap.example](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/.env.qnap.example) a `.env.qnap`
- [ ] Reemplazar todos los `CAMBIA_...`
- [ ] Confirmar `JWT_SECRET`
- [ ] Confirmar `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- [ ] Confirmar `DATABASE_URL`
- [ ] Confirmar URLs por modulo:
  - [ ] `AUTH_DATABASE_URL`
  - [ ] `COMPRAS_DATABASE_URL`
  - [ ] `FINANZAS_DATABASE_URL`
  - [ ] `CONTROL_OBRA_DATABASE_URL`
  - [ ] `CONTABILIDAD_DATABASE_URL`
  - [ ] `PERSONAL_DATABASE_URL`
  - [ ] `SEGURIDAD_DATABASE_URL`
  - [ ] `GERENCIA_TECNICA_DATABASE_URL`
- [ ] Confirmar `RABBITMQ_URL`
- [ ] Confirmar `REDIS_URL`
- [ ] Confirmar variables de SAT/Contabilidad
- [ ] Confirmar `QNAP_APP_PORT`

### 3.3 Volumenes y persistencia

- [ ] Confirmar carpeta/volumen persistente para PostgreSQL
- [ ] Confirmar carpeta/volumen persistente para RabbitMQ
- [ ] Confirmar carpeta/volumen persistente para Redis
- [ ] Confirmar carpeta/volumen para backups

---

## 4. Checklist de primer deploy

### 4.1 Validacion previa

- [ ] Ejecutar:

```sh
docker compose -f docker-compose.qnap.yml --env-file .env.qnap --profile core config
```

- [ ] Confirmar que no hay errores de sintaxis ni variables faltantes

### 4.2 Arranque del nucleo

- [ ] Elegir primero un perfil ligero compatible con `4 GB` RAM:
  - [ ] `shell-min`
  - [ ] `insumos-dev`
  - [ ] `finanzas-dev`
  - [ ] `compras-dev`
  - [ ] `control-obra-dev`
  - [ ] `contabilidad-dev`
  - [ ] `personal-dev`
  - [ ] `seguridad-dev`
- [ ] Ejecutar:

```sh
STACK_PROFILE=shell-min sh scripts/qnap/01-start-stack.sh
```

- [ ] Confirmar que `postgres` queda `healthy`
- [ ] Confirmar que `rabbitmq` queda `healthy`
- [ ] Confirmar que `auth` inicia
- [ ] Confirmar que `app-shell` inicia
- [ ] Si el perfil elegido usa Redis (`personal-dev`, `seguridad-dev`, `full`), confirmar que `redis` queda `healthy`
- [ ] Si el perfil elegido incluye modulos de negocio, confirmar solo los correspondientes al perfil

### 4.3 Inicializacion Prisma

- [ ] Ejecutar:

```sh
STACK_PROFILE=shell-min sh scripts/qnap/02-init-datastores.sh
```

- [ ] Confirmar que `prisma generate` pasa en los modulos del perfil elegido
- [ ] Confirmar que `gerencia-tecnica` ejecuta `migrate deploy` cuando forme parte del perfil elegido
- [ ] Confirmar que los demas modulos del perfil elegido ejecutan `db push`

### 4.4 Smoke test

- [ ] Ejecutar:

```sh
STACK_PROFILE=shell-min sh scripts/qnap/03-smoke-test.sh
```

- [ ] Confirmar `/health` de los modulos del perfil elegido

### 4.5 Verificacion visual

- [ ] Abrir el shell en navegador
- [ ] Confirmar que carga login
- [ ] Confirmar que el shell responde
- [ ] Confirmar que no hay errores 502/504 inmediatos

---

## 5. Checklist de observacion y tuning

- [ ] Medir RAM usada por el perfil `core`
- [ ] Medir CPU durante build y durante runtime
- [ ] Revisar `docker stats`
- [ ] Revisar logs de:
  - [ ] `finanzas`
  - [ ] `compras`
  - [ ] `control-obra`
  - [ ] `contabilidad`
- [ ] Registrar si hay fallos por `ARM64`
- [ ] Registrar si Prisma falla por engines
- [ ] Registrar tiempos de build

---

## 6. Checklist para ampliar a full

- [ ] No intentar `full` mientras el NAS siga en `4 GB` RAM salvo prueba excepcional y controlada
- [ ] Si un perfil ligero demuestra estabilidad, evaluar solo despues un avance a `core`
- [ ] Si `core` llegara a ser estable, ejecutar:

```sh
STACK_PROFILE=full sh scripts/qnap/01-start-stack.sh
```

- [ ] Confirmar que `personal` inicia
- [ ] Confirmar que `seguridad` inicia
- [ ] Repetir smoke test
- [ ] Confirmar consumo de RAM aceptable antes de dejarlo estable

---

## 7. Criterio de avance

No avanzar al siguiente bloque si el anterior no esta en verde:

1. QNAP sano
2. VPN y SSH funcionando
3. `shell-min` arriba
4. Prisma aplicado al perfil actual
5. smoke test verde del perfil actual
6. shell usable
7. modulo objetivo estable
8. ampliacion gradual a otros perfiles

---

## 8. Siguiente paso recomendado

Seguir esta lista en este orden:

1. Confirmar `SSH`, hora/zona horaria, gateway y DNS del NAS
2. Confirmar espacio libre real en almacenamiento, no solo RAM
3. Crear carpetas persistentes para datos y backups
4. Cerrar acceso remoto seguro por VPN
5. Validar `.env.qnap`
6. Arrancar `shell-min`
7. Medir consumo
8. Afinar
9. Pasar al modulo objetivo del dia (`finanzas-dev`, `compras-dev`, etc.)
10. Dejar `core/full` solo como metas secundarias y no como punto de partida
