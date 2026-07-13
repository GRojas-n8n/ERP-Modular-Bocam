## Context

`ComparativaDetail.tsx` (`apps/app-shell/src/components/ComparativaDetail.tsx`)
renderiza el cuadro comparativo en 3 modos (`modo: 'compras' | 'residente' |
'gt'`, prop pasada por `ComprasView.tsx` según la pestaña/tab desde la que se
abrió) y calcula visibilidad de botones/secciones a partir de:

```ts
const { user } = useTenant();
const roles: string[] = user?.role ?? [];               // línea 276
const isResident = roles.some(r => ['resident', 'control_obra'].includes(r)); // línea 776
const isResidenteMode = modo === 'residente';           // línea 769
```

El rol real que `AdminView.tsx` asigna a un Residente (`{ value: 'residencia',
label: 'Residencia de Obra' }`) nunca aparece en el arreglo de `isResident`,
así que para cualquier Residente real `isResident` es siempre `false`. Eso
oculta:
- `showEvalTecnicaBtn` (línea 781): botón "Registrar Evaluación Técnica →"
- la sección "Veredicto del Residente" (línea 2313): además tiene su propio
  bug independiente, `&& !isResidenteMode`, que la oculta justo cuando
  `ComprasView` abre el cuadro en modo `'residente'` — el único modo en el
  que un Residente real lo abre desde su pestaña "Eval. Técnica"
  (`ComprasView.tsx:2048`, `setComparativaModo('residente')`).
- `showFirmaBtn` (línea 795): depende de `veredictoListo`, que depende de
  poder llenar el veredicto en la sección anterior — nunca se habilita si la
  sección está oculta.

**Por qué no se detectó en tests:** los tests existentes de este componente
(`ComparativaDetail.firma-seleccion.test.tsx`,
`ComparativaDetail.evaluacion-especificacion.test.tsx`) mockean
`user.role = ['resident']` (inglés) y usan `modo="compras"` — exactamente la
combinación que SÍ funciona hoy. Ningún test existente usa `role:
['residencia']` + `modo="residente"`, que es la combinación real que usa un
Residente de Bocam en producción, así que la suite pasaba en verde mientras
el flujo real estaba roto.

El spec `cotizacion-compras-ux` (Purpose, tabla "Routing del cuadro
comparativo por rol") ya documenta `residencia` como el rol correcto y
`ComprasView → tab "Eval. Técnica"` como el lugar correcto, pero no tenía un
Requirement formal verificable — este change lo agrega.

## Goals / Non-Goals

**Goals:**
- Un usuario con rol `residencia` (el único rol real asignable a un
  Residente, según `AdminView.tsx`) puede ver y usar el botón "Registrar
  Evaluación Técnica →", llenar y guardar el Veredicto, y firmar/bloquear
  el cuadro, exactamente igual que hoy funciona para `role: ['resident']`.
- Reproducir el bug primero con un test que falla (TDD del bug-fix), luego
  aplicar el fix mínimo, sin tocar backend ni otros componentes.

**Non-Goals:**
- No se mueve ni duplica la pestaña "Eval. Técnica" hacia `ResidenciaView`
  (gap de navegación de UX, documentado como decisión de diseño ya tomada
  distinta al plan original en `flujo-requisicion-evaluacion-v2`). Es un
  cambio de producto más amplio, se deja para un change separado si Bocam
  lo sigue pidiendo tras este fix.
- No se cambia el backend (`apps/compras`) — los `requireRoles(...)` de los
  endpoints de evaluación ya incluyen `'residencia'` correctamente.
- No se renombra/unifica `'resident'` vs `'residencia'` en todo el
  codebase (sería un refactor más amplio fuera de alcance de un bug-fix
  puntual); este fix solo agrega `'residencia'` donde falta.

## Decisions

### D1 — Agregar `'residencia'` al arreglo de `isResident`, sin remover `'resident'`/`'control_obra'`
```ts
const isResident = roles.some(r => ['resident', 'residencia', 'control_obra'].includes(r));
```
Alternativa considerada: renombrar todo el codebase de `'resident'` a
`'residencia'` de una vez. Se descarta para este change — es un bug-fix
puntual y acotado (regla del proyecto: no refactorizar más allá del bug
documentado); mantener ambos strings preserva compatibilidad con cualquier
dato/sesión legacy que aún use `'resident'`.

### D2 — Quitar la condición `!isResidenteMode` de la sección "Veredicto del Residente"
```ts
// Antes:
{comp.estado === 'EN_EVALUACION_TECNICA' && (isResident || roles.includes('admin')) && !isResidenteMode && (
// Después:
{comp.estado === 'EN_EVALUACION_TECNICA' && (isResident || roles.includes('admin')) && (
```
Justificación: `showFirmaBtn` (línea 795), que depende de la misma sección
vía `veredictoListo`, **no** tiene ninguna condición de `modo` — solo rol +
estado + `todasEvaluadas` + `veredictoListo`. La sección que alimenta esos
valores debería seguir el mismo patrón. Revisando el resto del archivo,
`isResidenteMode`/`!isResidenteMode` se usa consistentemente para
mostrar/ocultar contenido que depende de **qué puede ver** cada bando
(ocultar precios y columnas de "Ganador" al Residente, mostrar detalle de
especificaciones solo en modo residente, etc.) — nunca para gatear la
sección de veredicto, que es la acción propia del Residente. Todo indica
que `!isResidenteMode` en esta sección específica es un error de
copy-paste de un patrón cercano (p. ej. línea 2084), no una decisión
deliberada.
Alternativa considerada: invertir a `isResidenteMode` en vez de quitar la
condición — se descarta porque `admin` también debe poder ver/llenar el
veredicto sin estar en modo `'residente'` (p. ej. si un admin abre el
cuadro desde otra pestaña para dar seguimiento), y porque el precedente de
`showFirmaBtn` (sin condición de modo) sugiere que la intención original
tampoco era restringir por modo.

## Risks / Trade-offs

- **[Riesgo] Quitar `!isResidenteMode` podría hacer que la sección de
  veredicto ahora también aparezca en modo `'compras'` o `'gt'` para un
  usuario con rol `admin` que antes no la veía ahí.**
  → Mitigación: es el comportamiento correcto y ya cubierto por el test
  existente `ComparativaDetail.firma-seleccion.test.tsx` (`modo="compras"`,
  rol `resident`) — ese test ya asume y verifica que la sección SÍ aparece
  en modo `"compras"`. No se rompe ningún test actual; se agrega cobertura
  para el caso `residencia` + `modo="residente"` que faltaba.
- **[Riesgo] Cambiar el string de rol podría no alinear con lo que
  realmente manda el JWT/backend si hay algún otro mismatch no detectado.**
  → Mitigación: confirmado en la investigación previa que
  `requireRoles(...)` en `apps/compras/src/main.ts` ya usa `'residencia'`
  explícitamente en todos los endpoints de evaluación — el backend no
  cambia y ya es compatible.

## Migration Plan

- Sin migración de datos ni de infraestructura — cambio puntual en un
  archivo de frontend.
- Branch `fix/acceso-residente-evaluacion-tecnica` (convención `{tipo}/{descripcion}`
  del proyecto).
- Deploy: automático al VPS vía `deploy-vps.yml` al mergear a `main` (el
  workflow ya cubre `apps/app-shell/**`), no requiere tocar backend ni
  redeploy manual de `compras`.
- Rollback: revertir el commit del fix — no hay cambios de estado
  persistente ni de esquema que revertir.

## Open Questions

- Ninguna abierta — alcance acotado y verificado contra el código actual.
