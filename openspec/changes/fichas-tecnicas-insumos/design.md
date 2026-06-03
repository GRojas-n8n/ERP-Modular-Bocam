## Context

El cuadro comparativo de Compras carece de dos elementos que el Residente necesita para hacer su evaluación técnica con fundamento:

1. **Detalles técnicos por partida** — no hay dónde registrar qué marca/modelo de referencia ni qué especificaciones se requieren para cada insumo en el cuadro. Esta información la captura Compras cuando llena los precios.

2. **Fichas técnicas de proveedor** — son documentos (PDFs, fichas de datos, normas) que los proveedores envían después de cotizar. El sistema no tiene dónde almacenarlos ni vincularlos al material correspondiente.

El patrón de upload con Multer ya existe en el módulo `calidad` (version documents) y se reutiliza aquí.

## Goals / Non-Goals

**Goals:**
- Tabla `ComparativaLinea` en `compras`: campos técnicos por (cuadro × insumo), sin tocar `ComparativaDetalle`
- Tabla `FichaTecnicaInsumo` en `gerencia-tecnica`: documentos vinculados al insumo del catálogo
- Endpoints upload/download/delete de fichas en `gerencia-tecnica` con control de roles
- UI en `ComparativaDetail`: badge de fichas disponibles + SideSheet de fichas por partida + detalles técnicos en el panel de evaluación técnica
- UI en `InsumosView`: sección de fichas técnicas en el panel de detalle del insumo
- Volume mount `vps_fichas_uploads` en `docker-compose.vps.yml`

**Non-Goals:**
- Versionado de fichas técnicas (eso es territorio de `calidad`)
- Validación de normas o estándares en el contenido del documento
- OCR o extracción de texto de las fichas (el Asistente IA ya cubre extracción de PDFs para cotizaciones)
- Cambio a evaluación técnica por (partida × proveedor) — sigue siendo por partida

## Decisions

### D1: ComparativaLinea como tabla separada, no campos en ComparativaDetalle

`ComparativaDetalle` existe a nivel (cuadro × insumo × proveedor). Los campos técnicos (`marca_modelo_ref`, `especificaciones_requeridas`) son requisitos de la partida — aplican igual para todos los proveedores. Ponerlos en `ComparativaDetalle` requeriría repetir el mismo valor N veces (una por proveedor) y coordinar consistencia.

**Alternativa descartada:** agregar campos a `ComparativaDetalle` con valor idéntico por fila de proveedor → duplicación y riesgo de inconsistencia.

**Decisión:** nueva tabla `ComparativaLinea` a nivel (cuadro × insumo) — una sola fila por partida.

### D2: FichaTecnicaInsumo vive en gerencia-tecnica, no en compras

La ficha técnica es un atributo del material/insumo en el catálogo, no de una comparativa en particular. Vincularla al `insumo_id` en `gerencia-tecnica` permite que cualquier módulo que consulte un insumo tenga acceso a sus fichas, independientemente del flujo de compras.

**Alternativa descartada:** tabla en `compras` con `comparativa_id + insumo_id` → rompe el principio de que la ficha pertenece al insumo, no al cuadro.

### D3: Almacenamiento en filesystem VPS con Docker volume, igual que calidad

El módulo `calidad` ya usa este patrón: `multer` → tmp → `fs.renameSync` → directorio final. El VPS tiene disco suficiente y el patrón es probado.

- `FICHAS_UPLOAD_DIR` en `docker-compose.vps.yml` → `/data/gerencia-tecnica/fichas`
- Volume: `vps_fichas_uploads` montado en `gerencia-tecnica`
- Extensiones permitidas: `.pdf`, `.doc`, `.docx`, `.jpg`, `.jpeg`, `.png`
- Límite: 20 MB por archivo

**Alternativa descartada:** almacenamiento en DB como bytea → impacto en tamaño de BD y rendimiento.

### D4: Roles de acceso diferenciados para upload vs. consulta

- **Upload:** `procurement`, `gerencia_tecnica`, `admin` — quienes tienen contexto para subir documentos de proveedores
- **Consulta/descarga:** `resident`, `control_obra`, `gerencia_tecnica`, `superintendent`, `procurement`, `admin` — todos los que participan en el flujo de evaluación
- **Eliminación:** `procurement`, `gerencia_tecnica`, `admin`

### D5: Upload de fichas accesible desde ComparativaDetail SIN navegar a InsumosView

El Residente o Compras puede estar en pleno flujo de la comparativa y necesitar subir/consultar una ficha sin salir. El SideSheet de fichas se abre desde el badge en cada partida de la comparativa, llama directamente a `gerencia-tecnica` con el `insumo_id`.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| Archivos en filesystem VPS se pierden si se recrea el container | Volume `vps_fichas_uploads` persiste fuera del container — igual que `vps_calidad_uploads` |
| ComparativaLinea puede no existir para cuadros anteriores a esta migración | La UI trata ausencia de `ComparativaLinea` como campos vacíos editables — no es error |
| Un insumo eliminado del catálogo deja fichas huérfanas | `insumo_id` es FK externa (UUID sin `@relation` — patrón del proyecto); la eliminación de insumos es infrecuente y controlada |
| Limite de 20 MB puede ser insuficiente para algunos PDFs técnicos de maquinaria | Configurable vía env var `FICHAS_MAX_SIZE_MB`; valor inicial conservador |

## Migration Plan

1. Agregar `ComparativaLinea` en schema de `compras` → `prisma migrate deploy`
2. Agregar `FichaTecnicaInsumo` en schema de `gerencia-tecnica` → `prisma migrate deploy`
3. Agregar `multer` a `apps/gerencia-tecnica/package.json`
4. Agregar `FICHAS_UPLOAD_DIR` + volume `vps_fichas_uploads` en `docker-compose.vps.yml`
5. Build y restart de `gerencia-tecnica` y `app-shell`
6. Los cuadros existentes en producción no se ven afectados — `ComparativaLinea` ausente = campos vacíos

**Rollback:** eliminar las dos tablas nuevas vía `prisma migrate reset` o DROP TABLE manual; revertir `main.ts` y frontend a commit anterior.
