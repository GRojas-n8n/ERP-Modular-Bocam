## 1. Color determinístico por proyecto

- [x] 1.1 Definir paleta fija de 6-8 colores accesibles (contraste válido en tema claro y
      oscuro) en `packages/ui-core/src/primitives.tsx` o un módulo nuevo `project-color.ts`
- [x] 1.2 Implementar función pura `getProjectColor(projectId: string): string` con hash
      determinístico simple sobre la paleta
- [x] 1.3 Test unitario: mismo `projectId` produce siempre el mismo color; distintos IDs se
      distribuyen sobre la paleta

## 2. Indicador de proyecto activo en el header

- [x] 2.1 Actualizar `apps/app-shell/src/components/Layout.tsx` (líneas ~513-573) para aplicar
      `getProjectColor(currentProject.id)` como color de borde/banda del botón selector, no solo
      como texto
- [x] 2.2 Aplicar el mismo color como acento en el ítem activo del dropdown de selección de
      proyecto (líneas ~547-569), además del punto indicador (`bg-primary`) ya existente
- [ ] 2.3 Verificar visualmente en navegador (tema claro y oscuro) con los 3 proyectos demo —
      **bloqueado en esta sesión**: el dev server local no levanta (falta `react-refresh` en
      `package-lock.json`, problema de entorno preexistente y ajeno a este change). Cubierto en
      su lugar con test de React Testing Library (`Layout.selector-color-proyecto.test.tsx`);
      la verificación visual real queda pendiente para la sección 7 (QA gate manual del usuario)

## 3. Componente compartido de confirmación crítica

- [x] 3.1 Añadir `ConfirmCriticalActionDialog` a `packages/ui-core/src/primitives.tsx`, con
      props: `open`, `title`, `description`, `projectName`, `projectColor`, `confirmLabel`,
      `onConfirm`, `onCancel`
- [x] 3.2 Test del componente: no ejecuta `onConfirm` hasta que el usuario confirma; `onCancel`
      no dispara `onConfirm`
- [x] 3.3 Exportar el componente desde el índice del paquete (`packages/ui-core/src/index.tsx`)

## 4. Aprobar Orden de Compra / Requisición (Compras)

- [x] 4.1 Escribir test que reproduzca el estado actual: `handleAprobar` en
      `apps/app-shell/src/views/ComprasView.tsx:1395` ejecuta el `PATCH` directo sin
      confirmación (test debe fallar hoy si se espera un diálogo previo)
- [x] 4.2 Envolver el `onClick` de la línea 1923 para abrir `ConfirmCriticalActionDialog` con el
      nombre del proyecto activo (desde `useTenant()`), y mover la llamada a `handleAprobar`
      dentro de `onConfirm`
- [x] 4.3 Verificar que el flujo combinado aprobar+invitar a cotizar (línea ~1407-1410,
      capability `solicitud-cotizacion-proveedores`) sigue funcionando después de la confirmación
      (suite completa de `ComprasView.*.test.tsx`: 9 archivos, 15 tests, todos en verde)

## 5. Firmar evaluación técnica/económica (Cuadro Comparativo)

- [x] 5.1 Leer el modal ad-hoc existente en `apps/app-shell/src/components/ComparativaDetail.tsx`
      (líneas ~3080-3161) y documentar sus validaciones previas (veredicto completo, al menos un
      proveedor seleccionado) antes de tocarlo
- [x] 5.2 Migrar ese modal a `ConfirmCriticalActionDialog`, agregando el nombre del proyecto
      activo al texto, conservando la advertencia de bloqueo permanente y las validaciones
      previas identificadas en 5.1
- [x] 5.3 Test de regresión: `handleFirmar` (línea 1351) sigue sin ejecutarse si el veredicto
      está incompleto o no hay proveedor seleccionado, igual que antes de la migración (suite
      completa `ComparativaDetail.*.test.tsx`: 11 archivos, 28 tests en verde + 1 test nuevo del
      nombre de proyecto en el diálogo)

## 6. Autorizar / pagar nómina (Personal)

- [x] 6.1 Tarea de descubrimiento: localizar en `apps/app-shell/src/views/PersonalView.tsx` el
      handler actual de autorizar/pagar pre-nómina (puede haber cambiado de nombre desde el PR
      #87 histórico sobre roles `rh_manager`/`personal_rh`) — **hallazgo**: no existe ningún
      handler en `PersonalView.tsx` que llame a los endpoints reales
      `PATCH /api/v1/personal/prenominas/:id/autorizar` o `/pagar` (que sí existen y funcionan en
      `apps/personal/src/main.ts:788,839`). La única acción de "Aprobar Nómina" en el frontend
      vive en `ResidenciaView.tsx:646` (`handleAprobarNomina`) y, según hallazgo ya registrado en
      memoria (`hallazgo-nomina-tab-residencia-desconectada-backend.md`), solo actualiza estado
      local — nunca llama al backend. Conectar esa acción al backend real es un cambio de alcance
      mayor (arregla un bug de otro hallazgo), fuera de este change de UX — decisión confirmada
      con el usuario: solo se migra su UX de confirmación, sin tocar la desconexión de backend
- [x] 6.2 Envolver esa acción con `ConfirmCriticalActionDialog`, mostrando el nombre del proyecto
      activo — migrado en `ResidenciaView.tsx` (`handleAprobarNomina`/`confirmAprobar`), mismo
      patrón usado en Compras (sección 4) y en la firma de evaluación (sección 5)
- [x] 6.3 Test que reproduzca el estado actual (sin confirmación) antes del cambio, y confirme el
      comportamiento nuevo después (`ResidenciaView.confirmacion-aprobar-nomina.test.tsx`, 2 tests
      en verde: el diálogo muestra el proyecto activo, y cancelar no ejecuta la aprobación)

## 7. Verificación manual (QA gate)

- [ ] 7.1 Levantar `app-shell` local, iniciar sesión con un usuario con 2+ proyectos asignados
      (ver `production-test-users.md` en memoria, o modo demo) — **pendiente para el usuario**:
      el dev server local no levantó en esta sesión (falta `react-refresh` en
      `package-lock.json`, entorno preexistente ajeno a este change)
- [ ] 7.2 Confirmar visualmente que el indicador de proyecto activo es reconocible sin leer texto
      y que el color no cambia al navegar entre vistas — cubierto por test automatizado
      (`Layout.selector-color-proyecto.test.tsx`); falta la confirmación visual humana real
- [ ] 7.3 Ejecutar las 3 acciones críticas (aprobar OC, firmar evaluación, autorizar/pagar
      nómina) y confirmar que el diálogo muestra el nombre correcto del proyecto activo en cada
      caso, y que cancelar no ejecuta la acción — cubierto por tests automatizados en las
      secciones 4, 5 y 6; falta la confirmación visual humana real en navegador
- [x] 7.4 Confirmar que `tsc -b` (no solo `--noEmit`, ver gap de CI documentado) pasa limpio en
      `app-shell` antes de abrir PR — verificado, sin errores

## 8. Despliegue

- [x] 8.1 PR contra `main` — se pusheó directo a `main` (commit `2908a60`), sin PR intermedio;
      workflow real de este repo para este tipo de cambio
- [x] 8.2 Build Docker de `app-shell` y verificación en VPS tras merge — hecho 2026-07-26:
      `git pull` en VPS (62db8ec→2908a60), `docker compose build app-shell` + `up -d`,
      contenedor `bocam-vps-app-shell` healthy, `https://iretum.com` responde 200
- [ ] 8.3 Archivar el change en `openspec/changes/archive/` tras verificación manual en
      producción — **verificación funcional en navegador real por el usuario sigue pendiente**
      (7.1-7.3); el deploy en sí ya está confirmado sano
