## Context

`Proyecto.activo: Boolean @default(true)` ya existe en el schema de `auth`, y
`actualizarProyectoSchema` (Zod) ya valida `activo: z.boolean().optional()` en
`PATCH /admin/proyectos/:id` (protegido por `ROLES_ALTA_CENTRO_COSTOS`). La fila de proyecto en
`AdminView.tsx` ya aplica `opacity-50` cuando `!p.activo`, pero no había ninguna acción para
cambiar ese valor — el backend estaba listo, solo faltaba la UI. `AdminView.tsx` ya tiene el
patrón completo para Usuarios (`confirmArchivarUsuario`/`confirmReactivarUsuario`,
`handleArchivarUsuario`/`handleReactivarUsuario`, dos `ConfirmCriticalActionDialog`).

## Decisions

- **Replicar exactamente el patrón de Usuarios**, sin abstraerlo en un componente genérico
  compartido: mismo estilo de estado (`confirmArchivarProyecto`/`confirmReactivarProyecto`,
  `savingProyectoActivo`), mismos handlers (`PATCH` + `loadAll()` + `notify` en error), mismos dos
  `ConfirmCriticalActionDialog`. Alternativa descartada: generalizar un hook/componente
  "ArchivarReactivar<T>" — con solo dos usos (Usuarios, Proyectos) la abstracción no paga su costo
  todavía; se puede revisar si aparece un tercer caso.
- **Gated por `puedeEditarProyectos`** (ya existente, de `acceso-proyectos-gt-control-obra`): el
  mismo rol que puede editar puede archivar/reactivar — no se introduce un permiso más granular.

## Risks / Trade-offs

- [Riesgo] Archivar un proyecto que sigue en uso activo (con presupuesto/insumos en curso) — no
  hay ninguna validación de "proyecto en uso" antes de archivar. Aceptado por ahora: mismo nivel de
  validación (ninguno) que ya tiene Archivar Usuario; si se reporta como problema real, se atiende
  como spec aparte.

## Migration Plan

Cambio de frontend puro, un solo archivo. Sin backend, sin migración de datos.
