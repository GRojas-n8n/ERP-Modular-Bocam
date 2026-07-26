## ADDED Requirements

### Requirement: RH emite una credencial con token opaco para un empleado
El sistema SHALL permitir a un usuario con rol `personal_rh` o `admin` generar una credencial para un empleado — `POST /api/v1/personal/empleados/:id/credencial` —, creando un registro `CredencialEmpleado` con un `token` aleatorio de al menos 32 bytes (base62), único por tenant, y `activa = true`. El token SHALL NOT ser derivable del `id_empleado` ni de ningún otro identificador expuesto por la API.

#### Scenario: Emisión de la primera credencial
- **WHEN** RH solicita una credencial para un empleado sin credenciales previas
- **THEN** el sistema crea un `CredencialEmpleado` con `activa = true` y retorna el `token` para generar el QR

#### Scenario: Reemisión revoca la anterior automáticamente
- **WHEN** RH solicita una nueva credencial para un empleado que ya tiene una `activa = true`
- **THEN** el sistema marca la anterior como `activa = false` (`revocada_en`, `revocada_por = userId`) y crea una nueva `activa = true`; solo una credencial por empleado puede estar activa a la vez

### Requirement: RH revoca una credencial sin reemitir
El sistema SHALL exponer `DELETE /api/v1/personal/empleados/:id/credencial`, restringido a `personal_rh`/`admin`, que marca la credencial activa del empleado como `activa = false` sin crear una nueva, para el caso de tarjeta perdida/robada mientras se gestiona la reposición física.

#### Scenario: Revocar credencial perdida
- **WHEN** RH revoca la credencial activa de un empleado
- **THEN** el token deja de resolver a un empleado válido en el endpoint de escaneo (responde `410 Gone`)

### Requirement: RH consulta el token vigente para reimprimir
El sistema SHALL exponer `GET /api/v1/personal/empleados/:id/credencial`, restringido a `personal_rh`/`admin`, que retorna la credencial `activa` del empleado (o `null` si no tiene) sin necesidad de regenerarla.

#### Scenario: Reimprimir credencial existente
- **WHEN** RH consulta la credencial de un empleado que ya tiene una `activa`
- **THEN** el sistema retorna el mismo `token`, permitiendo reimprimir la hoja sin invalidar la credencial ya distribuida

### Requirement: Fotografía de credencial en el expediente
El sistema SHALL aceptar `tipo_documento = FOTO_CREDENCIAL` en `POST /api/v1/personal/empleados/:id/documentos` (mismo endpoint de expediente ya existente), sujeto a las mismas reglas de tipo/tamaño de archivo. La fotografía vigente para impresión SHALL ser el documento `FOTO_CREDENCIAL` más reciente de ese empleado.

#### Scenario: Subir foto de credencial
- **WHEN** RH sube un archivo `.jpg` con `tipo_documento = FOTO_CREDENCIAL` para un empleado
- **THEN** el sistema lo guarda en el expediente igual que cualquier otro documento

#### Scenario: Imprimir sin foto disponible
- **WHEN** RH genera el lote de impresión para un empleado sin ningún `FOTO_CREDENCIAL` en su expediente
- **THEN** el sistema usa un marcador con las iniciales del empleado en vez de fallar la generación del lote

### Requirement: Impresión en lote de una, varias o todas las credenciales de un proyecto
El sistema SHALL permitir a RH seleccionar uno, varios, o todos los empleados elegibles de un proyecto (mismo criterio de `obtenerEmpleadoIdsDelProyecto` usado en `calcular`) y generar una hoja imprimible (frente y reverso) con sus credenciales, incluyendo QR real codificado como `BOCAM:CRED:{token}` — generando una credencial nueva automáticamente para cualquier empleado seleccionado que aún no tenga una `activa`.

#### Scenario: Imprimir credenciales de todo un proyecto
- **WHEN** RH selecciona "todos" en el selector de impresión para el proyecto activo
- **THEN** el sistema genera la hoja con una credencial por cada empleado elegible del proyecto, emitiendo credencial nueva a quien no tenía

### Requirement: Aislamiento de `credenciales_empleado` reforzado por RLS
La tabla `credenciales_empleado` SHALL tener Row-Level Security habilitado y forzado con una única política que exija `tenant_id` coincidente con `current_setting('app.current_tenant_id')` en `USING` y `WITH CHECK` (solo `tenant_id` — la credencial, igual que el empleado, no está scoped a un proyecto). Esto SHALL actuar como defensa en profundidad además del filtro explícito por `tenant_id` que ya existe en el código de `apps/personal/src/main.ts`.

#### Scenario: Un tenant no puede resolver el token de credencial de otro tenant
- **WHEN** una consulta ejecuta `SELECT ... WHERE token = X` sobre `credenciales_empleado` con `app.current_tenant_id` fijado a un tenant distinto al dueño de esa credencial
- **THEN** la consulta retorna 0 filas, incluso si el `token` es correcto y la consulta de aplicación no incluyera un `WHERE tenant_id` explícito

#### Scenario: Emisión de credencial no puede escribir en otro tenant
- **WHEN** una transacción con `app.current_tenant_id = T1` intenta crear una fila de `credenciales_empleado` con `tenant_id = T2`
- **THEN** la operación es rechazada por `WITH CHECK`, en vez de insertar silenciosamente una credencial cross-tenant
