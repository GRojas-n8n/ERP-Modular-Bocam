## Why

El Residente de Obra (rol real `residencia`) no puede completar la evaluación
técnica de un cuadro comparativo. La especificación vigente
(`cotizacion-compras-ux`) y el backend (`apps/compras`) ya asignan ese paso
al rol `residencia`, pero el frontend (`ComparativaDetail.tsx`) checa el rol
en inglés (`'resident'`) en vez de `'residencia'` — el único valor de rol que
`AdminView` realmente asigna a un usuario. Esto oculta por completo el botón
"Registrar Evaluación Técnica →", la sección de Veredicto y el botón "Firmar
y Bloquear →" para cualquier Residente real, aunque sí pueda abrir el cuadro
y editar la matriz de especificaciones. Reportado por un usuario real de
Bocam probando en producción: "no existe la forma de ver el cuadro
comparativo" / "el residente es el encargado de hacer la evaluación
técnica".

## What Changes

- Corregir `isResident` en `ComparativaDetail.tsx` para reconocer el rol real
  `'residencia'` (manteniendo `'resident'`/`'control_obra'` como sinónimos
  legacy ya usados en otras partes del código, sin remover compatibilidad
  existente).
- Corregir la condición de visibilidad de la sección "Veredicto del
  Residente" (`!isResidenteMode`), que hoy la oculta precisamente en el modo
  que `ComprasView.tsx` activa cuando el Residente abre el cuadro desde su
  propia pestaña "Eval. Técnica" — bloqueando a cualquier usuario en ese
  modo, sin importar su rol.
- Ningún cambio de backend: los endpoints de evaluación en `apps/compras` ya
  incluyen `'residencia'` en `requireRoles(...)` correctamente.
- Fuera de alcance de este bug-fix: mover o duplicar la pestaña de
  evaluación dentro de `ResidenciaView` (gap de navegación documentado en
  `flujo-requisicion-evaluacion-v2`/Decisión D7). Es un cambio de UX más
  amplio, no un bug de acceso — el spec `cotizacion-compras-ux` ya define
  `ComprasView → tab "Eval. Técnica"` como el lugar correcto para el
  Residente; se deja como posible change de UX separado si Bocam lo sigue
  pidiendo después de este fix.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `cotizacion-compras-ux`: el requisito narrativo de que el rol `residencia`
  vea y accione el paso "Registrar Evaluación Técnica" / Veredicto en
  `ComparativaDetail` (documentado en el Purpose del spec) no tenía un
  Requirement formal verificable; se agrega uno y se corrige la
  implementación que hoy lo viola.

## Impact

- **Frontend (`apps/app-shell`)**: `src/components/ComparativaDetail.tsx`
  únicamente (constantes `isResident`, `showEvalTecnicaBtn`, sección
  "Veredicto del Residente"). No se tocan otros componentes ni vistas.
- **Backend**: sin cambios (ya correcto).
- **Sin cambios de schema/BD.**
- Bug-fix sobre código legacy ya desplegado en producción → sigue el ciclo
  spec → test que reproduce el bug → fix → PR, branch `fix/`.
