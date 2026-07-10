## Context

Confirmado en código: `Proyecto` vive en `apps/auth/prisma/schema.prisma:39-56`
(no en `gerencia-tecnica` como podría suponerse) con
`codigo_centro_costos String @db.VarChar(50)` sin validación de formato, y
`estatus String @default("CONSTRUCCION")` con vocabulario
`LICITACION | ADJUDICADO | CONSTRUCCION | CIERRE_TECNICO | CIERRE_FINANCIERO`
(comentario línea 46). El único endpoint de creación es
`POST /api/v1/auth/admin/proyectos` (`apps/auth/src/main.ts:825-865`), detrás
de `requireAdminRole` (`main.ts:715-722`, solo verifica `roles.includes('admin')`).
El frontend correspondiente es `apps/app-shell/src/views/AdminView.tsx`
(formulario con input de texto libre para el código, línea ~215).

`apps/ventas/prisma/schema.prisma:18-33` ya tiene `model Cliente` completo
(rfc, razón social, email, teléfono, estatus) pero sin ningún código
secuencial de 3 dígitos.

`proyecto_id` (UUID) es la clave que usan todos los microservicios para
relacionar datos a un proyecto/obra (confirmado en `ventas`, `almacen`,
`compras`, etc.) — este change no toca esa relación, solo enriquece los
metadatos del `Proyecto` en `auth`.

## Goals / Non-Goals

**Goals:**
- El código de 13 posiciones se ensambla, valida y persiste de forma
  consistente, sin permitir captura manual libre salvo el caso especial.
- El consecutivo por (año, cliente) es correcto incluso bajo creación
  concurrente.
- Ampliar `Proyecto` con los campos financieros/de plazos sin romper los
  proyectos ya existentes.
- Acotar el alta a `admin`, `gerencia_tecnica`, `control_proyectos`.

**Non-Goals:**
- No se publica ningún evento RabbitMQ en este change (queda para un change
  posterior, dependiente de este — punto 3 del roadmap).
- No se migran los códigos de proyectos existentes al formato de 13
  posiciones — quedan como están.
- No se construye aquí el CRM/pipeline de prospectos de Ventas (eso es un
  change aparte) — solo se agrega el campo `codigo_cliente` al `Cliente` ya
  existente.
- No se automatiza el seed de los 51 clientes reales contra producción —
  queda como tarea manual explícita, para no insertar datos de negocio reales
  sin confirmación de quien opera el sistema.

## Decisions

### 1. Extender `Proyecto` existente, no crear una entidad `CentroDeCostos` nueva
`Proyecto` ya lleva el comentario `Centro de Costos / Sucursal` y es la clave
(`proyecto_id`) que usan todos los módulos. Crear una tabla paralela
duplicaría la entidad y obligaría a sincronizar dos fuentes de verdad.
- **Alternativa descartada**: tabla `CentroDeCostos` 1:1 con `Proyecto`. Se
  descarta por la duplicación y porque no aporta nada que una migración
  aditiva sobre `Proyecto` no resuelva.

### 2. Código de 13 posiciones: ensamblado, no capturado
Se agregan columnas estructuradas en `Proyecto`:
```prisma
empresa_grupo              String   @db.VarChar(3)   // CIB | HCO | HSE | SEO
anio_centro_costos         Int
cliente_id                 String?  @db.Uuid          // referencia lógica a Ventas.Cliente, sin FK
consecutivo_centro_costos  Int
es_especial                Boolean  @default(false)
tipo_especial              String?  @db.VarChar(20)   // OFICINA | TALLER | ALMACÉN, solo si es_especial
```
`codigo_centro_costos` se sigue guardando (para no romper lecturas
existentes) pero ahora es **derivado**: para un proyecto normal,
`empresa_grupo + anio_centro_costos + cliente_codigo.padStart(3,'0') +
consecutivo.padStart(3,'0')`; para uno especial, el texto libre que capture
el usuario (ej. `"OFICINA-CDMX"`), sin máscara de 13.
- **Alternativa descartada**: parsear el código de 13 posiciones al vuelo en
  cada consulta en vez de guardar columnas estructuradas. Se descarta porque
  el cálculo del consecutivo (Decisión 3) necesita filtrar por
  `(anio, cliente_id)` con una query indexada, no con substring matching
  sobre un VARCHAR.
- El frontend NO ofrece un input de texto libre para el código en el caso
  normal — lo ensambla a partir de los 4 selectores/inputs estructurados y lo
  muestra de solo lectura con formato visual tipo máscara (agrupado en
  bloques). Esto ya cumple "evitar errores de captura manual" (punto 5g) sin
  necesitar una librería de input-mask para un campo que el usuario no
  teclea. El input de texto libre solo aparece cuando `es_especial = true`.

### 3. Consecutivo: cálculo transaccional + reintento ante colisión
```
consecutivo = COUNT(*) FROM proyectos
              WHERE tenant_id = ? AND empresa_grupo = ? AND anio_centro_costos = ? AND cliente_id = ?
              + 1
```
El `create` se ejecuta dentro de la misma transacción que el `COUNT`, y se
apoya en el `@@unique([tenant_id, codigo_centro_costos])` ya existente: si
dos altas concurrentes calculan el mismo consecutivo, la segunda falla por
violación de unicidad y el backend reintenta el cálculo una vez (mismo patrón
de reintento simple, sin colas ni locks distribuidos).
- **Alternativa descartada**: tabla de contadores (`SecuenciaCentroCostos`)
  con `SELECT ... FOR UPDATE`. Se descarta por complejidad innecesaria dado
  el volumen esperado (altas de centros de costos son eventos poco
  frecuentes, no de alto throughput).

### 4. `codigo_cliente` en Ventas — validado en rango, no autoincremental libre
`codigo_cliente String @db.VarChar(3)` en `Cliente`, único por tenant, con
validación de aplicación (no constraint de BD) de rango `000`-`050` al
crear/editar. Se elige VARCHAR sobre INT para preservar ceros a la izquierda
sin lógica de formato repetida en cada lectura.
- El modal "+ Agregar Cliente" (frontend) llama al endpoint existente de
  creación de `Cliente` en `apps/ventas` (a extender para aceptar
  `codigo_cliente`) y, al responder, inyecta el nuevo cliente en el selector
  de `AdminView` sin recargar — el formulario de centro de costos en curso no
  se pierde porque el modal es un overlay sobre el mismo estado de React, no
  una navegación.

### 5. Migración del vocabulario de `estatus`
Mapeo de valores existentes al nuevo vocabulario, aplicado como parte de la
migración de Prisma:
| Valor actual | Valor nuevo |
|---|---|
| `LICITACION` | `ABIERTO` |
| `ADJUDICADO` | `ABIERTO` |
| `CONSTRUCCION` | `EN EJECUCIÓN` |
| `CIERRE_TECNICO` | `EN COBRO` |
| `CIERRE_FINANCIERO` | `CERRADO` |

`TERMINADO` queda disponible como estado nuevo entre `EN COBRO` y `CERRADO`
sin equivalente legacy — ningún proyecto existente se migra a él
automáticamente.
- **Alternativa descartada**: mantener ambos vocabularios en paralelo
  (legacy + nuevo) con una bandera de "versión de estatus". Se descarta por
  complejidad — el campo no es un enum real de Postgres, es un `String`
  convencional, así que remapear los valores existentes es una migración de
  datos simple y reversible (se documenta el mapeo inverso por si hace falta
  revertir).

### 6. RBAC: middleware específico, no ampliar `requireAdminRole` global
`requireAdminRole` se usa en múltiples endpoints administrativos (gestión de
usuarios, tenants) que deben seguir siendo exclusivos de `admin`. Se agrega
un middleware nuevo `requireProyectoWriteRole` (o se reutiliza el patrón
`requireRoles(...)` de otros servicios si `apps/auth` ya lo expone) aplicado
únicamente a `POST` y `PATCH /api/v1/auth/admin/proyectos`.
- **Frontend**: `AdminView.tsx` hoy asume acceso completo de `admin`. Se
  ajusta el guard de ruta/pestaña para que `gerencia_tecnica` y
  `control_proyectos` puedan llegar a la pestaña de Proyectos/Centros de
  Costos específicamente, sin exponerles gestión de usuarios ni de tenants
  (que siguen exclusivas de `admin`).

## Risks / Trade-offs

- **[Riesgo]** Proyectos legacy con código libre conviven con proyectos
  nuevos de 13 posiciones — cualquier reporte o parser que asuma el formato
  rígido debe tolerar ambos.
  → **Mitigación**: documentar explícitamente que `codigo_centro_costos` no
    tiene formato garantizado para proyectos creados antes de este change;
    los campos estructurados (`empresa_grupo`, etc.) son `null` en esos
    registros y no deben usarse como fuente de verdad para ellos.
- **[Riesgo]** Cambiar el vocabulario de `estatus` puede romper cualquier
  consumidor (frontend, otro servicio) que compare contra los valores viejos
  en texto.
  → **Mitigación**: `grep` de los valores legacy (`LICITACION`, `ADJUDICADO`,
    etc.) en el resto del monorepo antes de implementar, como tarea previa a
    tocar el schema.
- **[Riesgo]** Ampliar RBAC de creación de proyectos a `gerencia_tecnica` y
  `control_proyectos` amplía la superficie de quién puede crear centros de
  costos — impacto en facturación/legal si se crean centros de costos
  incorrectos.
  → **Mitigación**: el endpoint sigue auditado (ya existe `logInfo`/patrón de
    auditoría en otros endpoints admin de este archivo); no se propone
    aprobación en dos pasos en este change, pero queda como posible mejora
    futura si el negocio lo pide.

## Open Questions
- ¿El seed de los 51 clientes reales se corre contra producción como parte
  del despliegue de este change, o se deja para que Compras/Ventas los capture
  manualmente conforme se necesiten? (Este change deja el mecanismo listo —
  script de seed idempotente — pero no lo ejecuta automáticamente.)
