## 1. Auditoría y matriz de alcance

- [x] 1.1 Inventariar todas las rutas y vistas que consumen datos de proyecto (`scope-matrix.md`).
- [x] 1.2 Clasificar cada servicio/vista como `project-scoped`, `tenant-scoped`, mixto o catálogo compartido y justificar las excepciones globales.
- [x] 1.3 Buscar filtros opcionales que se amplían cuando `proyectoId` falta y registrar cada hallazgo antes de modificar código.

## 2. Tests primero

- [x] 2.1 Agregar tests del guard project-scoped para roles de proyecto y de tenant, con `proyectoId` vacío y válido. Rojo confirmado: falta `requireActiveProject()`.
- [x] 2.2 Reproducir en integración que `GET /gerencia-tecnica/presupuestos` devuelve datos del tenant con `proyecto_id: ""`. Rojo confirmado: responde `200` en vez de `403`.
- [x] 2.3 Agregar aislamiento A/B y prueba de que el caso sin proyecto no ejecuta una consulta global. El caso con proyecto A pasa y excluye B; el caso vacío falla como se esperaba.
- [x] 2.4 Agregar prueba de `InsumosView`: sin proyecto no solicita datos y no muestra acciones mutantes. Rojo confirmado: hoy llama `/presupuestos` y `/dashboard`.
- [x] 2.5 Preservar regresiones para capacidades globales documentadas: el test nuevo confirma que `requireProjectAccess()` sigue permitiendo `finanzas` sin proyecto; se reutilizan las suites RLS y de aislamiento enumeradas en `scope-matrix.md`.

### Evidencia del baseline rojo

- `npm test -w @bocam/auth-middleware`: 10 pasan, 3 fallan únicamente por el guard aún inexistente; la regresión tenant-level pasa.
- `npm exec vitest run src/views/InsumosView.sin-proyecto.test.tsx`: 1 falla; registra las dos llamadas indebidas actuales.
- `npm run test:integration:presupuestos-requieren-proyecto -w @bocam/gerencia-tecnica`: aislamiento A/B válido pasa; sesión `admin` sin proyecto falla con `200 !== 403`.
- Esta evidencia es intencionalmente roja y no se convierte en gate de CI hasta completar la sección 3.

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
