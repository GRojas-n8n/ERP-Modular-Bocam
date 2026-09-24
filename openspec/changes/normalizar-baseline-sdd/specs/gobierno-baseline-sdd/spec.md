## ADDED Requirements

### Requirement: El baseline SHALL preservar todo trabajo local antes de normalizar el repositorio
La normalización SHALL inventariar y preservar archivos modificados, directorios sin seguimiento, ramas y worktrees antes de actualizar, mover, agregar o limpiar el checkout principal. Ningún cambio local SHALL atribuirse a una implementación sin una diferencia de contenido verificable.

#### Scenario: Archivo marcado sin diferencia de contenido
- **WHEN** Git marca un archivo como modificado pero `git diff`, `git diff --raw` y `git diff --numstat` no muestran diferencias
- **THEN** el archivo se clasifica como estado local de formato y no se agrega, restaura ni atribuye a un change

#### Scenario: Borrador OpenSpec sin seguimiento
- **WHEN** existe un directorio OpenSpec sin seguimiento en el checkout principal
- **THEN** se registra como `borrador-local` y permanece intacto hasta asignarlo explícitamente a una rama

### Requirement: Cada change SHALL tener un estado respaldado por evidencia
Cada change activo SHALL registrar estado, evidencia disponible, evidencia faltante, dependencia y siguiente acción. Marcar todas las tareas de implementación no SHALL ser suficiente para archivarlo sin prueba de merge, despliegue y verificación proporcional al riesgo.

#### Scenario: Implementación mergeada sin verificación de producción
- **WHEN** el código de un change existe en `main` pero no hay evidencia de smoke o verificación operativa requerida
- **THEN** el change se clasifica como `mergeado` o `desplegado`, pero no como `archivable`

#### Scenario: Change completamente verificado
- **WHEN** existen CI verde, merge, despliegue, smoke y documentación requeridos
- **THEN** el change puede clasificarse como `archivable` y su archivo se hace en un PR documental

### Requirement: El baseline SHALL describir la topología real de producción
La documentación operativa SHALL considerar que cada servicio usa una base `bocam_*` separada con tablas en `public`. Toda operación que afecte varias bases SHALL declarar cómo congela escrituras, el orden de ejecución y el mecanismo de recuperación ante fallo parcial.

#### Scenario: Operación coordinada entre bases
- **WHEN** una operación modifica información de proyecto en más de una base
- **THEN** su design especifica mantenimiento, preflight completo, transacción por base, orden de ejecución y restauración o compensación ante fallo parcial

### Requirement: Los hallazgos sensibles SHALL permanecer locales mientras el repositorio siga expuesto
Los documentos que amplíen detalles de seguridad o infraestructura SHALL permanecer fuera del remoto público hasta que el repositorio sea privado o el contenido se haya saneado.

#### Scenario: Inventario de hardening aún no contenido
- **WHEN** el baseline incluye riesgos de credenciales, infraestructura o despliegue todavía vigentes
- **THEN** la rama no se publica y el siguiente change prioritario es contener esa exposición
