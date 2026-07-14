## Context

`POST /api/v1/personal/empleados` (`apps/personal/src/main.ts:65+`) ya
define las reglas de validación de un Empleado: `nombre`/
`apellido_paterno`/`rfc`/`puesto`/`salario_diario` obligatorios,
`categoria` (default `OBRERO`) y `tipo_contrato` (default `PLANTA`)
opcionales, `numero_empleado` autogenerado (`EMP-XXX`, buscando el
último `numero_empleado` del tenant y sumando 1). El schema tiene
`@@unique([tenant_id, rfc])` y `@@unique([tenant_id, numero_empleado])`
(`apps/personal/prisma/schema.prisma:77-78`).

`createTenantContext` (`apps/personal/src/db.ts:21-37`) envuelve todo el
callback en un único `prisma.$transaction(...)` — a diferencia de
"cada creación es su propia operación", **todo el lote de este change
corre dentro de una sola transacción de BD**. Esto es una diferencia
importante frente a `carga-masiva-clientes-ventas` y
`carga-masiva-proveedores-compras`: ahí también se usaba
`createTenantContext` una sola vez para todo el lote, pero ninguno de
los dos depende de una lectura-antes-de-escribir secuencial dentro del
mismo lote — aquí sí, por el `numero_empleado` autoincremental.

`csvImport.ts` (`apps/app-shell/src/lib/csvImport.ts`, creado en
`carga-masiva-clientes-ventas`) ya resuelve el parseo CSV/Excel →
arreglo de objetos por encabezado de columna — se reutiliza tal cual.

## Goals / Non-Goals

**Goals:**
- Que un usuario `personal_rh`/`admin` pueda subir un CSV/Excel con
  varios empleados y crearlos todos de una vez, con feedback claro de
  cuáles se crearon y cuáles fallaron (y por qué).
- Reutilizar exactamente las mismas reglas de validación que ya existen
  para la alta individual — sin duplicar lógica de negocio.
- Que `numero_empleado` se asigne correctamente y sin colisiones para
  cada fila del lote, igual que si se hubieran dado de alta una por una.

**Non-Goals:**
- No se permite actualizar empleados existentes vía el mismo archivo
  (upsert) — solo altas nuevas. Un RFC ya existente en el tenant se
  reporta como error de fila, no se sobrescribe.
- El lote solo captura el subconjunto de campos más comúnmente cargado
  en bloque (`nombre`, `apellido_paterno`, `apellido_materno`, `rfc`,
  `curp`, `nss`, `puesto`, `categoria`, `tipo_contrato`,
  `fecha_ingreso`, `salario_diario`, `telefono`, `email`). Campos de
  jornada/asistencia (`modo_asistencia`, `tipo_jornada`, horarios) y
  `certificaciones` quedan en su default — se configuran después desde
  la ficha individual, igual que hoy.
- No se valida el RFC/CURP/NSS contra el SAT/IMSS — mismo alcance que la
  alta individual hoy (solo obligatoriedad).
- No se agrega plantilla descargable de ejemplo — mismo criterio que los
  2 changes anteriores de esta serie.

## Decisions

### D1 — Mismo patrón exacto que los 2 changes anteriores de la serie
Parseo client-side con `csvImport.ts` (ya existente, sin tocar),
endpoint dedicado que recibe JSON ya estructurado, reporte por fila sin
todo-o-nada, duplicados dentro del archivo detectados antes de tocar la
BD. Ver `carga-masiva-clientes-ventas` (PR #44) para la justificación
completa de cada decisión de diseño compartida; aquí solo se documentan
las diferencias específicas de Empleados.

### D2 — Verificación de duplicados y validación ANTES de crear, no depender de P2002
A diferencia de la alta individual (que deja que Prisma lance `P2002` si
el RFC ya existe, capturado genéricamente por el `catch` externo como
500), el endpoint de lote verifica explícitamente `rfc` duplicado
(dentro del archivo y contra el tenant) y valida `salario_diario` como
numérico ANTES de intentar el `create`. Esto es obligatorio aquí — como
todo el lote corre dentro de un único `$transaction` (ver Context), un
error no controlado (`P2002`, o un `Decimal` inválido por
`salario_diario` no numérico) haría rollback de **todo** el lote, no
solo de la fila problemática, rompiendo la garantía de "reporta por
fila, no aborta todo".

### D3 — `numero_empleado` se asigna secuencialmente dentro de la misma transacción
Cada registro válido del lote consulta el último `numero_empleado` del
tenant (mismo query que la alta individual, línea 80-84) justo antes de
crear su propio registro, dentro del mismo bucle secuencial (`for` con
`await`, sin paralelizar). Como todo corre en una sola transacción
Postgres, cada lectura ve los registros ya creados por iteraciones
previas del mismo lote (consistencia de lectura dentro de la
transacción) — los números se asignan sin huecos ni colisiones,
igual que si cada fila se hubiera dado de alta una por una en
secuencia.

## Risks / Trade-offs

- **[Riesgo] Archivo grande con miles de filas podría ser lento (creates
  secuenciales, no batch, más una consulta extra por fila para
  `numero_empleado`)** → Mismo trade-off aceptado en los 2 changes
  anteriores: fuera de alcance, el caso de uso es catálogos de
  decenas/cientos de empleados.
- **[Riesgo] Como todo el lote es una sola transacción, una fila que sí
  logre pasar validación pero falle en el `create` por una razón no
  anticipada (ej. constraint no contemplado) revierte el lote completo**
  → Mitigación: D2 cubre los dos casos conocidos (RFC duplicado,
  salario_diario no numérico); si aparece un caso nuevo en producción, se
  documenta como bug-fix aparte con spec, no se parchea aquí a ciegas.

## Migration Plan

- Sin cambios de schema.
- Branch `feat/carga-masiva-empleados-personal`.
- Deploy: `apps/personal` requiere rebuild/restart manual del contenedor
  en el VPS tras mergear (sin CI/CD); frontend se despliega al mergear a
  `main`.
- Rollback: revertir el commit — endpoint aditivo, sin riesgo de datos.

## Open Questions

- Ninguna abierta.
