## Context

`POST /api/v1/compras/proveedores` (`apps/compras/src/main.ts:1807+`) ya
define las reglas de validación de un Proveedor: `rfc_tax_id`/
`razon_social` obligatorios, `calificacion_desempeno` opcional pero entre
0.00 y 5.00 si se envía, `rfc_tax_id` se persiste `trim().toUpperCase()`,
y `@@unique([tenant_id, rfc_tax_id])` en el schema (violación → P2002 →
409 "Ya existe un proveedor con ese RFC para este tenant."). No requiere
ninguna llamada cross-service.

`csvImport.ts` (`apps/app-shell/src/lib/csvImport.ts`, creado en
`carga-masiva-clientes-ventas`) ya resuelve el parseo CSV/Excel →
arreglo de objetos por encabezado de columna, sin asumir un shape fijo —
se reutiliza tal cual, sin modificarlo.

## Goals / Non-Goals

**Goals:**
- Que un usuario `procurement`/`admin` pueda subir un CSV/Excel con
  varios proveedores y crearlos todos de una vez, con feedback claro de
  cuáles se crearon y cuáles fallaron (y por qué).
- Reutilizar exactamente las mismas reglas de validación que ya existen
  para la alta individual — sin duplicar lógica de negocio.

**Non-Goals:**
- No se permite actualizar proveedores existentes vía el mismo archivo
  (upsert) — solo altas nuevas. Un RFC ya existente en el tenant se
  reporta como error de fila, no se sobrescribe.
- El lote solo captura el subconjunto de campos más comúnmente cargado
  en bloque (`rfc_tax_id`, `razon_social`, `email_contacto`, `telefono`,
  `tipo_proveedor`, `calificacion_desempeno`). Los campos de
  segmentación logística/crédito (`ciudad`, `tipo_ubicacion`,
  `entrega_en_sitio`, `estatus_credito`, `limite_credito`) quedan en su
  default (`POST /proveedores` ya los trata como opcionales) — se
  capturan después, uno por uno, si aplica, igual que hoy.
- No se valida el RFC contra el SAT ni ningún servicio externo — mismo
  alcance que la alta individual hoy.
- No se agrega plantilla descargable de ejemplo — mismo criterio que
  `carga-masiva-clientes-ventas`.

## Decisions

### D1 — Mismo patrón exacto que `carga-masiva-clientes-ventas`
Parseo client-side con `csvImport.ts` (ya existente, sin tocar),
endpoint dedicado que recibe JSON ya estructurado, reporte por fila sin
todo-o-nada, duplicados dentro del archivo detectados antes de tocar la
BD. Se documenta aquí en vez de repetir el detalle completo del PR #44 —
ver ese change (archivado tras merge) para la justificación de cada
decisión de diseño; aquí solo se anotan las diferencias específicas de
Proveedores.

### D2 — `rfc_tax_id` se normaliza igual que la alta individual
Cada registro del lote normaliza `rfc_tax_id` con
`.trim().toUpperCase()` antes de comparar duplicados y antes de crear —
mismo tratamiento que `POST /proveedores` línea 1829. Evita que
`"abc123"` y `"ABC123"` en el mismo archivo se traten como RFCs
distintos y ambos se creen, violando la intención de unicidad aunque el
constraint de BD sea case-sensitive.

### D3 — Campos opcionales fuera del lote quedan en su default de schema
`tipo_ubicacion`, `entrega_en_sitio`, `estatus_credito`, `estatus`
no se piden en el CSV — se crean con los mismos defaults que
`POST /proveedores` ya aplica cuando no se envían (`LOCAL`, `false`,
`ACTIVO`, `ACTIVO`). Si Bocam necesita cargarlos en bloque a futuro, se
agregan como columnas opcionales adicionales sin romper compatibilidad.

## Risks / Trade-offs

- **[Riesgo] Archivo grande con miles de filas podría ser lento (creates
  secuenciales, no batch)** → Mismo trade-off aceptado en
  `carga-masiva-clientes-ventas`: fuera de alcance, el caso de uso es
  catálogos de decenas/cientos de proveedores.
- **[Riesgo] `calificacion_desempeno` mal formado en el CSV (texto, o
  fuera de 0-5)** → Mitigación: mismo check que la alta individual
  (`Number(...) < 0 || > 5` → error de fila), la vista previa lo marca
  antes de confirmar el envío.

## Migration Plan

- Sin cambios de schema.
- Branch `feat/carga-masiva-proveedores-compras`.
- Deploy: `apps/compras` requiere rebuild/restart manual del contenedor
  en el VPS tras mergear (sin CI/CD); frontend se despliega al mergear a
  `main`.
- Rollback: revertir el commit — endpoint aditivo, sin riesgo de datos.

## Open Questions

- Ninguna abierta.
