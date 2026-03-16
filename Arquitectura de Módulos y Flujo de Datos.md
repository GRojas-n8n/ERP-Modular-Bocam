# 🏢 Arquitectura de Módulos y Flujo de Datos (ERP Modular BOCAM)

> **Propiedad Intelectual:** Constructora Bocam, S. A. de C.V.
> **Arquitectura:** SaaS Multi-Tenant y Multi-Proyecto (Microservicios Orientados a Eventos).
> **Clasificación:** Estrictamente Confidencial - Uso Interno Exclusivo.

Este documento define la estructura departamental del ERP y el ciclo de vida de la información. Cada departamento opera como un **Módulo Independiente (Microservicio)**. Ningún módulo puede alterar la base de datos de otro; toda comunicación se realiza vía API (síncrona) o mediante el Bus de Eventos (asíncrona), respetando siempre el aislamiento por cliente (`tenant_id`) y centro de costos (`proyecto_id`).

---

## 📦 1. Definición de Módulos Departamentales

### 1.1 Módulo: Gerencia Técnica (Ingeniería y Presupuestos)
* **Responsabilidad:** Origen de los datos técnicos. Transforma los planos, ingenierías y licitaciones ganadas en datos estructurados y cuantificables.
* **Entidades Maestras (Dueño):** Catálogo Maestro de Insumos (Materiales, Mano de Obra, Equipo, Subcontratos) y Presupuesto Base.
* **Límite Arquitectónico:** No ejecuta compras ni autoriza pagos. Solo define "qué" se necesita y "cuánto" debería costar teóricamente un proyecto.

### 1.2 Módulo: Programación (Planeación Estratégica)
* **Responsabilidad:** Define el "cuándo" y el "dónde". Toma el presupuesto técnico y lo distribuye en el tiempo y el espacio físico de la obra.
* **Entidades Maestras (Dueño):** Estructura de Desglose de Trabajo (WBS / EDT) y Cronograma Base.
* **Eventos que Emite:** `WbsAprobado`, `CronogramaActualizado`.

### 1.3 Módulo: Control de Proyectos (Ejecución y Obra)
* **Responsabilidad:** Es el corazón operativo en sitio. Compara lo planeado contra lo real. Aquí operan los residentes y superintendentes.
* **Procesos Clave:** Captura de bitácoras, validación de avances físicos, control de calidad y generación técnica de Estimaciones de Facturación.
* **Eventos que Emite:** `AvanceFisicoRegistrado`, `EstimacionTecnicaValidada`.

### 1.4 Módulo: Procuración (Compras y Abastecimiento)
* **Responsabilidad:** Abastecer a la obra en tiempo y forma, garantizando que no se exceda el presupuesto asignado al centro de costos.
* **Procesos Clave:** Recepción de requisiciones de campo, cotizaciones, cuadro comparativo y emisión de Órdenes de Compra (OC).
* **Restricción Síncrona (API):** OBLIGATORIO consultar vía API al módulo de Finanzas la suficiencia presupuestal del `proyecto_id` ANTES de permitir la emisión de una OC.

### 1.5 Módulo: Recursos Humanos (Talento y Seguridad)
* **Responsabilidad:** Gestión integral del personal, conformación de cuadrillas y cumplimiento normativo-laboral.
* **Procesos Clave:** Asignación de trabajadores a un centro de costos (`proyecto_id`), control de asistencia (Qronos Pro), cálculo de pre-nómina y validación de certificaciones de seguridad (DC-3, EPP).
* **Eventos que Emite:** `PreNominaAutorizada`, `PersonalAsignadoFrente`.

### 1.6 Módulo: Finanzas (Tesorería y Flujo de Caja)
* **Responsabilidad:** Custodia del capital. Aprueba la viabilidad financiera de los compromisos y ejecuta los pagos.
* **Entidades Maestras (Dueño):** Catálogo de Proveedores/Subcontratistas (Estatus de *Compliance* y validación fiscal).
* **Procesos Clave:** Bloqueo o liberación de fondos, control de suficiencia presupuestal y programación de pagos de estimaciones y nóminas.

### 1.7 Módulo: Contabilidad (Registro y Fiscal)
* **Responsabilidad:** Cumplimiento normativo, cálculo de impuestos y generación de estados financieros (Pólizas).
* **Límite Arquitectónico:** Es un módulo netamente "Consumidor". No crea operaciones de obra ni compras; "escucha" los eventos de Compras, Finanzas y Control de Proyectos para traducirlos automáticamente a lenguaje contable y asociarlos a los CFDI.

---



## 🔄 2. Flujo de Información (El Ciclo de Vida del Proyecto)

Para garantizar un rendimiento extremo y evitar dependencias rígidas, el sistema fluye de la siguiente manera:

### Fase 1: Génesis y Presupuestación
1. **Creación:** La Dirección da de alta un nuevo centro de costos. El sistema central genera un `proyecto_id` global para el `tenant_id` correspondiente.
2. **Estructura:** **Gerencia Técnica** carga el catálogo de conceptos. Al finalizar, emite el evento `PresupuestoBaseLiberado`.
3. **Planeación:** El módulo de **Programación** escucha el evento, absorbe los conceptos y genera el árbol jerárquico (WBS). Emite el evento `WbsAprobado`.

### Fase 2: Ejecución y Abastecimiento (El Bucle Opertivo)
1. **Requisición:** El Residente (desde **Control de Proyectos**) genera una "Requisición de Materiales" apuntando a una partida del WBS.
2. **Validación de Fondos:** El módulo de **Procuración** procesa la requisición. Al intentar convertirla en Orden de Compra, realiza una petición OData/REST a **Finanzas**: `GET /api/finanzas/presupuesto?proyecto_id=X&wbs_id=Y`.
3. **Compromiso:** Si Finanzas confirma los fondos, Procuración emite la OC y publica el evento `OrdenCompraEmitida`.
4. **Impacto:** **Contabilidad** escucha el evento y registra un pasivo proyectado. **Finanzas** congela temporalmente ese monto del presupuesto disponible.

### Fase 3: Estimaciones, Pago y Cierre Contable
1. **Avance:** El Residente registra el avance físico. El Superintendente en **Control de Proyectos** valida la calidad y genera una "Estimación".
2. **Aprobación Técnica:** Al autorizarse en campo, se emite el evento `EstimacionAprobada`.
3. **Flujo de Caja:** **Finanzas** recibe este evento en su bandeja de entrada, programa la fecha de pago según el flujo de caja del `proyecto_id` y ejecuta la transferencia. Emite el evento `PagoRealizado`.
4. **Cierre:** **Contabilidad** recibe el evento de pago, solicita el CFDI (vía integración SAT externa si aplica) y concilia la póliza de egreso automáticamente.

---

### ⚠️ Reglas Finales de Interoperabilidad para Desarrolladores
* **Contexto Inquebrantable:** Todo evento asíncrono que viaje por RabbitMQ/Redis y toda petición HTTP entre módulos **DEBE** incluir en su payload el `tenant_id` y el `proyecto_id`. 
* **Tolerancia a Fallos:** Si el módulo de *Contabilidad* está en mantenimiento, el módulo de *Procuración* debe poder seguir emitiendo Órdenes de Compra. Contabilidad procesará los eventos acumulados en la cola de mensajes en cuanto vuelva a estar en línea.