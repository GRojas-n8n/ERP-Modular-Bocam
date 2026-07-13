## Context

`ComprasView.tsx` mantiene `activeReqId`/`comparativaModo` como estado local de React, sin
relación con `currentProjectId` (de `useTenant()`). El único `useEffect` atado a
`currentProjectId` es el que dispara `fetchData()` — ninguno resetea la vista de detalle.

## Goals / Non-Goals

**Goals:**
- Cambiar de proyecto activo siempre regresa al usuario a la lista de requisiciones,
  nunca lo deja en un detalle de un cuadro que pertenece a otro proyecto.

**Non-Goals:**
- No se audita el resto de estado local de `ComprasView.tsx` por el mismo patrón (paneles
  abiertos, formularios en progreso, etc.) — se corrige puntualmente `activeReqId`/
  `comparativaModo`, que es lo que causa el síntoma reportado (pantalla atorada). Si
  aparece otro caso, se atiende aparte.
- No se toca el backend — ya filtra correctamente por proyecto.

## Decisions

### D1: `useEffect` dedicado que limpia el detalle al cambiar de proyecto

```ts
useEffect(() => {
  setActiveReqId(null);
  setComparativaModo('compras');
}, [currentProjectId]);
```

Se agrega junto a los demás `useEffect` atados a `currentProjectId`, antes del que dispara
`fetchData()` para que el reset ocurra en el mismo ciclo de render que el cambio de
proyecto, sin depender del orden de resolución de la petición asíncrona.

## Risks / Trade-offs

- **[Riesgo]** Ninguno — el usuario ya perdía el contexto del detalle de todas formas
  (mostraba datos incorrectos o pantalla en blanco); volver a la lista es estrictamente
  mejor que quedarse atorado.

## Migration Plan

Sin cambios de backend/schema. Despliegue normal de frontend.
