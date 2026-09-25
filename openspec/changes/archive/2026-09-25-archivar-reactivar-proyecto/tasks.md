## 1. Reproducir (TDD)

- [x] 1.1 `AdminView.archivar-proyecto.test.tsx` (3 tests: archivar, reactivar, cancelar) — confirmado en rojo contra el código actual (sin botón "Archivar"/"Reactivar").

## 2. Implementación

- [x] 2.1 Estado `confirmArchivarProyecto`/`confirmReactivarProyecto`/`savingProyectoActivo`.
- [x] 2.2 `handleArchivarProyecto`/`handleReactivarProyecto` — `PATCH /admin/proyectos/:id` con `{activo}`, mismo patrón que Usuarios.
- [x] 2.3 Botones "Archivar"/"Reactivar" en la fila de proyecto, junto a "Editar", gated por `puedeEditarProyectos`.
- [x] 2.4 Dos `ConfirmCriticalActionDialog` (archivar/reactivar), mismo estilo que Usuarios.

## 3. Verificación

- [x] 3.1 Tests de 1.1 en verde tras el fix.
- [x] 3.2 Suite completa `AdminView.*` sin regresiones (6 archivos / 16 tests).
- [x] 3.3 `tsc -b` limpio.
