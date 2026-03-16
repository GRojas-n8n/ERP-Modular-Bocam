5. Diccionario de Entidades Globales (Master Data Management - MDM)
5.1 Propósito y Fuente Única de Verdad (SSOT)
El núcleo de la arquitectura distribuida es el patrón de Single Source of Truth (SSOT), operando bajo un entorno SaaS de estricto aislamiento. Las entidades definidas en este diccionario representan datos maestros. Cada entidad tiene un único "Módulo Propietario" responsable de su creación y actualización.

Para garantizar la seguridad Multi-Tenant y Multi-Proyecto, el resto de los módulos actuarán como "Módulos Consumidores", almacenando únicamente el UUID de referencia y suscribiéndose a eventos de actualización, respetando siempre los filtros de seguridad de cliente y sucursal.

5.2 El Mandamiento de la Doble Jerarquía (SaaS & Centro de Costos)
Antes de definir las entidades, se establece la regla universal de bases de datos para todo el ecosistema BOCAM:

Aislamiento de Cliente (tenant_id): TODA tabla en la base de datos (maestra o transaccional) debe contener un campo tenant_id (UUID) para segregar la información por constructora.

Aislamiento de Centro de Costos (proyecto_id): TODA tabla transaccional (ej. requisiciones, estimaciones, avances físicos) debe contener obligatoriamente el campo proyecto_id (UUID), que fungirá como la clave única de la sucursal o centro de costos al que pertenece el movimiento.

5.3 Entidades Core y Estructura de Datos
Entidad 1: Proyecto (Centro de Costos / Sucursal Maestra)
Eje central operativo y financiero. Ya no es solo un contrato; es el contenedor que aísla los costos, el personal y las compras de una ubicación o frente de trabajo específico.

Módulo Propietario: Administración de Contratos / Licitaciones.

Atributos Globales Mínimos:

id_proyecto (UUID - Llave Primaria)

tenant_id (UUID - Llave de Aislamiento de Cliente)

codigo_centro_costos (String - Ej. CC-2026-GUA-01)

nombre_oficial (String)

tipo_contrato (Enum: Precios Unitarios, Precio Alzado, EPC, Mixto)

moneda_base (String - ISO 4217, ej. MXN, USD)

estatus_global (Enum: Licitación, Adjudicado, Construcción, Cierre Técnico, Cierre Financiero)

Entidad 2: Usuario_Identidad (Colaborador / Aprobador)
Controla quién hace qué, asegurando que un residente solo pueda ver y modificar la información de la obra a la que fue asignado.

Módulo Propietario: IAM (Identity and Access Management) / SSO.

Atributos Globales Mínimos:

id_usuario (UUID - Llave Primaria)

tenant_id (UUID - Llave de Aislamiento de Cliente)

correo_corporativo (String - Unique)

rol_global (Array/Enum: Superintendente, Planeador, Residente)

proyectos_autorizados (Array de UUIDs - Lista de proyecto_id a los que el usuario tiene acceso explícito. CRÍTICO para el RBAC Multi-Sucursal).

limite_aprobacion_financiera (Decimal)

Entidad 3: Tercero (Directorio de Socios de Negocio)
Unificación de la cadena de suministro. Previene la duplicidad y asegura el cumplimiento normativo dentro de un mismo Tenant.

Módulo Propietario: Finanzas / Compliance.

Atributos Globales Mínimos:

id_tercero (UUID - Llave Primaria)

tenant_id (UUID - Llave de Aislamiento de Cliente)

rfc_tax_id (String - Unique por Tenant)

razon_social (String)

tipo_tercero (Array/Enum: Cliente, Proveedor, Subcontratista)

compliance_status (Enum: Aprobado, Pendiente, Vetado)

Entidad 4: WBS_EDT (Estructura de Desglose de Trabajo)
La columna vertebral para el seguimiento técnico-económico. Conecta la ingeniería con el presupuesto exacto de una sucursal.

Módulo Propietario: Planeación / Control de Obra.

Atributos Globales Mínimos:

id_wbs (UUID - Llave Primaria)

tenant_id (UUID - Llave de Aislamiento de Cliente)

proyecto_id (UUID - Referencia OBLIGATORIA al Centro de Costos)

codigo_wbs_kks (String - Código de identificación industrial)

descripcion (String)

Entidad 5: Insumo_Catalogo (Catálogo Maestro de Recursos)
Diccionario universal que estandariza lo que se presupuesta y compra en esa constructora.

Módulo Propietario: Ingeniería de Costos.

Atributos Globales Mínimos:

id_insumo (UUID - Llave Primaria)

tenant_id (UUID - Llave de Aislamiento de Cliente)

clave_insumo (String - Ej. TUB-AC-001)

clase_recurso (Enum: Material, Mano de Obra, Equipo, Subcontrato)

unidad_medida (String)

5.4 Protocolo de Sincronización Sensible al Contexto (Event Sourcing)
Para mantener la autonomía, cuando un módulo publique un evento, el payload DEBE incluir obligatoriamente el contexto de seguridad para que los módulos consumidores sepan a qué cliente y sucursal pertenece la acción.

Evento: OrdenCompraAprobada

Payload Mínimo Requerido: { "evento_id": "...", "tenant_id": "UUID-Cliente", "proyecto_id": "UUID-Sucursal", "id_orden": "...", "monto": 50000, "timestamp": "2026-02-26T14:00:00Z" }

Reacción: El módulo de Finanzas recibe el evento, verifica el tenant_id y el proyecto_id para afectar el flujo de caja exclusivo de ese centro de costos, ignorando cualquier evento que no coincida con su entorno seguro.