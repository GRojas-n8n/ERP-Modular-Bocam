## ADDED Requirements

### Requirement: Las capacidades project-scoped SHALL exigir un proyecto activo
Toda ruta y vista clasificada como `project-scoped` SHALL exigir un identificador
de proyecto no vacío antes de leer o modificar datos, incluso cuando el usuario
tenga un rol de nivel tenant como `admin`, `superintendent` o `finanzas`. La
exención de asignación explícita de un rol tenant-level no SHALL interpretarse
como permiso para consultar sin proyecto.

#### Scenario: Administrador sin proyectos abre Gerencia Técnica
- **WHEN** un usuario `admin` autenticado tiene cero proyectos accesibles y abre Gerencia Técnica
- **THEN** la aplicación muestra un estado de proyecto requerido, no solicita datos project-scoped y no renderiza conceptos, presupuestos ni acciones de escritura

#### Scenario: Endpoint project-scoped recibe proyecto vacío
- **WHEN** una petición autenticada llega a un endpoint project-scoped con `securityContext.proyectoId` vacío
- **THEN** el backend responde `403 AUTH_PROJECT_REQUIRED` antes de consultar datos y no sustituye el filtro de proyecto por un filtro vacío

#### Scenario: Rol tenant-level opera dentro de un proyecto válido
- **WHEN** un usuario de nivel tenant selecciona un proyecto válido del tenant y llama un endpoint project-scoped
- **THEN** el backend procesa la petición limitada explícitamente a ese `proyecto_id`

### Requirement: La pérdida de contexto SHALL limpiar datos del proyecto anterior
Cuando el proyecto activo deje de ser válido o pase a `null`, el frontend SHALL
eliminar de memoria los datos project-scoped renderizados previamente y SHALL
cancelar o ignorar respuestas pendientes del proyecto anterior.

#### Scenario: El proyecto activo se elimina durante una sesión
- **WHEN** la sesión pasa de un proyecto válido a cero proyectos accesibles después de refrescar el usuario
- **THEN** las vistas project-scoped limpian sus tablas, totales y selecciones y muestran el estado seguro sin proyecto

#### Scenario: Respuesta tardía del proyecto anterior
- **WHEN** una petición del proyecto anterior termina después de que `currentProjectId` cambió a `null` o a otro proyecto
- **THEN** la respuesta no reemplaza el estado correspondiente al nuevo contexto

### Requirement: Los modos globales SHALL estar declarados por capacidad
El sistema SHALL permitir que una ruta opere sin proyecto activo únicamente si
su especificación la clasifica expresamente como `tenant-scoped` o catálogo
compartido, y SHALL mantener una matriz verificable de alcance y pruebas de
regresión para esas excepciones.

#### Scenario: Capacidad global documentada
- **WHEN** un rol autorizado consulta una capacidad tenant-scoped documentada sin proyecto activo
- **THEN** el endpoint conserva su comportamiento global y filtra al menos por tenant

#### Scenario: Ruta sin clasificación explícita
- **WHEN** una ruta consume o modifica entidades con `proyecto_id` y no existe una excepción tenant-scoped documentada
- **THEN** la ruta se trata como project-scoped y exige un proyecto activo
