## Why

El Residente carece de información técnica en el cuadro comparativo para fundamentar su evaluación: no hay dónde capturar especificaciones requeridas por partida ni dónde almacenar las fichas técnicas (PDFs) que los proveedores envían. Esto obliga a gestionar esa información fuera del sistema, con riesgo de pérdida y sin trazabilidad.

## What Changes

- **Nueva tabla `ComparativaLinea`** en `compras`: campos `marca_modelo_ref` y `especificaciones_requeridas` por partida (cuadro × insumo), editables por Compras en estado BORRADOR y visibles al Residente en su panel de evaluación técnica.
- **Nueva tabla `FichaTecnicaInsumo`** en `gerencia-tecnica`: almacena documentos (PDF, Word, imágenes) vinculados a un insumo del catálogo, con metadatos de proveedor y usuario que los subió.
- **Endpoints de upload/download** en `gerencia-tecnica` para gestionar fichas técnicas de insumos.
- **UI en `ComparativaDetail`**: badge de fichas disponibles por partida + SideSheet para ver y subir fichas.
- **UI en `InsumosView`**: sección de fichas técnicas por insumo en el panel de detalle.

## Capabilities

### New Capabilities

- `detalles-tecnicos-comparativa`: Campos `marca_modelo_ref` + `especificaciones_requeridas` por partida en el cuadro comparativo, capturados por Compras y visibles al Residente durante la evaluación técnica.
- `fichas-tecnicas-insumo`: Gestión de documentos técnicos (fichas de proveedor) vinculados a cada insumo del catálogo — upload, listado, descarga y eliminación, accesibles desde la comparativa y desde el catálogo de insumos.

### Modified Capabilities

- `evaluacion-tecnica-comparativa`: El panel de evaluación técnica del Residente ahora muestra marca/modelo referencia, especificaciones requeridas y botón de acceso a fichas técnicas por partida.

## Impact

- `apps/compras/prisma/schema.prisma` — nueva tabla `ComparativaLinea`
- `apps/compras/src/main.ts` — endpoints CRUD de lineas de comparativa con detalles técnicos
- `apps/gerencia-tecnica/prisma/schema.prisma` — nueva tabla `FichaTecnicaInsumo`
- `apps/gerencia-tecnica/src/main.ts` — endpoints upload/download/delete de fichas; multer; variable `FICHAS_UPLOAD_DIR`
- `apps/gerencia-tecnica/package.json` — agregar dependencia `multer` y `@types/multer`
- `docker-compose.vps.yml` — volume mount para `fichas-upload` en gerencia-tecnica
- `apps/app-shell/src/components/ComparativaDetail.tsx` — badge fichas + SideSheet de fichas por partida + campos detalles técnicos en panel evaluación
- `apps/app-shell/src/views/InsumosView.tsx` — sección fichas técnicas en panel de insumo
