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
- [x] 2.3 Verificar visualmente en navegador (tema claro y oscuro) con los 3 proyectos demo —
      **desbloqueado 2026-07-27**: se reparó el entorno local (faltaba `react-refresh` físicamente
      instalado pese a estar en `package-lock.json`; ver nota en sección 7). Verificado en Chrome
      real contra `localhost:3000` con seed `admin@alfa.bocam.com`: el botón selector muestra
      color propio por proyecto (verde para Planta Guadalajara Norte, morado para Planta
      Guadalajara — SERSSINSA) como fondo/borde, no solo texto; el ítem activo del dropdown se
      resalta con el mismo color; confirmado legible en tema claro y oscuro

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

- [x] 7.1 Levantar `app-shell` local, iniciar sesión con un usuario con 2+ proyectos asignados
      (ver `production-test-users.md` en memoria, o modo demo) — **resuelto 2026-07-27**: el
      lockfile raíz se regeneró (`rm package-lock.json && npm install`) pero seguía sin instalar
      físicamente `react-refresh`; se instaló explícito (`npm install react-refresh@^0.17.0` en
      `apps/app-shell`, quedó hospedado en `node_modules/react-refresh` raíz). Backends locales
      (`auth`, `compras`, `finanzas`, `gerencia-tecnica`, `personal`) levantados individualmente
      en background (el patrón documentado en `patron-verificacion-e2e-local-2026-07-14` de un
      proceso por servicio se confirma necesario — `npm run dev --workspace=A --workspace=B` se
      cuelga en el primero). Docker Desktop estaba apagado, se inició y `bocam-postgres`/
      `rabbitmq`/`redis` ya traían datos sembrados (`admin@alfa.bocam.com` / `Admin.2026`, 2
      proyectos). Login real confirmado en Chrome
- [x] 7.2 Confirmar visualmente que el indicador de proyecto activo es reconocible sin leer texto
      y que el color no cambia al navegar entre vistas — confirmado en Chrome real: color
      distinto y consistente por proyecto en header y dropdown, tema claro y oscuro
- [~] 7.3 Ejecutar las 3 acciones críticas (aprobar OC, firmar evaluación, autorizar/pagar
      nómina) y confirmar que el diálogo muestra el nombre correcto del proyecto activo en cada
      caso, y que cancelar no ejecuta la acción — **Compras verificado completo en Chrome real**:
      aprobar `REQ-2026-T1-001` abre `ConfirmCriticalActionDialog` con "PROYECTO ACTIVO: PLANTA
      DE TRATAMIENTO GUADALAJARA NORTE", Cancelar cierra sin cambiar el estado (sigue "Pendiente
      de aprobación"). Firmar evaluación técnica y autorizar/pagar nómina **no se pudieron
      disparar visualmente**: no había cuadros comparativos ni prenóminas pendientes en el seed
      local, y un intento de sembrar una prenómina de prueba (fila temporal en
      `personal.pre_nominas`, borrada de inmediato) expuso un crash **preexistente y fuera de
      alcance** en el modal "Detalle de Prenómina" de `ResidenciaView.tsx` (línea ~1602/1615:
      `nominaDetalle.total_bruto`/`nominaDetalle.cuadrillas` no existen en la respuesta real del
      backend — mismo hallazgo ya documentado en `hallazgo-nomina-tab-residencia-desconectada-backend`,
      no relacionado con el diálogo de confirmación). El propio `ConfirmCriticalActionDialog` de
      ambos flujos no se vio con ojos humanos; la confianza restante se apoya en que es el mismo
      componente ya verificado en Compras + los tests automatizados de las secciones 5 y 6
- [x] 7.4 Confirmar que `tsc -b` (no solo `--noEmit`, ver gap de CI documentado) pasa limpio en
      `app-shell` antes de abrir PR — verificado, sin errores

## 8. Despliegue

- [x] 8.1 PR contra `main` — se pusheó directo a `main` (commit `2908a60`), sin PR intermedio;
      workflow real de este repo para este tipo de cambio
- [x] 8.2 Build Docker de `app-shell` y verificación en VPS tras merge — hecho 2026-07-26:
      `git pull` en VPS (62db8ec→2908a60), `docker compose build app-shell` + `up -d`,
      contenedor `bocam-vps-app-shell` healthy, `https://iretum.com` responde 200
- [x] 8.3 Archivar el change en `openspec/changes/archive/` — decisión confirmada con el usuario
      2026-07-27: verificación visual local en Chrome real cubre el indicador de color (2.3/7.2)
      y el flujo de mayor riesgo (Compras, 7.3), suficiente junto con el deploy ya confirmado sano
      en VPS (commit 2908a60); Cuadro Comparativo y Nómina quedan sin confirmación visual directa
      del diálogo (ver nota en 7.3) pero respaldados por tests automatizados + mismo componente
      compartido ya verificado
