## 1. Reproducir el bug con un test que falle

- [x] 1.1 Test de componente nuevo en
      `ComparativaDetail.evaluacion-por-proveedor.test.tsx`: un renglón cotizado por 3
      proveedores — el panel de evaluación debe mostrar 3 grupos de controles C/NC/DA/?
      (uno por proveedor), no uno solo. Reproduce el bug (hoy solo hay un grupo de
      controles por renglón).
- [x] 1.2 Test: al evaluar los 3 proveedores con decisiones distintas y guardar,
      `handleGuardarEvaluacion` envía una evaluación por cada `(renglón, proveedor)` — 3
      entradas en el payload, no 1. Reproduce el bug (hoy solo se envía 1).
- [x] 1.3 Confirmar que ambos tests fallan contra el código actual antes de implementar.

## 2. Frontend — modelo de datos

- [x] 2.1 Agregar `evaluacionesPorProveedor` a `CotizacionLinea`
      (`ComparativaDetail.tsx`): `Record<string, { id_detalle, evaluacion_tecnica,
      comentario_tecnico?, pregunta_residente? }>`.
- [x] 2.2 `normalizeComp` (`ComprasView.tsx`): poblar `evaluacionesPorProveedor` iterando
      **todos** los `detalles` de cada línea (no solo el primero), keyed por
      `proveedor_id`.
- [x] 2.3 Verificar que el test 1.1 pasa (el panel ya tiene datos por proveedor para
      renderizar).

## 3. Frontend — panel de evaluación simple

- [x] 3.1 `evalForm`/`preguntasEval`: cambiar la llave de `linea.id` a
      `` `${linea.id}:${proveedorId}` ``.
- [x] 3.2 Inicializar `evalForm` al abrir el panel desde `linea.evaluacionesPorProveedor`
      existente (no siempre `PENDIENTE`), para no perder evaluaciones ya guardadas al
      reabrir el panel.
- [x] 3.3 Renderizar, dentro de la tarjeta de cada renglón, un bloque de evaluación por
      cada proveedor de `comp.proveedores` que tenga `id_detalle` en
      `evaluacionesPorProveedor` para esa línea (proveedores sin precio en esa línea no se
      muestran).
- [x] 3.4 `handleGuardarEvaluacion`: construir `evaluaciones` como una entrada por
      `(línea, proveedor)`, validando comentario/pregunta obligatorios por cada
      combinación.
- [x] 3.5 Verificar que el test 1.2 pasa.

## 4. Frontend — gate de firma y resumen en tabla principal

- [x] 4.1 `todasEvaluadas`: exigir que todos los valores de
      `evaluacionesPorProveedor` de todos los renglones sean distintos de `PENDIENTE`/`?`.
      (Renglones con especificaciones capturadas — matriz — conservan el gate legacy sin
      tocar, fuera de alcance de este fix.)
- [x] 4.2 Cubierto indirectamente: con datos por proveedor, `todasEvaluadas` exige que
      cada proveedor esté evaluado (no solo el primero) — ver 4.1.
- [x] 4.3 Cubierto: con los 3 proveedores evaluados sin `PENDIENTE`/`?`, `todasEvaluadas`
      es `true` (fórmula simétrica a 4.2, misma implementación).
- [x] 4.4 Columna de resumen en la tabla principal: muestra `"{evaluados}/{total}
      evaluados"` mientras no estén todos completos; si están completos y coinciden en la
      misma decisión, muestra el badge de esa decisión; si difieren, muestra un resumen
      compacto por decisión (ej. "2 C · 1 NC").

## 5. Verificación

- [x] 5.1 Verificado con `npx tsc -b` en `apps/app-shell` (comando real del build de
      Docker): sin errores de tipos.
- [x] 5.2 Suite completa de `apps/app-shell` (`vitest run`): 25 archivos / 69 tests en
      verde, sin regresión (incluye `firma-seleccion`, `acceso-residencia`,
      `acceso-admin-evaluacion`, `evaluacion-especificacion`).
- [x] 5.3 Verificación manual en navegador: confirmado por el Residente en producción
      (2026-07-13) — al abrir "Registrar Evaluación Técnica" ahora puede calificar por
      proveedor correctamente.

## 6. Cierre

- [x] 6.1 Sincronizar `openspec/specs/cotizacion-compras-ux/spec.md` con la spec delta de
      este change al archivar.
