## 1. Componente compartido

- [x] 1.1 Props opcionales `fileName?`/`destination?` agregadas a `ConfirmCriticalActionDialog` (`packages/ui-core/src/primitives.tsx`), renderizadas en un bloque antes de `children` cuando están presentes.
- [x] 1.2 `ConfirmCriticalActionDialog.archivo-destino.test.tsx`: confirmado en rojo antes del cambio, verde después. La suite preexistente `ConfirmCriticalActionDialog.test.tsx` (8 tests, no tocada) sigue en verde — no rompe los 16+ usos actuales de alta.

## 2. Gerencia Técnica — Catálogo, Explosión de Insumos, APU

- [x] 2.1–2.3 `InsumosView.tsx`: los 3 `onChange` de input de archivo (`handleFileChange`/`handleFileAPU`/`handleFileExplosion`) ahora solo capturan el `File` y abren `pendingUpload` — el parseo real se movió a `procesarCatalogo`/`procesarAPU`/`procesarExplosion`, invocadas solo al confirmar.
- [x] 2.4 Cancelar limpia `pendingUpload` sin abrir ningún `SlidePanel` ni invocar el parser (verificado en test).
- [x] 2.5/2.6 `InsumosView.confirmacion-antes-de-subir.test.tsx` (3 tests: diálogo con nombre/destino/proyecto en Catálogo, cancelar en Explosión no abre preview, destino correcto en APU) — confirmado en rojo→verde.
- [x] **Test preexistente actualizado**: `InsumosView.error-real-importar-insumos.test.tsx` simulaba seleccionar un archivo y esperaba el `SlidePanel` directamente — se agregó el paso de clic en "Confirmar" del nuevo diálogo antes de esa espera. Sigue en verde.

## 3. Fichas Técnicas

- [x] 3.1 `InsumosView.tsx`: `handleFichaInsUpload` captura el archivo y abre `pendingUpload` (`kind: 'ficha'`); el POST real se movió a `procesarFichaIns`.
- [x] 3.2 `InsumosView.confirmacion-ficha-tecnica.test.tsx` (2 tests: cancelar no llama al backend, confirmar sí lo llama) — confirmado en rojo→verde.

## 4. Usuarios y Empleados

- [x] 4.1 `AdminView.tsx` — Usuarios es alta por **formulario**, no archivo (confirmado: no hay carga masiva de usuarios en este proyecto). Se usó el patrón `confirmacion-proyecto-en-altas` (sin `fileName`/`destination`): `UserModal.handleSubmit` valida y, si es alta nueva (no edición), abre `ConfirmCriticalActionDialog` en vez de enviar directo; editar un usuario existente no cambia.
- [x] 4.2 `PersonalView.tsx` — el expediente de Empleado sí es una carga de archivo real (`fileExpedienteRef` + botón "Subir documento"). `handleSubirDocumento` ahora abre el diálogo (destino "Personal → Empleados (expediente)"); el POST se movió a `subirDocumentoReal`.
- [x] 4.3 `AdminView.confirmacion-alta-usuario.test.tsx` (2 tests) y `PersonalView.confirmacion-expediente.test.tsx` (2 tests) — ambos confirmados en rojo→verde.

## 5. Proveedores

- [x] 5.1 `ComprasView.tsx`: el `onChange` inline del input de documento de proveedor se redujo a capturar el archivo en `pendingDocProveedor`; el POST se extrajo a `subirDocProveedor`, invocado solo al confirmar (destino "Compras → Proveedores").
- [x] 5.2 `ComprasView.confirmacion-documento-proveedor.test.tsx` (2 tests) — confirmado en rojo→verde.

## 6. Verificación cruzada

- [ ] 6.1 Verificación manual con un segundo proyecto activo en los 7 flujos — pendiente, requiere ambiente corriendo; queda para QA/revisión humana. Cubierto parcialmente por tests: `projectName` en todos los diálogos se deriva de `currentProjectId`/`useTenant()` en cada render, no de un valor cacheado.
- [x] 6.2 Suite completa de `AdminView.*`, `PersonalView.*`, `ComprasView.*`, `InsumosView.*` y `ConfirmCriticalActionDialog.*` corrida junta: **41 archivos / 127 tests, todos en verde** — sin romper `confirmacion-proyecto-en-altas` ni `confirmacion-accion-critica-proyecto`. `tsc -b` limpio en `app-shell` (incluye `ui-core` transitivamente).
