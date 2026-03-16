Documento Maestro: Matriz de Autorizaciones (RBAC)
Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
Arquitectura: SaaS Multi-Tenant y Multi-Proyecto (Multi-Sucursal).
Clasificación: Estrictamente Confidencial - Uso Interno Exclusivo.

6. Flujo de Autorizaciones y Gestión de Identidad (RBAC) 

6.1 Principio de Privilegio Mínimo y Trazabilidad Contextual 
El ecosistema operará bajo el principio de Privilegio Mínimo: ningún usuario tendrá acceso a un módulo o función que no sea estrictamente necesaria para su rol operativo, y estará estrictamente limitado a los centros de costos (proyecto_id) a los que haya sido asignado.
Además, toda acción de escritura, actualización, aprobación o eliminación dejará un rastro inmutable de auditoría (created_by, approved_by, timestamp, tenant_id, proyecto_id) en la base de datos del módulo correspondiente, garantizando una trazabilidad perfecta por sucursal.

6.2 Definición de Roles Estructurales y Alcance Multi-Proyecto 
Para cubrir el ciclo de vida técnico-económico de los proyectos, se definen los siguientes roles base. Cada rol tiene un nivel jerárquico de permisos granulares por módulo y un Alcance Espacial (qué proyectos puede ver):

Dirección / Superintendencia (Nivel Ejecutivo)
- Perfil: Responsable global del contrato y la rentabilidad.
- Alcance Visual: Nivel Tenant (Acceso a todos los proyectos y centros de costos de la constructora).
- Permisos Base: Acceso de lectura global a tableros (Dashboards) de todos los módulos. Capacidad de autorizar bloqueos, liberar fondos extraordinarios y aprobar el cierre técnico/financiero del proyecto.

Control de Proyectos / Obra (Nivel Estratégico-Técnico)
- Perfil: Dueño de la planeación, el seguimiento físico-financiero y la facturación.
- Alcance Visual: Nivel Proyecto(s) (Solo puede ver y operar en los centros de costos que se le hayan asignado explícitamente).
- Permisos Base: Creación y edición del WBS, carga de catálogos de conceptos, validación de avances físicos, y generación/aprobación técnica de estimaciones de facturación exclusivamente para sus obras asignadas. No tiene permisos para ejecutar pagos ni emitir órdenes de compra.

Procura y Compras (Nivel Abastecimiento)
- Perfil: Responsable de la cadena de suministro.
- Alcance Visual: Nivel Tenant (Consolida compras globales, pero etiqueta cada compra a un proyecto_id específico).
- Permisos Base: Creación de requisiciones, emisión de Órdenes de Compra (OC), alta preliminar de proveedores. Sus acciones de compra están condicionadas por sistema a la validación de suficiencia presupuestal del módulo de Finanzas del centro de costos destino.

Finanzas y Administración (Nivel Financiero)
- Perfil: Custodio del flujo de caja y la facturación fiscal.
- Alcance Visual: Nivel Tenant (Control global de cuentas bancarias y presupuestos corporativos).
- Permisos Base: Aprobación definitiva de proveedores (Compliance), validación de suficiencia presupuestal, programación de pagos de estimaciones aprobadas y conciliación bancaria. No tiene permisos para modificar volúmenes de obra o conceptos técnicos.

Residente de Frente / Calidad (Nivel Operativo de Campo)
- Perfil: Ejecutor en sitio.
- Alcance Visual: Estricto Nivel Sucursal (Solo tiene acceso al proyecto_id físico en el que está parado).
- Permisos Base: Captura exclusiva de avances físicos diarios/semanales, reportes de no conformidad (Calidad) y bitácoras. Su información entra en estatus "Por Validar" y no afecta el ámbito financiero hasta que Control de Obra lo aprueba.

6.3 Matriz de Permisos Intermodulares (Ejemplo Operativo) 
Para visualizar cómo interactúan los roles en los distintos módulos, se establece la siguiente matriz de permisos (C=Crear, L=Leer, A=Actualizar/Aprobar, E=Eliminar), sujeta siempre a que el usuario posea el proyecto_id correspondiente en su token:

Rol                 | Alcance de Datos | Mód: Licitaciones | Mód: Control Obra      | Mód: Compras          | Mód: Finanzas
-----------------------------------------------------------------------------------------------------------------------------------------
Superintendencia    | Todo el Tenant   | L, A (Fallo)      | L, A (Cierre)          | L, A (OC Mayor)       | L, A (Flujo Caja)
Control de Obra     | Solo sus Obras   | L                 | C, L, A (Estimaciones) | L (Solo lectura OC)   | Sin Acceso
Procura             | Todo el Tenant   | L                 | L (Catálogo Insumos)   | C, L, A, E            | L (Estatus de Pago)
Finanzas            | Todo el Tenant   | Sin Acceso        | L (Est. Autorizadas)   | L, A (Autoriza OC)    | C, L, A
Residente           | Única Obra Asig. | Sin Acceso        | C (Avance Físico), L   | C (Req. Material)     | Sin Acceso

6.4 Flujos de Aprobación Jerárquica y Presupuestal (Límites de Autoridad) 
El RBAC de este ecosistema no solo evalúa el rol, sino el Límite de Autoridad Financiera cruzado contra el presupuesto del Centro de Costos. Los módulos de Compras y Control de Obra implementarán bloqueos automáticos basados en montos:

- Ejemplo en Control de Obra: Si una estimación de facturación excede el presupuesto base planificado (sobrecosto o volumen extraordinario) para un proyecto_id específico, el sistema bloquea la aprobación del rol Control de Obra y escala automáticamente la solicitud al rol Superintendencia para su liberación mediante firma electrónica o token de aprobación.
- Ejemplo en Compras: Un comprador puede emitir Órdenes de Compra hasta por $50,000 MXN (si hay presupuesto para ese centro de costos). Si la OC es de $250,000 MXN, el módulo la retiene en estatus "Pendiente de Aprobación Gerencial".