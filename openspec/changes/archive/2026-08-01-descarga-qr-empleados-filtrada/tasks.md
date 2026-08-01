## 1. Filtros sobre el listado de selección de credenciales

- [x] 1.0 Escribir test de integración (backend, `apps/personal/test/integration`) y extender `GET /api/v1/personal/empleados` para incluir, por empleado, `asignaciones` (AsignacionFrente activas) y `asignacionesResidente` (vigentes, `fecha_fin: null`) — de forma aditiva, sin romper el contrato existente. Necesario porque hoy ese listado bulk no trae frente de trabajo ni residente vigente (solo se cargan por empleado individual).
- [x] 1.1 Escribir tests (RTL, siguiendo el patrón de `PersonalView.imprimir-lote-credenciales.test.tsx`) que reproduzcan los escenarios de `credencial-empleado`: filtrar por residente vigente, por cuadrilla/frente de trabajo, por categoría, por texto libre (nombre/número), combinación de filtros, y que "seleccionar todos" solo marque los visibles tras filtrar.
- [x] 1.2 Implementar en `PersonalView.tsx` el estado y los controles de filtro (residente, cuadrilla/frente, categoría, texto libre) dentro del panel de selección de credenciales, derivando la lista filtrada con `useMemo` sobre `empleados` + `asignacionesFrente` + asignación de residente vigente ya cargados.
- [x] 1.3 Ajustar el checkbox maestro ("seleccionar todos") para operar sobre la lista filtrada, no sobre `empleados` completo.
- [x] 1.4 Verificar tests en verde.

## 2. Hoja de solo QR y acción "Descargar QR"

- [x] 2.1 Escribir tests para `construirHojaSoloQR` en `apps/app-shell/src/lib` (nuevo archivo de test junto a `credencialesPrint.ts`): valida que el HTML generado contiene QR, nombre y número por cada item, y NO contiene foto/reverso/contacto de emergencia.
- [x] 2.2 Implementar `construirHojaSoloQR` en `credencialesPrint.ts` (hoja compacta: QR + nombre + número, una sola cara, sin foto ni reverso).
- [x] 2.3 Escribir tests (RTL) para el nuevo botón "Descargar QR" en `PersonalView.tsx`: llama al mismo endpoint `imprimir-lote` con la selección filtrada, usa `construirHojaSoloQR` (no `construirHojaCredenciales`), respeta el aviso de exclusión de empleados no elegibles del proyecto activo (mismo comportamiento que el fix ya existente de `imprimir-lote`).
- [x] 2.4 Implementar el botón "Descargar QR" y su handler (`handleDescargarQR`, análogo a `handleImprimirSeleccionados` pero usando `construirHojaSoloQR`), incluyendo el aviso de excluidos.
- [x] 2.5 Verificar tests en verde.

## 3. Verificación end-to-end

- [x] 3.1 Levantar app-shell + personal localmente (skill `run-app-shell`), iniciar sesión con un usuario `personal_rh` o `admin` real.
- [x] 3.2 En el navegador: aplicar al menos dos filtros combinados (ej. cuadrilla + categoría), confirmar que el listado seleccionable se acota correctamente y que "seleccionar todos" no selecciona empleados fuera del filtro.
- [x] 3.3 En el navegador: descargar QR de una selección filtrada y confirmar visualmente que la hoja generada contiene solo QR + nombre + número (sin foto/reverso), y que "Imprimir credenciales" sigue generando la hoja completa sin regresión.
- [x] 3.4 Confirmar que un empleado sin credencial activa incluido en la descarga de QR recibe una credencial nueva automáticamente (revisar en el panel de configuración del empleado tras la descarga).

## 4. Cierre

- [x] 4.1 Ejecutar la suite completa de tests de `apps/app-shell` (o al menos los archivos de `PersonalView` y `credencialesPrint`) y confirmar que no hay regresiones.
- [x] 4.2 Actualizar `openspec/specs/credencial-empleado/spec.md` (vía `openspec archive`) una vez verificado en producción.
