## Context

`leerColumnaImport`/`leerColumnaImportProveedor`/`leerColumnaImportEmpleado` son 3 copias
casi idénticas de la misma función, cada una en su vista, con la misma limitación: solo
`trim().toLowerCase()`, comparación exacta contra la lista de alias. Los alias existentes
ya son snake_case en español sin acentos (`razon_social`, `apellido_paterno`,
`fecha_ingreso`, `calificacion_desempeno`), pensados para coincidir con exports técnicos,
no con encabezados que una persona de negocio escribiría a mano en Excel.

## Goals / Non-Goals

**Goals:**
- Un encabezado natural en español ("RAZÓN SOCIAL", "Razón Social", "Apellido Paterno",
  "Fecha de Ingreso") empareja con el alias correspondiente sin que el usuario tenga que
  editar su Excel para usar snake_case exacto.
- Una sola implementación compartida, no 3 copias divergentes.

**Non-Goals:**
- No se agregan alias de negocio nuevos más allá de tolerar variaciones de formato del
  mismo texto (acentos, espacios, guiones, conectores "de"/"del"). Si un usuario nombra una
  columna con una palabra totalmente distinta (ej. "Compañía" en vez de "Razón Social"),
  sigue sin reconocerse — eso requeriría una lista de sinónimos de negocio, fuera de
  alcance de este bug-fix.
- No se cambia la UI de la vista previa (tabla "Estado/RFC/Razón Social/Código") — ya
  muestra correctamente qué se extrajo y qué no.

## Decisions

### D1: Normalización compartida en `csvImport.ts`

Nueva función exportada:
```ts
export function leerColumnaCsv(row: Record<string, string>, ...alias: string[]): string
```
Normaliza tanto las claves de `row` como cada `alias` con la misma función interna:
1. `normalize('NFD')` + strip de diacríticos (quita acentos).
2. `toLowerCase()` + `trim()`.
3. Quitar palabras conectoras completas (`de`, `del`, `la`, `el`, `los`, `las`) como
   palabras separadas — para que "Fecha de Ingreso" empareje con `fecha_ingreso`.
4. Colapsar espacios/guiones/guion-bajo consecutivos a un solo `_`.

Busca la primera columna de `row` cuya clave normalizada coincida con algún alias
normalizado (mismo comportamiento de "primer match gana" que las funciones actuales).

**Alternativa descartada**: normalizar solo el lado del archivo, dejando los alias tal
cual. Se descarta porque normalizar ambos lados con la misma función es más simple de
razonar y evita que un alias mal escrito (ej. con acento) deje de funcionar.

### D2: Reemplazar las 3 copias locales, mismos alias

`VentasView.tsx`, `ComprasView.tsx`, `PersonalView.tsx` importan `leerColumnaCsv` de
`csvImport.ts` y eliminan su función local duplicada — las listas de alias pasadas en cada
llamada no cambian, solo el motor de comparación.

## Risks / Trade-offs

- **[Riesgo]** Quitar palabras conectoras podría, en teoría, hacer que dos columnas
  distintas colapsen al mismo nombre normalizado (ej. "Fecha de Ingreso" y "Fecha Ingreso"
  ya colapsaban antes; ahora también "La Fecha de Ingreso" lo haría). **[Mitigación]** No
  hay ningún par de alias reales en el sistema que dependa de una palabra conectora para
  distinguirse — riesgo teórico sin caso real hoy.

## Migration Plan

Sin cambios de backend/schema. Despliegue normal de frontend.
