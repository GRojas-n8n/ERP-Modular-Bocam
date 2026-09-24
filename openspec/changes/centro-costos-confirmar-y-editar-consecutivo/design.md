## Context

Estado verificado en el código (2026-09-24):

- `apps/auth/src/centro-costos-policy.ts`: `ensamblarCodigoCentroCostos({empresa, anio, codigoCliente, consecutivo})` (13 posiciones: `EMPRESA[3] + AÑO[4] + CLIENTE[3] + CONSECUTIVO[3]`) y `siguienteConsecutivo(count) = count + 1`.
- `POST /api/v1/auth/admin/proyectos` (`main.ts` ~l. 1043–1190): para el caso no especial cuenta proyectos `(tenant_id, empresa_grupo, anio_centro_costos, cliente_id)`, calcula `siguienteConsecutivo(count) + intento` y crea; ante `P2002` (violación del único `(tenant_id, codigo_centro_costos)`) reintenta hasta 3 veces. Publica `auth.centro_costos_creado` con el código y el consecutivo.
- `crearProyectoSchema` (Zod) no incluye `consecutivo_centro_costos`.
- Prisma `Proyecto`: `consecutivo_centro_costos Int?`, `codigo_centro_costos String @db.VarChar(50)`, `@@unique([tenant_id, codigo_centro_costos])`.
- `AdminView.tsx` `ProyectoModal`: `codigoPreview` = `${empresa}${año}${cliente.padStart(3,'0')}···`; nota "El consecutivo lo asigna el sistema al guardar"; `handleSubmit` valida y hace `api.post('/api/v1/auth/admin/proyectos', body)` directamente. En edición el código va deshabilitado.
- El spec vigente `centro-costos-alta` exige que el código "se ensamble y se muestre de solo lectura antes de guardar" y calcula el consecutivo como conteo + 1.
- El patrón de confirmación previa al alta ya existe en otros formularios (`confirmacion-proyecto-en-altas`, diálogos en `AdminView` para usuarios y categorías) con tests `AdminView.confirmacion-*.test.tsx`.

## Goals / Non-Goals

**Goals:**
- Que el usuario vea el código final completo (con consecutivo) antes de guardar y pueda aceptarlo o cambiar el consecutivo.
- "Lo que se ve es lo que se guarda": el valor confirmado es el que se persiste, sin reasignaciones silenciosas.
- Mantener compatible a los clientes de la API que no envían consecutivo.

**Non-Goals:**
- No permitir editar empresa/año/cliente de un centro ya creado, ni su código.
- No reservar consecutivos durante la sesión del formulario.
- No cambiar el flujo de los Centros de Costos especiales.
- No introducir una tabla de secuencias ni contadores dedicados.

## Decisions

**1. Solo el consecutivo es editable; empresa, año y cliente siguen saliendo de sus campos.**
Decisión del titular. Editar el código completo permitiría que el código y los campos estructurados (`empresa_grupo`, `anio_centro_costos`, `cliente_id`) se contradijeran, y esos campos alimentan reportes y el cálculo del consecutivo. Si el usuario quiere otro cliente o año, cambia el campo correspondiente y el código se recalcula.

**2. Endpoint de vista previa sin efectos (`GET …/siguiente-consecutivo`).**
Calcula y devuelve el siguiente disponible sin reservar. Alternativa descartada: calcularlo en el cliente con la lista de proyectos (`GET /admin/proyectos`) — duplicaría la lógica de la política y, por el archivado/RLS, el cliente puede no ver todos los proyectos que sí cuentan para la unicidad.

**3. `máximo + 1` en lugar de `conteo + 1`.**
Con consecutivos manuales puede haber huecos (001, 002, 005): `count+1` daría 004, luego 005 (colisión). `max+1` da 006 y nunca choca con un valor ya usado. En datos sin huecos es idéntico al algoritmo actual. Se calcula con `MAX(consecutivo_centro_costos)` sobre el mismo `(tenant, empresa, año, cliente)` dentro de la transacción de creación. Tope: si el máximo es 999, `409 ADMIN_CONSECUTIVO_AGOTADO` (la máscara de 13 posiciones no admite un cuarto dígito).

**4. Consecutivo explícito: sin reintentos, error claro ante duplicado.**
Si el cliente envía `consecutivo_centro_costos`, el servidor arma el código con ese valor y, si viola el único, responde `409 ADMIN_CODIGO_DUPLICADO` con `consecutivo_sugerido` (el `max+1` vigente). Reasignar en silencio otro consecutivo contradiría "lo que ves es lo que se guarda". El reintento automático con `+ intento` se conserva solo para el camino sin consecutivo explícito (clientes antiguos/API).

**5. El frontend siempre envía el consecutivo confirmado.**
Al confirmar, `body.consecutivo_centro_costos` va explícito, de modo que el servidor no recalcula. Un `409` vuelve a abrir la confirmación con el nuevo sugerido.

**6. Paso de confirmación con "Aceptar y guardar" / "Modificar".**
Un diálogo (mismo estilo que los de `AdminView`) tras pulsar Guardar, que muestra el código final destacado y el nombre del centro. "Modificar" cierra el diálogo y enfoca el campo del consecutivo. Además del campo editable en línea (para ver el código mientras se llena el formulario), este paso garantiza la revisión explícita que pidió el titular. Alternativa descartada: solo el campo editable sin diálogo — permitiría guardar sin haber mirado el código.

**7. Validación en tres capas.**
Frontend (entero 1–999, 3 dígitos rellenados con ceros a la izquierda al mostrar), Zod en el schema (`z.number().int().min(1).max(999).optional()`) y política pura (`validarConsecutivo`). La unicidad la garantiza siempre la base de datos (el `@@unique` existente).

**8. La vista previa se actualiza con debounce y descarta respuestas obsoletas.**
Al cambiar empresa, año o cliente se consulta el endpoint (debounce ~300 ms); una respuesta que llega tras un cambio posterior se ignora. Si el usuario ya editó el consecutivo a mano y cambia otro campo, el consecutivo se **vuelve a sugerir** (el valor manual pertenecía a otra combinación) y se avisa con un texto breve.

**9. Sin cambios de esquema ni de eventos.**
`consecutivo_centro_costos` ya se persiste y viaja en `auth.centro_costos_creado`.

## Risks / Trade-offs

- **Carrera entre la vista previa y el guardado** (otro usuario toma el mismo consecutivo): se resuelve con el `409` y una segunda confirmación; es aceptable con el volumen actual de altas.
- **Huecos en la numeración** por consecutivos manuales: aceptado; es justamente el caso de uso (respetar numeración externa). `max+1` evita colisiones.
- **Cambio de algoritmo (`count+1` → `max+1`)** cambia el resultado solo en presencia de huecos preexistentes. Para tenants con datos ya existentes (p. ej., proyectos archivados/eliminados que dejaron huecos) el siguiente consecutivo sube; se documenta y se cubre con test.
- **Consecutivo 999 agotado**: improbable por combinación (empresa, año, cliente); se responde con error explícito.
- **Clientes de la API antiguos** que no envían el campo siguen funcionando por el camino automático, pero no ven el paso de confirmación (es de UI).
- **Usuarios con RLS por proyecto**: el cálculo de `MAX` debe ver todos los proyectos del tenant (mismo contexto `createTenantContext({tenantId})` que el conteo actual); se verifica con test de integración.
