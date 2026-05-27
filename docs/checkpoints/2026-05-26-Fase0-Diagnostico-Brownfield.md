# Fase 0 — Diagnóstico Brownfield: ERP Modular BOCAM / iretum.com

**Fecha:** 2026-05-26  
**Clasificación:** Confidencial  
**Tipo:** Auditoría SDD — Estado del sistema antes de adopción de SDD completo  
**Veredicto:** 🟡 AMARILLO — Arquitectura sólida, 3 condiciones bloqueantes antes de nómina real

---

## Parte 1: Specs Descriptivas por Módulo

### 🔐 Módulo AUTH (Puerto 3003)

**Rol:** Proveedor de identidad central (IAM). Única fuente de verdad de usuarios, tenants y permisos.

**Qué hace:** Emite, valida y rota JWT de corta vida (15 min) + refresh tokens de larga vida (7 días). Gestiona la jerarquía Tenant → Proyecto → Usuario.

**Endpoints:**

| Endpoint | Datos que acepta |
|---|---|
| `POST /login` | email, password, tenant_id, proyecto_id? |
| `POST /register` | email, password, nombre, tenant_id, roles[], proyecto_ids[] |
| `POST /refresh` | refresh_token (UUID crudo) |
| `POST /switch-project` | proyecto_id (del JWT actual) |

**Salidas:**
- Access token JWT con claims: `sub`, `tenant_id`, `proyecto_id`, `roles[]`, `projects[]`, `limite_aprobacion`
- Refresh token (UUID, almacenado hasheado SHA-256 en BD)
- Objeto `user` con tenant `logo_url` y `primary_color` para white-label del frontend

**Casos especiales críticos:**
- **Tenant inactivo:** Devuelve `403 AUTH_TENANT_INACTIVE` antes de comparar password — evita timing attacks.
- **Refresh token rotation:** Al usar un refresh token, se revoca inmediatamente y se emite uno nuevo. Un token usado dos veces produce `401`.
- **MASTER_SECRET:** Existe endpoint superadmin (`/api/v1/master/tenants`) protegido por un secreto diferente al JWT, para provisionar nuevos tenants sin estar dentro de ninguno.
- **`.trim()` en JWT_SECRET:** Workaround documentado para evitar que Docker Compose inyecte `\n` al final del secreto, rompiendo la validación silenciosamente.
- **Roles globales vs. por proyecto:** Un `superintendent` tiene acceso a todos los proyectos del tenant; un `resident` solo a los `proyecto_id` explícitamente listados en su token.

---

### 💰 Módulo FINANZAS (Puerto 3004)

**Rol:** Custodio del capital. Árbitro de suficiencia presupuestal. Módulo que "bloquea" sobrecostos.

**Qué hace:** Mantiene presupuestos por proyecto/capítulo, gestiona compromisos de fondos (cuando se emite una OC), ejecuta pagos programados y expone un dashboard de flujo de caja.

**Operaciones:**

| Operación | Datos que acepta |
|---|---|
| Consulta suficiencia | monto, proyecto_id (del JWT) |
| Comprometer fondos | presupuesto_id, monto, oc_id, oc_codigo, concepto |
| Liberar fondos | presupuesto_id, monto, oc_id |
| Registrar pago | presupuesto_id, beneficiario_id, monto, fecha_programada, metodo_pago |
| Evento `control_obra.estimacion_aprobada` | Genera pago programado automáticamente |

**Salidas:**
- `{ tiene_suficiencia: bool, monto_disponible: number }` — respuesta síncrona para Compras
- Eventos: `finanzas.fondos_comprometidos`, `finanzas.fondos_liberados`, `finanzas.presupuesto_insuficiente`, `finanzas.pago_registrado`

**Casos especiales críticos:**
- **Idempotencia en comprometer-fondos:** Si Compras reintenta la misma OC, Finanzas devuelve 200 sin duplicar el compromiso (usa `external_event_key`).
- **Transferencias presupuestales:** Mueve saldo entre partidas en una transacción atómica — si una partida no tiene saldo suficiente, falla completo (no partial commit).
- **Límites de autoridad:** La aprobación de pagos `>X MXN` requiere `rol = superintendent` — el módulo valida `limite_aprobacion` del token antes de permitir `PATCH /pagos/:id/pagar`.

---

### 🛒 Módulo COMPRAS (Puerto 3002)

**Rol:** Cadena de suministro. Ejecuta el flujo Requisición → Cotización → OC, con validación financiera obligatoria.

**Flujo crítico:** el comprador elige ganador en cuadro comparativo → consulta suficiencia a Finanzas → si hay fondos, crea OC y compromete fondos en secuencia de dos fases.

**Entradas:**
- Requisiciones con ítems (`insumo_id`, `cantidad`), donde `insumo_id` referencia al catálogo de Gerencia Técnica
- Cuadros comparativos con detalle por proveedor/insumo (`precio_ofertado`, `es_ganador`)
- Para convertir a OC: `presupuesto_id` (partida de Finanzas a afectar) — **campo obligatorio**

**Salidas:**
- OCs con estados: `PENDIENTE_CONFIRMACION_FINANZAS` → `EMITIDA` o `ERROR_FINANZAS`
- Eventos: `compras.oc_creada`, `compras.oc_cancelada`

**Casos especiales críticos:**
- **Saga distribuida OC:** Si el servidor cae entre crear OC local y comprometer fondos en Finanzas, la OC queda en `ERROR_FINANZAS`. Endpoint `/reconciliar-finanzas` resuelve manualmente.
- **Cancelación pendiente:** Al cancelar una OC con `presupuesto_id`, pasa a `CANCELACION_PENDIENTE` → llama a Finanzas para liberar fondos → pasa a `CANCELADA`. Si Finanzas no responde, queda pendiente para reconciliación.
- **IVA hardcodeado al 16%:** `montoTotal = subtotal * 1.16` — sin configurabilidad por tenant aún.
- **Stock mínimo:** Al listar inventario calcula `AGOTADO`, `BAJO` u `OK` comparando `stock_actual` vs `stock_minimo`.

---

### 🏗️ Módulo CONTROL DE OBRA (Puerto 3005)

**Rol:** Corazón operativo en campo. Registra la realidad física del avance y genera estimaciones de facturación.

**Qué hace:** Captura bitácoras diarias, registra avances físicos por concepto presupuestario y genera estimaciones periódicas que, al aprobarse, disparan el pago automático vía evento a Finanzas.

**Entidades:**
- **Bitácoras:** fecha, frente_trabajo, turno, clima, actividades_realizadas, personal_en_sitio
- **Avances:** concepto_presupuesto, cantidad_periodo, precio_unitario, referencia a estimacion_id
- **Estimaciones:** agrupan avances de un periodo con cálculo de retenciones y amortización de anticipos

**Flujo de estados de estimación:** `BORRADOR → EN_REVISION → APROBADA_TECNICA → APROBADA_FINANCIERA → FACTURADA`

**Casos especiales críticos:**
- **Doble aprobación:** Una estimación requiere aprobación técnica (residente/superintendente) Y aprobación financiera. Sin la segunda, el pago no se programa.
- **Retenciones:** `retencion_fondo_garantia` y `amortizacion_anticipo` son campos separados, pero la lógica de cálculo es manual (no hay motor automático).
- **cantidad_anterior vs cantidad_acumulada:** El avance lleva historial acumulado para detectar duplicidad. Si un residente duplica un avance, el acumulado excede el presupuestado — debe bloquearse.

---

### 👷 Módulo PERSONAL / RRHH (Puerto 3006)

**Rol:** Gestión del capital humano. Conecta empleados con frentes de trabajo y genera la pre-nómina.

**Qué hace:** Mantiene fichas de empleados con datos fiscales (RFC, CURP, NSS), los agrupa en cuadrillas, los asigna a frentes de trabajo y calcula la pre-nómina semanal/quincenal.

**Datos principales:**
- Fichas de empleado: `nss`, `rfc`, `curp`, `salario_diario`, `salario_integrado`, `categoria`
- Asignaciones: empleado → cuadrilla → frente de trabajo → turno → `proyecto_id`
- Pre-nómina: periodo de cálculo, empleados del proyecto

**Casos especiales críticos:**
- **⚠️ Motor de cálculo IMSS/ISR ausente:** El schema tiene `deduccion_imss`, `deduccion_isr`, `otras_deducciones`, pero los valores se pasan directamente desde `req.body` sin cálculo. **Gap más grande del módulo — bloquea uso con nómina real.**
- **Certificaciones como JSON:** El campo `certificaciones` del empleado es un blob JSON sin estructura validada — riesgo de inconsistencia al consultar desde Seguridad.
- **`salario_integrado ≠ salario_diario`:** El sistema tiene ambos campos pero no calcula el factor de integración automáticamente.

---

### 🛡️ Módulo SEGURIDAD / HSE (Puerto 3007)

**Rol:** Cumplimiento normativo en campo. Controla certificaciones vigentes y permisos de trabajo de alto riesgo.

**Entidades:**
- Incidentes: tipo, severidad, ubicacion, descripcion, empleado_afectado_id
- Inspecciones: tipo_inspeccion, items_revisados/conformes/no_conformes → calcula `porcentaje_cumplimiento`
- Permisos de trabajo: tipo_permiso (`ALTURAS`, `ESPACIO_CONFINADO`, `TRABAJO_CALIENTE`, etc.), epp_requerido, medidas_control
- Capacitaciones: titulo, tipo (`DC3`, `INDUCCION`, `PLATICA_5MIN`), asistentes con calificación
- EPP: empleado_id, tipo_epp, fecha_entrega, fecha_vencimiento

**Salidas:**
- Dashboard HSE: días sin accidente, tasa de cumplimiento de inspecciones, incidentes por tipo
- Eventos: `seguridad.incidente_reportado`, `seguridad.incidente_cerrado`, `seguridad.capacitacion_completada`, `seguridad.permiso_trabajo_emitido/cerrado`

**Casos especiales críticos:**
- **`porcentaje_cumplimiento` automático:** Se calcula al crear la inspección como `(items_conformes / items_revisados) * 100`. Deriva: ≥90% = `APROBADA`, ≥70% = `OBSERVACIONES`, <70% = `NO_APROBADA`.
- **Degradación silenciosa del EventBus:** Todos los `eventBus.publish()` tienen `catch (_) {}` silencioso. Si RabbitMQ cae, los incidentes se guardan pero los eventos se pierden sin alerta. En el contexto de un accidente reportable al STPS, esta pérdida tiene consecuencias legales.

---

### 📊 Módulo CONTABILIDAD (Puerto 3008)

**Rol:** Módulo puramente consumidor. Traduce eventos de negocio a lenguaje contable y coordina la conciliación CFDI/SAT y bancaria.

**Qué hace:** Escucha eventos de Finanzas (`pago_registrado`) y genera asientos contables automáticamente. Gestiona el ciclo de vida de un CFDI: solicita validación al SAT vía adaptador PAC externo.

**Entradas:**
- Evento `finanzas.pago_registrado` (genera asiento automático)
- Archivos bancarios (SPEI/ACH en formato CSV/TXT del banco)
- Callbacks del servicio PAC con resultado de timbrado

**Casos especiales críticos:**
- **`external_event_key` para idempotencia:** Cada asiento tiene una clave compuesta única para detectar reintentos del evento y no duplicar la póliza.
- **Dead Letter Queue (DLQ) para SAT:** Si el SAT no responde después de N reintentos (`sat_retry_count`), el registro pasa a `sat_dlq_at` para revisión manual.
- **Dependencia de adaptador PAC externo:** La integración SAT requiere `profile: sat` en Docker Compose. Sin él, `cfdi_status` permanece en `PENDIENTE` indefinidamente.

---

### 🏢 Módulo GERENCIA TÉCNICA (Puerto 3001)

**Rol:** Origen de todos los datos técnicos. Define el catálogo de insumos y el presupuesto base del proyecto.

**Entidades:**
- Insumos: `clave`, `descripcion`, `unidad_medida`, `tipo_insumo`, `costo_base`
- Presupuesto base: `proyecto_id`, `version`, conceptos con `clave`, `cantidad`, `precio_unitario`

**Casos especiales críticos:**
- **Sin control de versiones real:** El schema tiene campo `version` en `PresupuestoBase`, pero no hay lógica de "congelar versión anterior al liberar una nueva". Una versión sobreescrita se pierde.
- **Acoplamiento implícito con Compras:** Los `insumo_id` en Compras son UUIDs que apuntan a este módulo. Si se elimina un insumo, las requisiciones existentes quedan con referencias huérfanas sin validación.

---

### 📈 Módulo VENTAS (Puerto 3012)

**Rol:** Gestión comercial. Registra clientes, cotizaciones y facturas de venta.

**Estado:** Skeleton funcional — schema y endpoints CRUD básicos sin lógica de negocio, sin integración con Control de Obra para cotizar por concepto de obra, ni conexión con Contabilidad para timbrar.

**Entidades:**
- Clientes con RFC/razón social y estatus (`ACTIVO`/`INACTIVO`/`BLOQUEADO`)
- Cotizaciones: vigencia, estado (`BORRADOR`→`ENVIADA`→`ACEPTADA`/`RECHAZADA`)
- Facturas: vinculadas a cotización, con estado de timbrado

---

## Parte 2: Auditoría SDD y Viabilidad del MVP

### 🧪 Cobertura de Tests

| Módulo | Tests | Tipo | Cobertura estimada |
|---|---|---|---|
| Auth | login-policy.test.ts | Unit | ~40% |
| Finanzas | 8 archivos (compras.events, control-obra, E2E idempotencia, seguridad) | Integration + E2E | ~70% |
| Contabilidad | 12 archivos (CFDI, SAT, bancario, transferencias) | Integration | ~65% |
| Compras | finanzas.feedback.integration.test.ts + E2E reconciliación | Integration | ~30% |
| Control-obra | finanzas.pago-registrado.integration.test.ts + E2E | Integration | ~25% |
| Personal | ❌ Ninguno | — | 0% |
| Gerencia Técnica | ❌ Ninguno | — | 0% |
| Seguridad | ❌ Ninguno | — | 0% |
| Ventas | ❌ Ninguno | — | 0% |
| Packages compartidos | Implícitos en tests de módulos | — | ~50% |

**Observación crítica:** Los tests de integración validan principalmente el contrato entre Finanzas y Compras/Control-Obra (flujos de dinero). Los módulos operativos (Personal, Seguridad) no tienen ningún test.

### 💣 Deuda Técnica Crítica — Top 5 Zonas de Riesgo

**🔴 Riesgo 1: `apps/personal/src/main.ts` — Motor de nómina ausente**

El schema tiene `deduccion_imss`, `deduccion_isr`, `otras_deducciones`, pero en el código estos valores se pasan directamente desde `req.body` sin ningún cálculo. Si un operador ingresa una nómina real puede capturar $0 de ISR o IMSS y el sistema lo guarda sin protesta. Al autorizar, Finanzas programará un pago con montos incorrectos que generarán problemas fiscales con el SAT.

**🟠 Riesgo 2: Saga distribuida de 2 fases en Compras sin compensación completa**

El flujo `verificar-suficiencia → crear-OC-local → comprometer-fondos-en-finanzas` tiene una ventana de inconsistencia entre el paso 2 y el 3. Con volumen de OCs real (50+/día), habrá inconsistencias frecuentes que nadie verá porque no hay alertas automáticas.

**🟠 Riesgo 3: `apps/auth/src/main.ts` — MASTER_SECRET sin rotación ni audit log**

El endpoint `POST /api/v1/master/tenants` permite crear cualquier tenant usando solo el `MASTER_SECRET` como header. No hay log de auditoría de estas llamadas, no hay rate limiting. Si el secreto se filtra (ej. en un `.env` commiteado por error), cualquiera puede crear tenants fantasma.

**🟡 Riesgo 4: `apps/seguridad/src/main.ts` — Degradación silenciosa del EventBus**

Todos los `eventBus.publish()` tienen `catch (_) { /* silencioso */ }`. En producción, si RabbitMQ se cae, se pueden registrar 20 incidentes HSE en un día y ningún evento llegará a otros módulos. En el contexto de un accidente laboral reportable al STPS, esta pérdida de eventos puede tener consecuencias legales.

**🟡 Riesgo 5: `apps/gerencia-tecnica/` — Ausencia de "congelación" de versiones de presupuesto**

Cuando se libera un presupuesto base, Compras comienza a referenciar `insumo_id` de ese presupuesto. Si un usuario edita el costo base de un insumo después de que hay OCs emitidas, los reportes de desviación presupuestal calcularán mal porque el precio de referencia cambió retroactivamente.

---

## Parte 3: Integraciones Externas

| Servicio | Módulo que lo consume | Propósito | Estado |
|---|---|---|---|
| SAT / PAC | Contabilidad | Timbrado de CFDI y validación de comprobantes fiscales | ✅ Arquitectura lista; requiere credenciales PAC reales y `--profile sat` |
| RabbitMQ | Todos los módulos | Bus de eventos asíncrono inter-módulo | ✅ En producción en VPS |
| Redis | Infraestructura | Cache / cola alternativa para módulos simples | ✅ Desplegado; uso limitado en código actual |
| PostgreSQL | Todos los módulos | Base de datos por módulo con RLS | ✅ En producción |
| Caddy 2 | Infraestructura | Reverse proxy + HTTPS automático (Let's Encrypt) | ✅ En producción en iretum.com |
| Bancos (SPEI/ACH) | Contabilidad | Procesamiento de archivos bancarios para conciliación | 🟡 Estructura lista, lógica parcial — requiere formato real del banco |
| IMSS / SUA | Personal | Cálculo de cuotas patronales y obreras | ❌ No implementado — tablas IMSS/UMA/ISR no existen en código |
| VPS Hostinger | Infraestructura | Servidor Ubuntu 72.60.114.12 con Docker Compose | ✅ Activo |

---

## Parte 4: Resumen Ejecutivo — Semáforo del MVP

### VEREDICTO: 🟡 AMARILLO

El sistema tiene una arquitectura backend sólida y correctamente diseñada. Los módulos críticos del flujo de dinero (Auth, Finanzas, Contabilidad, Compras) están completos, tienen tests de integración y están en producción. La soberanía de datos, RLS, idempotencia y event sourcing están bien implementados.

**3 condiciones bloqueantes para operar con datos reales de empleados y nómina:**

| # | Condición bloqueante | Esfuerzo estimado | Bloquea |
|---|---|---|---|
| 1 | Motor de cálculo IMSS/ISR/retenciones en personal | 1-2 días | Nómina real |
| 2 | Alerta automática para OCs en ERROR_FINANZAS | 4 horas | Integridad financiera |
| 3 | Audit log para MASTER_SECRET + rate limiting en `/master/tenants` | 4 horas | Seguridad multi-tenant |

**Lo que SÍ está listo para datos reales hoy:**
- ✅ Autenticación, RBAC y aislamiento multi-tenant
- ✅ Flujo completo de Compras con validación financiera
- ✅ Presupuestos y compromisos de fondos
- ✅ Estimaciones de facturación → pago automático
- ✅ HSE: incidentes, inspecciones, permisos, EPP
- ✅ Frontend con login real y navegación multi-proyecto

**Lo que requiere las 3 condiciones antes de datos reales:**
- 🟡 Pre-nómina (cualquier número que se ingrese se guarda sin validar — riesgo fiscal)
- 🟡 Monitoreo de inconsistencias financieras
- 🟡 Hardening del endpoint master de tenants

**Recomendación para SDD:** Adoptar SDD inmediatamente para todos los módulos ya estables (Compras, Finanzas, Auth, Contabilidad, Seguridad). Para Personal: antes de escribir la primera spec de nómina, resolver el gap del motor IMSS/ISR — la spec debe incluir ese comportamiento como requisito no negociable.
