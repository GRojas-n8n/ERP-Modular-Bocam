## Context

El selector de Centro de Costos en el header permite cambiar entre proyectos del mismo tenant. Al seleccionar un proyecto, `setCurrentProjectId` actualizaba el estado React inmediatamente (optimistic), y en background obtenía el nuevo JWT con `switch-project`.

El problema: React re-renderiza al cambiar `currentProjectId`, lo que dispara los `useEffect([currentProjectId])` de las vistas ANTES de que el nuevo JWT esté en localStorage. Todas las peticiones al backend se hacen con el JWT viejo (proyecto anterior), devolviendo datos incorrectos.

## Goals / Non-Goals

**Goals:**
- JWT actualizado ANTES de que `currentProjectId` cambie en el estado
- Si `switch-project` falla, no cambiar de proyecto (mejor que mostrar datos incorrectos)
- Todos los usuarios de prueba pueden ver y usar el selector

**Non-Goals:**
- Feedback visual de "cargando" durante el switch (no se implementó — ~500ms, aceptable)
- Persistencia del proyecto seleccionado entre sesiones
- Cambio de arquitectura del mecanismo de aislamiento por proyecto

## Decisions

### D1: Atomic swap — JWT primero, estado después

El estado de React es el "clock" del frontend. Si el JWT no está listo cuando el estado cambia, hay una ventana de tiempo donde el estado dice "proyecto B" pero el JWT dice "proyecto A". Al invertir el orden, esta ventana no existe.

**Alternativa descartada:** debounce o timeout antes de actualizar el estado — frágil y no garantiza orden.

### D2: Early return en catch — sin actualización de estado si el switch falla

Si `switch-project` falla (red, 401, 403), no actualizamos `currentProjectId`. El usuario se queda en el proyecto actual. Esto es correcto: es mejor no cambiar que mostrar un proyecto en la UI cuyo JWT no corresponde.

**Alternativa descartada:** revertir el estado después del fallo — requiere guardar el estado anterior y agrega complejidad.

### D3: Asignación de usuarios a proyecto 2 vía Prisma directo en VPS

La vista de Admin → Proyectos permite crear proyectos, pero el flujo de asignación de usuarios a proyectos requiere UI adicional no implementada. Para el ambiente de prueba, se inserta directamente en DB.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| ~500ms de delay antes de que la UI muestre el nuevo proyecto | Aceptable para MVP; se puede agregar spinner después |
| Si `switch-project` es lento, el dropdown se siente laggy | El selector cierra inmediatamente; la latencia no bloquea la UI |
| Usuarios asignados a todos los proyectos pueden ver datos cruzados | Para pruebas es intencional; en producción real se asignarán según rol/contrato |
