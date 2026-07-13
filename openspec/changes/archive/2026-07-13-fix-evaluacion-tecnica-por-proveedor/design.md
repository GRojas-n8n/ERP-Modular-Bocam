## Context

`ComparativaDetalle` (backend) ya es naturalmente por `(línea, proveedor)` —
`evaluacion_tecnica`/`comentario_tecnico`/`pregunta_residente` son columnas de esa tabla,
una fila por proveedor por renglón. El frontend, al normalizar la respuesta en
`normalizeComp` (`ComprasView.tsx`), agrupa `detalles` por línea y colapsa
`evaluacion_tecnica`/`comentario_tecnico` a un solo valor (el del primer `detalle`
procesado), perdiendo la granularidad por proveedor que el backend sí tiene. El panel
simple de evaluación (`showEvalPanel`) hereda esa limitación: un único control C/NC/DA/?
por renglón en `evalForm`, keyed solo por `linea.id`.

La matriz por especificación (`especsMap`, para renglones con `EspecificacionDetalleReq`
capturadas) ya evalúa correctamente por `(especificación, proveedor)` — es el patrón a
replicar para el panel simple.

## Goals / Non-Goals

**Goals:**
- Cada proveedor de cada renglón puede evaluarse de forma independiente en el panel
  simple, igual que ya permite la matriz por especificación.
- El gate de firma exige evaluación completa de todos los proveedores, no solo uno por
  renglón.
- Ningún dato de evaluación existente se pierde — los proveedores ya evaluados bajo el
  bug actual conservan su decisión.

**Non-Goals:**
- No se migran ni corrigen retroactivamente cuadros que ya se firmaron con evaluación
  incompleta bajo el bug — fuera de alcance de este fix (el cuadro ya firmado está
  bloqueado; requeriría desbloqueo administrativo aparte, decisión de negocio, no de este
  change).
- No se unifica el panel simple con la matriz por especificación en un solo componente —
  siguen siendo dos flujos separados (uno por línea sin specs, otro por especificación),
  solo se corrige la granularidad por proveedor dentro del panel simple.

## Decisions

### D1: `CotizacionLinea` expone las evaluaciones por proveedor

Nuevo campo en `CotizacionLinea`:
```ts
evaluacionesPorProveedor?: Record<string, {
  id_detalle: string;
  evaluacion_tecnica: 'PENDIENTE' | 'C' | 'NC' | 'DA' | '?';
  comentario_tecnico?: string;
  pregunta_residente?: string | null;
}>;
```
`normalizeComp` (`ComprasView.tsx`) lo puebla iterando **todos** los `detalles` de cada
línea (no solo el primero), keyed por `proveedor_id`. `linea.evaluacion_tecnica`/
`comentario_tecnico` (campos existentes, singulares) se mantienen sin cambios de tipo —
pasan a representar el estado del primer proveedor únicamente donde ya se usaban así
(compatibilidad con la matriz/badges existentes que no se tocan en este change), pero el
panel simple y el gate de firma dejan de depender de ellos.

### D2: `evalForm` keyed por `(linea.id, proveedor.id)`

`evalForm: Record<string, { decision, comentario }>` cambia su llave de `linea.id` a
`` `${linea.id}:${proveedorId}` ``. Se inicializa desde `linea.evaluacionesPorProveedor` al
abrir el panel (en vez de arrancar siempre en `PENDIENTE`), para que abrir y volver a abrir
el panel no pierda evaluaciones ya guardadas.

### D3: Panel simple renderiza un bloque de evaluación por proveedor dentro de cada renglón

Dentro de la tarjeta de cada renglón (ya existente), se agrega una sub-sección por cada
`comp.proveedores[i]` con su propio grupo de botones C/NC/DA/?, comentario y (si aplica)
pregunta — mismo patrón visual que ya usa la matriz por especificación para sus filas por
proveedor, para consistencia.

### D4: `handleGuardarEvaluacion` construye una evaluación por `(línea, proveedor)`

```ts
const evaluaciones = lineasSinSpecs.flatMap(l =>
  comp.proveedores.map(prov => {
    const detalleId = l.evaluacionesPorProveedor?.[prov.id]?.id_detalle;
    if (!detalleId) return null; // proveedor sin precio capturado en esta línea — no evaluable
    return {
      detalle_id: detalleId,
      evaluacion_tecnica: evalForm[`${l.id}:${prov.id}`]?.decision ?? 'PENDIENTE',
      comentario_tecnico: evalForm[`${l.id}:${prov.id}`]?.comentario || undefined,
      pregunta_residente: evalForm[`${l.id}:${prov.id}`]?.decision === '?' ? (preguntasEval[`${l.id}:${prov.id}`] ?? undefined) : undefined,
    };
  }).filter((e): e is NonNullable<typeof e> => e !== null)
);
```
Validaciones de comentario/pregunta obligatorios se recorren por cada combinación
`(línea, proveedor)`, no solo por línea.

### D5: `todasEvaluadas` exige todos los proveedores de todos los renglones

```ts
const todasEvaluadas = comp.lineas.length > 0 && comp.lineas.every(l =>
  Object.values(l.evaluacionesPorProveedor ?? {}).every(
    ev => ev.evaluacion_tecnica && ev.evaluacion_tecnica !== 'PENDIENTE' && ev.evaluacion_tecnica !== '?'
  )
);
```

### D6: Columna de resumen en la tabla principal muestra fracción evaluada

En vez de un solo badge C/NC/DA/?, se muestra `"{evaluados}/{total} evaluados"` mientras no
estén todos completos, y el badge de la decisión solo cuando los 3 proveedores coinciden en
la misma decisión (para no implicar un veredicto único falso). Si difieren, se muestra un
resumen compacto (ej. "2 C · 1 NC").

**Alternativa descartada**: mantener el badge de una sola letra tomando "el peor caso"
(ej. si algún proveedor es NC, mostrar NC). Se descarta porque oculta información real —
el objetivo de este fix es justamente dejar de esconder evaluaciones faltantes o
divergentes.

## Risks / Trade-offs

- **[Riesgo]** Cuadros con evaluación parcial ya guardada bajo el bug (1 de N proveedores)
  mostrarán ahora correctamente "1/3 evaluados" en vez de aparentar estar completos —
  comportamiento correcto, pero es un cambio visible para cualquier cuadro en curso.
  **[Mitigación]** Es exactamente el comportamiento correcto — se documenta como parte
  esperada del fix, no como riesgo a mitigar más allá de comunicarlo.
- **[Riesgo]** Renglones donde no todos los proveedores tienen precio capturado
  (`ComparativaDetalle` inexistente para ese par) no tienen `id_detalle` que evaluar.
  **[Mitigación]** D4 filtra esos casos (`if (!detalleId) return null`) — no se le pide al
  Residente evaluar un proveedor que ni siquiera cotizó esa línea.

## Migration Plan

Sin cambios de backend/schema. Despliegue normal de frontend. Cuadros ya en
`EN_EVALUACION_TECNICA` con evaluación parcial simplemente muestran su estado real
(incompleto) tras el despliegue — el Residente completa lo que falte, sin necesidad de
reiniciar el cuadro.
