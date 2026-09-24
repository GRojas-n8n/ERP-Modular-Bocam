## Why

El repositorio combina cambios ya desplegados que siguen abiertos en OpenSpec,
cambios casi terminados pendientes de verificación y borradores locales que aún
no pertenecen a ninguna rama o PR. Además, el árbol principal local está detrás
de `origin/main` y muestra tres archivos modificados sin diferencias de
contenido. Continuar desarrollando sobre ese estado aumenta el riesgo de perder
trabajo, duplicar cambios o confundir "implementado" con "verificado en
producción".

La purga de proyectos también dejó una corrección arquitectónica que debe quedar
normalizada: producción utiliza una base `bocam_*` por servicio, no una sola base
con esquemas por servicio. El baseline operativo y las especificaciones deben
describir la topología real.

## What Changes

- Se crea un inventario SDD único de los changes activos, con estado, evidencia,
  siguiente acción y criterio de cierre.
- Se establece una clasificación obligatoria: `borrador-local`, `especificado`,
  `implementado`, `mergeado`, `desplegado`, `observando`, `bloqueado` o
  `archivable`.
- Se prohíbe archivar un change solo porque sus tareas de código estén marcadas;
  debe existir evidencia de merge, despliegue y verificación proporcional al
  riesgo.
- Se registra la ejecución real de la purga, sin secretos ni rutas sensibles, y
  se separa la verificación técnica completada de la validación autenticada aún
  pendiente.
- Se documenta como baseline la topología multidatabase observada en producción.
- Se preservan sin modificación los borradores locales y los archivos marcados
  por diferencias de formato hasta asignarlos a una rama explícita.

## Capabilities

### New Capabilities

- `gobierno-baseline-sdd`: inventario, clasificación, trazabilidad y cierre
  verificable de cambios SDD antes de iniciar nuevas etapas de saneamiento.

### Modified Capabilities

- `purga-datos-proyecto`: alinea la especificación normativa y su evidencia con
  la topología multidatabase real de producción.

## Impact

- Documentación y metadatos OpenSpec solamente.
- No modifica servicios, base de datos, infraestructura ni despliegues.
- No incorpora automáticamente los borradores locales: cada uno tendrá su propia
  rama y revisión.
- Este change debe permanecer local hasta retirar del repositorio público la
  exposición de infraestructura identificada en la siguiente etapa.
