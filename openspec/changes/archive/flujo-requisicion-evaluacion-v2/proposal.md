## Why

El flujo de requisición → cuadro comparativo → evaluación técnica tiene brechas de diseño que comprometen la integridad del proceso de compras: el Residente ve los precios de los proveedores durante su evaluación técnica (lo que sesga su juicio), no tiene espacio para capturar especificaciones técnicas desde el origen, y el cuadro comparativo bloqueado puede ser modificado sin trazabilidad. Este cambio cierra esas brechas y hace el flujo intuitivo para cada rol.

## What Changes

- **Especificaciones por renglón en la Requisición**: Al crear o editar una requisición, el Residente puede agregar (a mano) especificaciones técnicas por partida: marca/modelo de referencia y texto libre de especificaciones. Estas specs fluyen al cuadro comparativo como contexto para Compras y para la evaluación.
- **Vista del Residente en el Cuadro Comparativo — sin precios**: Cuando el Residente accede a un cuadro en `EN_EVALUACION_TECNICA`, ve una tabla simplificada: descripción del material, cantidad, especificaciones requeridas (capturadas en la req), lo que cada proveedor ofrece (sin precio), fichas técnicas. **Sin columnas de precio, sin fechas de entrega, sin totales.**
- **Acceso desde ResidenciaView**: Se agrega un tab/sección "Para evaluar" en `ResidenciaView` con los cuadros que esperan evaluación técnica del Residente, sin tener que navegar al módulo de Compras.
- **Comportamiento del "?" — crea nueva revisión**: Cuando el Residente marca un renglón con "?", aparece un campo de pregunta/aclaración en la parte baja de ese renglón. Al guardar, se crea automáticamente una nueva revisión del cuadro (ej. Rev A → Rev B). Compras ve la pregunta, responde, y re-envía el cuadro a evaluación. El Residente en la revisión B ve la respuesta y puede evaluar definitivamente.
- **Veredicto final del Residente**: En la parte baja del cuadro comparativo, antes de la firma, el Residente escribe: (a) su veredicto técnico general (texto libre) y (b) el/los proveedor(es) que recomienda para la compra. Solo puede firmar cuando todos los renglones tienen evaluación definitiva (C/NC/DA — no "?") y ha llenado el veredicto.
- **Firma y bloqueo del cuadro**: Al firmar, el cuadro queda `FIRMADO_BLOQUEADO`. Solo un usuario con rol `admin` puede desbloquearlo desde su cuenta. Cada desbloqueo genera un registro de auditoría con: quién desbloqueó, fecha/hora exacta, y justificación obligatoria.

## Capabilities

### New Capabilities

- `specs-por-renglon-en-req`: Captura de especificaciones técnicas por partida al crear/editar una requisición (marca/modelo + texto libre). Primera versión: entrada manual. Futura versión: búsqueda en base de datos de materiales.
- `vista-evaluacion-residente`: Vista del cuadro comparativo para el Residente, sin precios ni fechas de entrega, enfocada en especificaciones y evaluación técnica. Incluye tab de acceso directo desde ResidenciaView.
- `interrogacion-y-nueva-revision`: Comportamiento del marcador "?" en la evaluación: abre campo de pregunta, al guardar crea una nueva revisión del cuadro. Compras ve la pregunta y responde antes de re-enviar a evaluación.
- `veredicto-y-sugerencia-proveedor`: Sección de veredicto general del Residente al pie del cuadro comparativo: texto de veredicto + selección de proveedor(es) recomendados. Requerida antes de poder firmar.
- `bloqueo-firmado-y-auditoria-desbloqueo`: Estado `FIRMADO_BLOQUEADO` en el cuadro. Desbloqueo exclusivo por `admin` con justificación obligatoria. Tabla de auditoría con: id, cuadro_id, admin_id, timestamp, justificacion.

### Modified Capabilities

- `flujo-solicitud-cotizacion`: Las especificaciones del Residente (capturadas en la req) deben incluirse en los datos que se envían en la SCP a los proveedores.

## Impact

- **Schema `compras`**: Nueva tabla `req_linea_especificaciones` (o campos en `req_detalles`); nuevos campos en `cuadros_comparativos`: `veredicto_residente`, `proveedores_sugeridos` (array UUID), `estado_bloqueo`; nueva tabla `auditoria_desbloqueo_comparativa`.
- **Backend `compras`**: Nuevos endpoints para specs en req, nuevo estado `FIRMADO_BLOQUEADO`, endpoint de desbloqueo admin, consulta de cuadros pendientes por Residente.
- **Frontend `app-shell`**: `ResidenciaView` (nuevo tab "Para evaluar"), `ComparativaDetail` (modo Residente vs modo Compras), formulario de req (sección specs por partida), sección veredicto al pie del cuadro.
- **RBAC**: El endpoint de desbloqueo requiere rol `admin` exclusivamente.
