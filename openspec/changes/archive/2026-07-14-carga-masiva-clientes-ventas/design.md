## Context

`POST /api/v1/ventas/clientes` (`apps/ventas/src/main.ts:56+`) ya define
las reglas de validación de un Cliente: `rfc_tax_id`/`razon_social`
obligatorios, `codigo_cliente` opcional pero con formato de 3 dígitos
(`CODIGO_CLIENTE_PATTERN`) y único por tenant si se envía. No requiere
ninguna llamada cross-service (a diferencia de otros catálogos de este
ERP) — `codigo_cliente` es nullable y no se auto-asigna desde `auth` en
la creación individual, así que el import masivo tampoco lo necesita.

`apps/app-shell/package.json` ya depende de `xlsx` (SheetJS) — la misma
librería puede parsear tanto `.csv` como `.xlsx` de forma uniforme
(`XLSX.read(...)` + `XLSX.utils.sheet_to_json(...)`), así que no se
agrega ninguna dependencia nueva.

## Goals / Non-Goals

**Goals:**
- Que un usuario `admin` pueda subir un CSV/Excel con varios clientes y
  crearlos todos de una vez, con feedback claro de cuáles se crearon y
  cuáles fallaron (y por qué).
- Reutilizar exactamente las mismas reglas de validación que ya existen
  para la alta individual — sin duplicar lógica de negocio.

**Non-Goals:**
- No se permite actualizar clientes existentes vía el mismo archivo
  (upsert) — solo altas nuevas. Un RFC ya existente en el tenant se
  reporta como error de fila, no se sobrescribe. Evita que un archivo mal
  preparado pise datos reales por accidente.
- No se valida el RFC contra el SAT ni ningún servicio externo — mismo
  alcance que la alta individual hoy (solo formato/obligatoriedad).
- No se agrega plantilla descargable de ejemplo en este change — la
  utilidad de parseo detecta encabezados por nombre de columna
  (`rfc_tax_id`, `razon_social`, etc.), documentado en la UI con un texto
  de ayuda, no con un archivo de plantilla.

## Decisions

### D1 — Parseo client-side, el backend solo recibe JSON ya estructurado
El navegador parsea el CSV/Excel con `xlsx` y envía
`POST /clientes/importar-lote` con un arreglo de objetos JSON — el
backend nunca recibe ni procesa el archivo binario. Evita agregar
`multer`/parseo de archivos en `apps/ventas` (que hoy no maneja uploads
de archivos en absoluto) y mantiene la validación de negocio en un solo
lugar (backend), reutilizable también por una futura integración API si
alguna vez se necesita.
Alternativa descartada: subir el archivo binario al backend y parsearlo
ahí (como hace `apps/compras` con PDFs de cotización) — más superficie
de dependencias nuevas en `ventas` (parseo de Excel en Node) para un
beneficio marginal, dado que el parseo en el navegador ya es preciso y
rápido para archivos de este tamaño (catálogos, no miles de filas).

### D2 — Reporte por fila, no todo-o-nada
El endpoint crea cada registro válido de forma independiente y acumula
los errores de los inválidos, respondiendo
`{ creados: number, clientes: Cliente[], errores: Array<{ fila: number;
motivo: string }> }` con status 200 (nunca 400 por errores parciales —
400 solo si el payload en sí es inválido, ej. `registros` no es un
arreglo). Mismo principio que `panel-purga-datos-prueba-compras` usa
para lotes (reportar detalle por ítem, no abortar todo por un fallo
puntual) — aunque ahí es lo opuesto (revierte todo si un ítem falla);
aquí se elige NO revertir porque crear un cliente no tiene efectos
colaterales que requieran atomicidad (a diferencia de una purga, donde
dejar borrado parcial es peligroso).

### D3 — Duplicados dentro del mismo archivo se detectan antes de tocar la BD
Antes de crear nada, el endpoint agrupa los registros por `rfc_tax_id` —
si el mismo RFC aparece dos veces en el archivo, ambas filas se reportan
como error (`"RFC duplicado dentro del archivo"`), ninguna se crea. Evita
una condición de carrera donde la primera se crea y la segunda falla por
unique constraint con un mensaje de error confuso.

## Risks / Trade-offs

- **[Riesgo] Archivo grande con miles de filas podría ser lento
  (creates secuenciales, no batch)** → Mitigación: fuera de alcance por
  ahora — el caso de uso es "catálogos principales" (decenas/cientos de
  clientes, no miles); si se vuelve un problema real, cambiar a
  `createMany` es un ajuste posterior sin romper la API pública.
- **[Riesgo] Usuario sube un archivo con encabezados de columna mal
  escritos y todo el lote falla silenciosamente** → Mitigación: la vista
  previa en el frontend (D1) muestra conteo de válidos/inválidos ANTES de
  confirmar el envío, con el detalle de qué columnas se reconocieron.

## Migration Plan

- Sin cambios de schema.
- Branch `feat/carga-masiva-clientes-ventas`.
- Deploy: `apps/ventas` requiere rebuild/restart manual del contenedor en
  el VPS tras mergear (sin CI/CD); frontend se despliega al mergear a
  `main`.
- Rollback: revertir el commit — endpoint aditivo, sin riesgo de datos.

## Open Questions

- Ninguna abierta.
