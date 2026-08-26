## Context

`Insumo` (`apps/gerencia-tecnica/prisma/schema.prisma:60-86`) tiene tres columnas con límite estricto que hoy nadie valida antes de escribir: `clave VARCHAR(50)`, `unidad_medida VARCHAR(20)`, `costo_base DECIMAL(12,4)` (máx. `99,999,999.9999`). Los tres endpoints que escriben esta tabla (`POST /insumos`, `PATCH /insumos/:id`, `POST /insumos/importar-lote` — `apps/gerencia-tecnica/src/main.ts`) solo validan tipo y presencia (`main.ts:345-363`), nunca longitud ni rango. Cualquier violación de columna la lanza Postgres/Prisma como excepción, capturada de forma genérica y devuelta como `500` con `error.message` crudo (`main.ts:423-428`).

El disparador reportado son los parsers de archivo en `InsumosView.tsx` (`parsearArchivoAPU`, `parsearArchivoExplosion`): detectan columnas por regex sobre el encabezado del Excel/CSV de OPUS y, si no matchea, caen a offsets por defecto — pudiendo leer una celda equivocada como `clave`/`unidad_medida` (texto largo en vez de código corto), o —el parser de APU específicamente (`InsumosView.tsx:458-464`)— tomar como `costo_base` el primer número positivo desde la columna 4, que puede ser un importe total en vez de un costo unitario. No se confirmó en la sesión de inspección cuál de los tres es el que truena en el caso real reportado (no hay logs de servidor disponibles ni el archivo original), así que este fix cubre los tres.

Este es el mismo bug ya corregido tres veces en este repo con el mismo patrón: `fix-auth-validacion-longitud-usuario`, `fix-personal-validacion-longitud-empleado`, `fix-compras-validacion-longitud-proveedor` (los tres archivados). La única diferencia real es que `Insumo` tiene un campo numérico con rango (`costo_base`), que ninguno de los tres precedentes tuvo que cubrir.

## Goals / Non-Goals

**Goals:**
- Ninguna combinación de datos puede hacer que `POST /insumos`, `PATCH /insumos/:id` o `POST /insumos/importar-lote` respondan `500` por un valor que excede su columna — responden `400` (alta/edición) o marcan la fila como omitida con motivo (lote).
- La vista previa de importación en `InsumosView.tsx` marca como inválida (mismo mecanismo que "sin descripción"/"sin costo unitario") cualquier fila cuyo `clave`, `unidad_medida` o `costo_base` no quepa en su columna, antes de que el usuario confirme el envío.
- Ningún endpoint expone `error.message` crudo de Prisma/Postgres en un error inesperado.

**Non-Goals:**
- No se corrige la heurística de detección de columnas de los parsers (por qué un encabezado no matchea) — ese es un problema de robustez del parser, no de integridad de datos; si el Gerente vuelve a ver una fila marcada inválida por un parseo incorrecto, es una spec aparte sobre el parser mismo.
- No se toca el loop secuencial de `db.insumo.update()` en `importar-lote` (`main.ts:400-419`, una transacción por fila vía `createTenantContext`) — no hay evidencia de que el 500 reportado sea un timeout; es un tema de rendimiento/arquitectura separado (ver inspección previa).
- No se agrega validación de formato de `clave` (regex, prefijos) — el negocio no ha definido un estándar de nomenclatura, igual que la decisión ya tomada para `Concepto` en `wbs-jerarquico-conceptos`.

## Decisions

**1. Fila fuera de rango se rechaza (alta/edición) u omite (lote) — nunca se trunca.**
Truncar `clave` a 50 caracteres o `unidad_medida` a 20 podría colisionar dos insumos distintos bajo la misma clave truncada (el catálogo es único por `tenant_id + clave`), silenciosamente fusionando o pisando datos de un insumo con el de otro. Rechazar/omitir es más lento para el usuario (tiene que corregir el archivo) pero no corrompe el catálogo. Mismo criterio que los precedentes de longitud en Auth/Personal/Compras: rechazar, no truncar.

**2. `costo_base` se valida con `z.number().nonnegative().max(99_999_999.9999)`, igual límite que la columna `DECIMAL(12,4)`.**
Alternativa considerada: dejar que Postgres rechace el overflow y solo mejorar el mensaje de error — descartada porque en `importar-lote` un valor fuera de rango debe omitir *esa fila* sin abortar el lote completo (igual que ya pasa con `tipo_insumo` inválido), y eso requiere detectarlo en aplicación antes del `createMany`/`update`, no dejarlo reventar en la base de datos.

**3. El schema de validación es un solo `insumoSchema` con todos los campos opcionales, reutilizado en los tres endpoints — mismo patrón que `longitudProveedorSchema` en Compras.**
`POST /insumos` y `PATCH /insumos/:id` ya tienen su propio chequeo de obligatorios/tipo (`TIPOS_VALIDOS`, presencia); la validación de longitud/rango se agrega como chequeo adicional, no reemplaza esos checks. En `importar-lote`, se aplica dentro del bucle existente de validación por fila (`main.ts:345-363`), sumando al conteo de `omitidos` con el motivo específico, en vez de un `parseOrRespond` que aborte todo el request — el lote ya tiene su propio mecanismo de "fila inválida no aborta el resto" y este fix lo extiende, no lo reemplaza.

**4. Frontend valida los mismos límites en el cálculo de `_valido`/`_error` de los parsers, no solo el backend.**
Sin esto, el usuario solo se entera del problema después de hacer clic en "Confirmar", con un mensaje de error genérico y sin saber qué fila lo causó. Los parsers ya tienen la infraestructura de `_error` para "sin descripción"/"sin costo unitario" (`InsumosView.tsx:476-487`, `629-641`) — se le agregan los tres checks de longitud/rango al mismo lugar, mostrando la fila específica en el panel de "se omitirán" que ya existe.

## Risks / Trade-offs

- **[Riesgo] El fix corrige la integridad de datos pero no explica *por qué* el archivo del Gerente produjo un valor fuera de rango** (parser mal alineado vs. dato real del archivo). → Mitigación: una vez desplegado el fix, si el Gerente vuelve a intentar la carga y ahora ve filas marcadas "se omitirán" con el motivo, eso confirma cuál de los tres campos era y si el causante es el parser (columna mal detectada) — información que hoy no existe. Si eso ocurre, es una spec de seguimiento sobre el parser, no de este change.
- **[Trade-off] Rechazar/omitir en vez de truncar (Decision 1) dejará algunas filas del archivo del Gerente sin importar hasta que corrija el origen.** → Aceptado: es el mismo trade-off ya aceptado en los tres precedentes de este repo; consistente con no corromper el catálogo compartido entre proyectos.

## Migration Plan

- Sin migración Prisma — los límites ya existen en `apps/gerencia-tecnica/prisma/schema.prisma`, solo se valida antes de escribir.
- Deploy de un solo servicio backend (`gerencia-tecnica`) + frontend (`app-shell`). No requiere coordinar con otros microservicios.
- Rollback: revertir el commit: los tres endpoints vuelven a su comportamiento actual (sin pérdida de datos, la validación nueva es puramente defensiva).

## Open Questions

Ninguna pendiente de decisión técnica. La única incógnita real (qué campo exacto causó el 500 del Gerente) no bloquea el fix porque este cubre los tres candidatos encontrados en la auditoría de código, y quedará resuelta en la práctica cuando el Gerente reintente la carga (ver Risks).
