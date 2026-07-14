## ADDED Requirements

### Requirement: Los endpoints de subida de archivos SHALL aceptar solo tipos de archivo permitidos
Cada endpoint de subida de archivo (fichas técnicas en `gerencia-tecnica`, PDFs de
cotización y documentos de proveedor en `compras`, adjuntos en `calidad`, lectura de PDF
de cotización por IA en `asistente`) SHALL rechazar cualquier archivo cuya extensión o
tipo MIME no esté en la lista permitida configurada para ese endpoint, sin persistir el
archivo rechazado.

#### Scenario: Archivo con extensión no permitida
- **WHEN** un usuario sube un archivo cuya extensión no está en la lista permitida de ese
  endpoint (ej. un `.exe` a un endpoint que solo acepta `.pdf`/`.doc`/`.docx`/`.jpg`/`.jpeg`/`.png`)
- **THEN** el sistema responde con un error indicando el tipo de archivo no permitido, sin
  guardar el archivo

#### Scenario: Archivo con extensión permitida
- **WHEN** un usuario sube un archivo cuya extensión sí está en la lista permitida
- **THEN** el sistema acepta y procesa el archivo con éxito

### Requirement: Los endpoints de subida de archivos SHALL rechazar archivos que excedan el límite de tamaño configurado
Cada endpoint SHALL responder con un error explícito (no una excepción no controlada ni un
cierre de conexión silencioso) cuando el archivo subido excede el límite de tamaño
configurado para ese endpoint, e identificarlo como error de límite de tamaño
(`MulterError` con código `LIMIT_FILE_SIZE`).

#### Scenario: Archivo excede el límite de tamaño
- **WHEN** un usuario sube un archivo más grande que el límite configurado del endpoint
- **THEN** el sistema responde con un error HTTP explícito indicando que se superó el
  límite de tamaño, sin persistir el archivo

#### Scenario: Archivo dentro del límite de tamaño
- **WHEN** un usuario sube un archivo dentro del límite configurado
- **THEN** el sistema lo acepta y procesa normalmente

### Requirement: El almacenamiento de archivos subidos SHALL seguir el modo configurado por endpoint (disco o memoria)
Los endpoints que persisten el archivo temporalmente en disco (`gerencia-tecnica`,
`compras` ×2, `calidad`) SHALL seguir escribiéndolo al directorio temporal configurado; el
endpoint que solo necesita el buffer en memoria para enviarlo a un servicio externo
(`asistente`, lectura de PDF por IA) SHALL seguir sin escribir ningún archivo a disco.

#### Scenario: Endpoint con almacenamiento en disco
- **WHEN** se sube un archivo válido a un endpoint configurado con almacenamiento en disco
- **THEN** el archivo queda disponible en el directorio temporal configurado para ese
  endpoint

#### Scenario: Endpoint con almacenamiento en memoria
- **WHEN** se sube un archivo válido al endpoint de lectura de cotización por IA
- **THEN** el archivo está disponible como buffer en memoria (`req.file.buffer`) sin
  escribirse a disco
