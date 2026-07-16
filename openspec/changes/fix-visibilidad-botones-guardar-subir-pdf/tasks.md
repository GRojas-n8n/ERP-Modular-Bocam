## 1. Verificación previa (re-localizar instancias)

- [x] 1.1 Re-verificar en el árbol actual (puede haber cambiado desde la
      exploración inicial) cada línea listada abajo antes de editar: buscar
      `Guardar` y patrones de subida de PDF/adjuntos en `ComprasView.tsx`,
      `ComparativaDetail.tsx`, `AdminView.tsx`, `CalidadView.tsx`,
      `MasterView.tsx`, `InsumosView.tsx`, `PersonalView.tsx` dentro de
      `apps/app-shell/src`.
- [x] 1.2 Capturar (o anotar) el estado "antes" de cada botón/dropzone
      afectado en tema claro y oscuro, para poder comparar en la verificación
      final de la sección 4.
      → Documentado vía grep del árbol actual antes de cada edición (ver
      historial de la sesión); no se tomaron capturas de pantalla, solo
      registro textual de clases "antes" por archivo.

## 2. Fix — botón "Guardar" (verde sólido, texto blanco)

- [x] 2.1 `apps/app-shell/src/views/AdminView.tsx` (184-186, 538-540,
      783-785): unificados los tres botones de guardar a
      `bg-emerald-600 text-white hover:bg-emerald-700`, reemplazando
      `bg-primary`/`bg-sky-600`.
- [x] 2.2 `apps/app-shell/src/views/CalidadView.tsx` (1022-1024): mismo
      cambio de clases para el botón "Guardar" (antes `bg-primary`).
- [x] 2.3 `apps/app-shell/src/views/MasterView.tsx` (196-199): ya usaba
      `bg-emerald-600 text-white`; ajustado el hover a `emerald-700` para
      igualar al resto (antes `emerald-500`).
- [x] 2.4 `apps/app-shell/src/components/ComparativaDetail.tsx`: el archivo
      tiene 8 botones "Guardar" distintos (evaluación técnica, GT, línea
      individual x2, respuestas, selección, veredicto, anotación) con
      colores dispares (amber/violet/indigo, dos de ellos con fondo al 10%
      de opacidad casi ilegible). Se unificaron los 8 a
      `bg-emerald-600 text-white hover:bg-emerald-700` por consistencia con
      el requirement de la spec.
- [x] 2.5 `apps/app-shell/src/views/ComprasView.tsx`: sus 3 botones
      "Guardar" ya usaban `SubmitButton color="emerald"`.
      `apps/app-shell/src/views/InsumosView.tsx`: no tiene botón "Guardar"
      dedicado; sus acciones de confirmar/enviar ya usan `SubmitButton`
      (emerald/violet).
      `apps/app-shell/src/views/PersonalView.tsx`: sus 2 botones "Guardar
      configuración" usaban `SubmitButton color="violet"` e `color="indigo"`
      respectivamente; cambiados ambos a `color="emerald"`.
      → Corrección posterior: el QA visual (sección 4a) encontró que
      `SubmitButton` NUNCA aplicaba su color correctamente (ver 4a) — el
      "sin cambios necesarios" de ComprasView de este punto fue incorrecto,
      esos 3 botones también estaban rotos (cian, no verde). Corregido en
      4a.1 para los 7 colores de `SubmitButton`, no solo emerald.
- [x] 2.6 Revisado: ningún botón de "Guardar" tocado usaba `opacity-*` para
      su estado habilitado normal (solo `disabled:opacity-40/50`, que es
      correcto y no se modificó).

## 3. Fix — zona "Subir PDF / adjuntar" (dropzone verde)

- [x] 3.1 `apps/app-shell/src/views/ComprasView.tsx` (3985): reemplazado
      `border-dashed border-border bg-muted/20 text-muted-foreground` por
      `border-2 border-dashed border-emerald-600 bg-emerald-500/10
      text-emerald-700 hover:bg-emerald-500/20`.
- [x] 3.2 `apps/app-shell/src/components/ComparativaDetail.tsx` (3490) y
      `apps/app-shell/src/views/InsumosView.tsx` (3474): reemplazado el
      tinte índigo débil (`border-indigo-400/40 bg-indigo-500/5
      text-indigo-600`) por el mismo verde definido en 3.1, en ambos
      botones "Subir ficha técnica".
- [x] 3.3 `apps/app-shell/src/components/ComparativaDetail.tsx` (2082): el
      botón "PDF" que solo usaba `opacity-60 hover:opacity-100` sin fondo
      pasa a tener borde/fondo/texto verde real
      (`border-emerald-600 bg-emerald-500/10 text-emerald-700`), sin
      depender de opacidad para su estado normal.
- [x] 3.4 Verificado con búsqueda de `type="file"`/`accept=`/`Adjuntar`/`Subir`
      en las 7 vistas. Se encontró una zona adicional no listada en la
      exploración inicial: `apps/app-shell/src/views/CalidadView.tsx`
      (672-698, dropzone "Crear Versión") con el mismo patrón
      `border-dashed border-border/60 bg-muted/20 text-muted-foreground` —
      corregida con el mismo estilo verde. Los inputs de CSV/Excel en
      `ComprasView.tsx` (1525) y `PersonalView.tsx` (557-570) son carga
      masiva de datos, no PDF — fuera de alcance de este spec (cubiertos por
      `carga-masiva-*`). `AdminView.tsx` y `MasterView.tsx` no tienen zonas
      de adjuntar archivos.

## 4. Verificación

- [x] 4.1 `npm run build` (`tsc -b && vite build`) en `apps/app-shell` limpio
      tras los cambios (2172 módulos, sin errores).
- [x] 4.2 Levantar app-shell + microservicios necesarios en local (auth,
      gerencia-tecnica, personal, compras, calidad) y revisar visualmente
      con Playwright, en tema claro y oscuro, los spots alcanzables:
      AdminView (Crear Usuario), PersonalView (Guardar configuración),
      ComprasView (dropzone Subir Documento), CalidadView (dropzone Nueva
      Versión), InsumosView (dropzone Subir ficha técnica).
      **Resultado real (round 1, antes del fix de 4a): 3 PASS
      (AdminView, CalidadView, InsumosView — usan `<button>` nativo) y 2
      FAIL (PersonalView, ComprasView — usan el componente `Button` de
      `@bocam/ui-core`, que ignoraba el color pedido y renderizaba cian).**
      Ver sección 4a para la causa raíz y el fix. `ComparativaDetail.tsx`
      no se alcanzó en esta ronda (requiere sembrar Requisicion + Cuadro +
      Detalle + Línea — fuera del tiempo razonable de esta ronda); su
      riesgo se evaluó por inspección estática en 4a.2.
      Screenshots en
      `...\fc6dc6e8-6a19-43dc-bd6a-14aff948d079\scratchpad\qa-visual\`.
- [x] 4.3 Confirmar que el verde usado no se confunde con badges/toasts de
      éxito existentes en las mismas vistas. → Verificado 2026-07-15: tres
      pesos visuales distintos y consistentes en las 7 vistas — toasts
      `type: 'success'` (`ToastContainer.tsx`) usan `bg-emerald-500` solo
      como barra lateral de 4px + ícono, sobre una tarjeta `bg-card` fija en
      top-right (no parece un botón); badges de estado (`SectionBadge`/
      `ESTADO_STYLE`) usan `emerald-500/10` (10% opacidad) en formato
      píldora inline; los botones/dropzones de este fix usan `!bg-emerald-600`
      sólido con texto blanco, forma de botón real. Sin ambigüedad real.
- [x] 4.4 Confirmado por inspección de cada diff: ningún cambio tocó
      `onClick`/`onChange`/lógica de submit o de `accept=` del input de
      archivo — únicamente `className`.

## 4a. Bug encontrado en el QA visual — corregido dentro de este mismo change

- [x] 4a.1 **Causa raíz**: `Button` (`packages/ui-core/src/primitives.tsx`)
      usa `variant="primary"` por defecto → inyecta `bg-primary
      text-primary-foreground` (cian). Su `cn()` es un join de strings, no
      `tailwind-merge`, así que mis clases `bg-emerald-*` y las clases
      `bg-primary` del primitive conviven en el DOM y el orden de la
      cascada CSS **compilada** (no el orden en JSX) decide cuál gana —
      `bg-primary` ganaba. Afecta a **todo** consumidor de `<Button
      className="bg-...">` sin `variant` override, y a `SubmitButton`
      (`apps/app-shell/src/components/SlidePanel.tsx`) para sus 7 colores,
      no solo emerald. Fix: prefijo `!` (important) de Tailwind en las
      clases de color de cada instancia afectada — gana sin depender del
      orden de la cascada. No se tocó `packages/ui-core` (fuera de alcance
      declarado en design.md); el fix vive enteramente en app-shell.
      Archivos corregidos: `SlidePanel.tsx` (colorMap completo de
      `SubmitButton`, los 7 colores), `ComprasView.tsx` (dropzone Subir
      Documento), `ComparativaDetail.tsx` (6 de los 8 botones "Guardar" que
      usan `<Button>` — los otros 2, más los 2 dropzones/pill de subir PDF,
      ya eran `<button>` nativo y no necesitaban el fix).
- [x] 4a.2 Verificación de que el fix compila correctamente: rebuild
      (`npm run build`) limpio; grep del CSS compilado confirma que cada
      clase `!bg-*`/`!text-*`/`hover:!bg-*` tocada aparece con
      `!important` en la regla generada (ej.
      `.\!bg-emerald-600{background-color:var(--color-emerald-600)!important}`).
      Una regla `!important` gana siempre sobre una no-important sin
      importar el orden en el archivo, así que esto es una garantía
      estructural, no solo una inspección visual — pero **no se repitió la
      ronda de Playwright después del fix** para confirmarlo con captura de
      pantalla real. Pendiente si se quiere el mismo nivel de confianza
      visual que tuvieron AdminView/CalidadView/InsumosView.
- [x] 4a.3 Repetido el round de Playwright de 4.2 específicamente en
      PersonalView y ComprasView tras el fix, más 1 de los 6 botones
      corregidos en `ComparativaDetail.tsx` → 3/3 PASS, verde emerald
      sólido real (no cian) confirmado en tema claro y oscuro:
      - PersonalView "Guardar configuración" (Jornada + Deducciones)
      - ComprasView dropzone "Subir Documento"
      - ComparativaDetail "Guardar selección" (bonus: "Guardar veredicto" y
        badge "Guardar" de eval. técnica visibles en el mismo screenshot)
      Datos sembrados vía script one-off en `compras` y limpiados al
      terminar; los 5 servicios usados quedaron detenidos. Hallazgo menor
      no bloqueante y preexistente (no de este change): un empleado de
      prueba "PlaywrightNombre1 ApellidoE2E438112" quedó sembrado en
      Personal de una sesión Playwright previa sin limpiar.

## 5. Cierre

- [ ] 5.1 PR contra `main`, CI verde, merge.
- [ ] 5.2 Redeploy VPS de `app-shell` (build + `up -d`), smoke visual en
      producción en al menos una vista con "Guardar" y una con "Subir PDF".
