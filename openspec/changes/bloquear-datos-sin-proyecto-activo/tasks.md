## 1. Auditoría y matriz de alcance

- [ ] 1.1 Inventariar todas las rutas y vistas que consumen datos de proyecto.
- [ ] 1.2 Clasificar cada ruta como `project-scoped`, `tenant-scoped` o catálogo compartido y justificar las excepciones globales.
- [ ] 1.3 Buscar filtros opcionales que se amplían cuando `proyectoId` falta y registrar cada hallazgo antes de modificar código.

## 2. Tests primero

- [ ] 2.1 Agregar tests del guard project-scoped para roles de proyecto y de tenant, con `proyectoId` vacío, autorizado y no autorizado.
- [ ] 2.2 Reproducir en integración que `GET /gerencia-tecnica/presupuestos` devuelve datos del tenant con `proyecto_id: ""`; confirmar rojo antes del fix.
- [ ] 2.3 Agregar aislamiento A/B y prueba de que el caso sin proyecto no ejecuta una consulta global.
- [ ] 2.4 Agregar prueba de `InsumosView`: sin proyecto no solicita presupuestos, limpia estado anterior y no muestra acciones mutantes.
- [ ] 2.5 Agregar regresiones para capacidades globales documentadas de Finanzas, Contabilidad y Personal.

## 3. Implementación

- [ ] 3.1 Implementar el guard reutilizable de proyecto obligatorio sin alterar el contrato de `requireProjectAccess()` para rutas tenant-level.
- [ ] 3.2 Aplicar el guard y el filtro obligatorio a todas las rutas project-scoped confirmadas de Gerencia Técnica.
- [ ] 3.3 Corregir `InsumosView` y las demás vistas project-scoped afectadas con estado seguro y limpieza de datos.
- [ ] 3.4 Corregir los hallazgos equivalentes de otros módulos según la matriz aprobada.

## 4. Validación

- [ ] 4.1 Ejecutar suites unitarias, integración, aislamiento RLS con rol sin `BYPASSRLS`, typecheck y build.
- [ ] 4.2 Validar OpenSpec en modo estricto y revisar que no se alteren contratos globales intencionales.
- [ ] 4.3 Ensayar con una cuenta sin proyectos y otra con dos proyectos en un entorno no productivo.
- [ ] 4.4 Desplegar por el flujo normal, verificar logs y repetir smoke autenticado de solo lectura en producción.

## 5. Cierre

- [ ] 5.1 Reanudar la tarea 6.5 de `purga-proyectos-demo-produccion` solo cuando ningún módulo project-scoped exponga datos sin proyecto.
- [ ] 5.2 Archivar este change tras evidencia de producción y actualizar la especificación canónica.
