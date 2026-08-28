## Why

Al subir Catálogo de Obra, Explosión de Insumos, Análisis de Precios Unitarios (APU), Fichas
Técnicas, o al hacer carga masiva de Usuarios, Empleados o Proveedores, el sistema ejecuta la
carga sin mostrarle antes al usuario qué archivo está por subir, a qué módulo/proyecto se
guardará, y sin pedirle una confirmación explícita. Esto ya causó errores de datos guardados en el
proyecto equivocado. El sistema YA tiene un patrón de confirmación de alta con el proyecto activo
(`confirmacion-proyecto-en-altas`, componente compartido `ConfirmCriticalActionDialog` de
`packages/ui-core/src/primitives.tsx:349-430`) para formularios de alta individual, pero ese
patrón no cubre los flujos de carga de archivo, que son justamente donde el riesgo de guardar en
el proyecto/módulo equivocado es mayor (archivos completos, no un solo registro).

## What Changes

- Extender el diálogo de confirmación compartido (`ConfirmCriticalActionDialog`) para que, en los
  flujos de carga de archivo, muestre además del proyecto activo: el nombre del archivo
  seleccionado y el destino dentro de iRetum (módulo + tipo de carga, ej. "Gerencia Técnica →
  Catálogo de Obra").
- Insertar este diálogo de confirmación **antes** de iniciar el procesamiento/preview del archivo
  en los 7 flujos de carga: Catálogo de Obra, Explosión de Insumos, APU, Fichas Técnicas, Usuarios,
  Empleados (alta individual y carga masiva), Proveedores (carga masiva).
- Para Catálogo/Explosión/APU (que ya abren un `SlidePanel` de preview del contenido tras
  seleccionar el archivo), el nuevo diálogo se muestra primero; solo tras confirmar se abre el
  `SlidePanel` de preview existente.
- Para Fichas Técnicas, Usuarios, Empleados, Proveedores (subida de archivo único sin preview
  tabular hoy), el diálogo de confirmación reemplaza el envío directo actual.

## Capabilities

### New Capabilities
(ninguna — se reutiliza el componente y patrón ya existente)

### Modified Capabilities
- `confirmacion-proyecto-en-altas`: ampliar su alcance para cubrir también los flujos de carga de
  archivo (no solo altas de formulario individual), y agregar al contenido del diálogo el nombre
  del archivo y el destino/módulo, además del proyecto activo que ya muestra hoy.

## Impact

- Frontend: `apps/app-shell/src/views/InsumosView.tsx` (Catálogo, Explosión, APU),
  `apps/app-shell/src/views/AdminView.tsx` (Usuarios), `apps/app-shell/src/views/PersonalView.tsx`
  (Empleados), `apps/app-shell/src/views/ComprasView.tsx` (Proveedores), y el componente
  compartido `packages/ui-core/src/primitives.tsx` (`ConfirmCriticalActionDialog` — nuevas props
  opcionales para archivo/destino).
- No requiere cambios de backend ni de esquema — es un cambio de flujo de UI que precede al
  envío que ya existe hoy en cada módulo.
