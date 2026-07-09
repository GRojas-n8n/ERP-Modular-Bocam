## 1. Componente compartido

- [x] 1.1 Crear `apps/app-shell/src/components/TableScrollShadow.tsx` — wrapper con
      `overflow-x-auto`, `ref`, listener de `scroll` y `ResizeObserver` que calcula
      `hasHiddenLeft` / `hasHiddenRight` y renderiza la sombra/gradiente
      correspondiente en cada borde (`pointer-events-none`, absolute).
- [x] 1.2 Test unitario de `TableScrollShadow`: sin overflow no muestra ninguna
      sombra; con overflow a la derecha en la carga inicial muestra sombra derecha;
      al desplazar hasta el final la sombra derecha desaparece; al desplazar desde
      el extremo izquierdo aparece la sombra izquierda (cubre los 4 escenarios del
      spec `tabla-scroll-horizontal-affordance`).
      (Requirió agregar infraestructura de testing a app-shell — Vitest +
      Testing Library no existían — y corregir una duplicación preexistente de
      React 18/19 en el monorepo vía `overrides` en el `package.json` raíz.)

## 2. Test que reproduce el bug reportado

- [x] 2.1 Test (RTL) sobre la tabla de Catálogo de Obra en `InsumosView.tsx` que
      reproduce el bug: renderiza la vista con datos mockeados, simula overflow
      horizontal y verifica que aparece la señal visual — este test falla contra
      el código actual (sin ninguna señal visual disponible) y pasa después de
      aplicar `TableScrollShadow` en 3.1.

## 3. Aplicar a Catálogo de Obra (bug original)

- [x] 3.1 `InsumosView.tsx` línea 1825 (Catálogo de Obra): reemplazar
      `<div className="overflow-x-auto">` por `<TableScrollShadow>` y verificar que
      el test de 2.1 pasa.

## 4. Aplicar a tablas funcionales (solo affordance)

- [x] 4.1 `InsumosView.tsx` líneas 2045, 2371, 2668, 2855, 3026
- [x] 4.2 `CalidadView.tsx` líneas 919, 1282
- [x] 4.3 `VentasView.tsx` líneas 254, 293, 334
- [x] 4.4 `ContabilidadView.tsx` línea 433
- [x] 4.5 `PersonalView.tsx` línea 1104
- [x] 4.6 `ComparativaPrecios.tsx` línea 85
- [x] 4.7 `ComparativaDetail.tsx` líneas 1442, 1587, 2659

## 5. Corregir tablas rotas (overflow-hidden + min-w, recortan columnas)

- [x] 5.1 `InsumosView.tsx` líneas 2173-2174 (Control de Costos WBS): cambiar
      `overflow-hidden` por `<TableScrollShadow>`, sin tocar `min-w-[900px]`
- [x] 5.2 `InsumosView.tsx` línea 2575 (Trazabilidad)
- [x] 5.3 `ComprasView.tsx` línea 1760 (proveedores)
- [x] 5.4 `ControlProyectosView.tsx` líneas 363, 431, 515
- [x] 5.5 `ResidenciaView.tsx` línea 1489 (nómina)
- [x] 5.6 `ContabilidadView.tsx` línea 280 (detalle de movimientos contables — no
      tiene wrapper de scroll; agregar `<TableScrollShadow>`)

## 6. Ajuste de scrollbar global

- [x] 6.1 `apps/app-shell/src/index.css` líneas 126-132: aumentar contraste del
      `::-webkit-scrollbar-thumb` (color más sólido) sin rediseñar el estilo
      general del scrollbar del resto de la app.

## 7. Verificación

- [x] 7.1 Ejecutar todos los tests unitarios nuevos (1.2, 2.1) y confirmar que
      pasan. (5/5 tests OK; type-check y `npm run build` limpios)
- [ ] 7.2 Verificación manual en navegador: Catálogo de Obra y al menos 2 de las
      tablas antes rotas (Control de Costos WBS, proveedores) muestran la sombra
      correctamente en distintos anchos de ventana.
      **PENDIENTE** — no hay herramienta de automatización de navegador
      disponible en este entorno y el backend completo (12 microservicios) no
      está levantado; requiere verificación manual del usuario en `npm run dev`
      contra el backend real, o que el usuario habilite un navegador
      automatizado para hacerlo aquí.
- [x] 7.3 Confirmar que ninguna tabla fuera del inventario de `proposal.md` →
      Impact fue modificada. (`git status` confirma que solo se tocaron los
      archivos documentados + infraestructura de testing nueva)
