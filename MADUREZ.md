# Madurez verificable por módulo

Fuente oficial del avance físico del informe semanal. Se actualiza al cerrar cada sesión de trabajo, igual que los registros de decisión.

**Alcance**: `Original` (los 10 módulos del alcance reportado inicialmente) o `Incorporado` (módulos agregados al seguimiento el 27 de octubre de 2026).

**Construido %**: parte del alcance planeado del módulo que ya está construida (la define el Lead Software Architect). El promedio de esta columna es el avance de construcción del ERP.

**Madurez verificable**: criterios de 20 puntos cada uno:

- **C1** Código construido y funcionando
- **C2** Datos y permisos bien estructurados (modelo, migraciones, RLS, RBAC)
- **C3** Pruebas automáticas propias del módulo
- **C4** Integración probada con otros módulos
- **C5** Aceptación formal del negocio (usuario responsable firma el cierre)

Valores: `✓` completo, `½` parcial, vacío = no cumple. Cambia un criterio solo con evidencia (PR, prueba o acta) y anótala en la columna Evidencia.

| Módulo | Alcance | Construido % | C1 | C2 | C3 | C4 | C5 | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Compras | Original | 75 | ✓ | ✓ | ✓ | ½ |  | PR #169, #185, #186; integración parcial mientras falte el 25% del alcance |
| Finanzas | Original | 100 | ✓ | ✓ | ✓ | ✓ |  | PR #185, #186; pruebas de concurrencia, RLS y migración |
| Almacén | Incorporado | 50 | ✓ | ✓ | ½ |  |  | Recepción de OC integrada (PR #169); faltan funciones del alcance |
| Autenticación | Original | 100 | ✓ | ✓ | ✓ | ½ |  | Prisma, migraciones y pruebas |
| App Shell (portal) | Original | 85 | ✓ | ✓ | ✓ |  |  | Build, lint, pruebas, E2E y smoke |
| Seguridad | Original | 60 | ✓ | ✓ | ½ |  |  | Cobertura de RBAC |
| Control de Proyectos | Original | 60 | ✓ | ✓ | ½ | ½ |  | Avances, estimaciones, EVM; PR #198 y #203 con pruebas finanzas.cobro-registrado y finanzas.nomina-pagada |
| Gerencia Técnica | Original | 85 | ✓ | ✓ | ½ |  |  | Presupuestos y APU; PR pendientes |
| Ventas | Original | 50 | ✓ | ✓ | ½ |  |  | Clientes y migraciones |
| Contabilidad | Original | 100 | ✓ | ✓ | ✓ | ½ |  | Integraciones con Compras, Finanzas, SAT; 23 pruebas de integración; PR #200 (pólizas egreso/cobro, F27) y #207 (despliegue) |
| Personal | Original | 85 | ✓ | ✓ | ½ | ½ |  | Configuración de personal y nómina; PR #202; pruebas finanzas.nomina-pagada y rol-personal-rh-autorizar-pagar-nomina; 3 de 30 fallan |
| Calidad | Incorporado | 30 | ✓ | ½ |  |  |  | Servicio y modelo presentes |
| Residencia | Incorporado | 70 | ✓ | ½ |  |  |  | Módulo compuesto; revisión JR-01 |
| Asistente | Incorporado | 30 | ✓ |  |  |  |  | Servicio compilable |
| Reportes | Incorporado | 30 | ✓ |  |  |  |  | Servicio compilable |
