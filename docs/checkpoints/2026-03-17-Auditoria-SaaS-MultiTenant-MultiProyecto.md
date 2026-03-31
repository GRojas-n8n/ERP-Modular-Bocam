# Checkpoint: Auditoria SaaS Multi-Tenant / Multi-Proyecto

**Fecha:** 2026-03-17  
**Estado general:** En fase de MVP arquitectonico operativo. La base SaaS ya existe, pero todavia no esta endurecida para produccion.  
**Responsable:** Codex (revision estatica de arquitectura y codigo)

---

## 1. Resumen ejecutivo

El repositorio ya implementa los pilares correctos para un SaaS modular:

- Microservicios separados por proceso y por esquema de datos.
- JWT centralizado en `auth` con `tenant_id`, `proyecto_id`, `roles`, `projects` y limite de aprobacion.
- App Shell consumiendo exclusivamente `Authorization: Bearer <token>`.
- RLS declarada en todos los modulos de negocio y activada via wrappers de contexto.
- Comunicacion inter-modulo dividida entre HTTP sincrono y eventos RabbitMQ asincronos.

Sin embargo, la plataforma todavia esta en un punto intermedio:

- La arquitectura base ya es compatible con Multi-Tenant y Multi-Proyecto dentro del mismo tenant.
- Los modulos operativos ya respetan bastante bien la soberania de datos.
- El endurecimiento de seguridad y consistencia todavia esta incompleto.

Diagnostico corto: **el sistema ya paso la fase de maqueta y esta entrando en una fase de consolidacion**, pero **todavia no esta listo para llamarse production-ready**.

---

## 2. Hallazgos principales

### Critico 1. Los servicios aceptan un `JWT_SECRET` hardcodeado por fallback

Esto viola directamente la regla de `CERO CREDENCIALES` del `AGENTS.md` y abre la puerta a firmar o validar tokens con una clave conocida si el entorno no esta bien configurado.

- [apps/auth/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/main.ts#L39)
- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L30)
- [apps/control-obra/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/main.ts#L37)
- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts#L46)
- [apps/gerencia-tecnica/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/src/main.ts#L37)
- [apps/personal/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/src/main.ts#L26)
- [apps/seguridad/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/src/main.ts#L31)

Impacto:

- Debilita todo el perimetro de identidad del SaaS.
- Convierte un error de configuracion en una degradacion silenciosa de seguridad.
- Aumenta el riesgo de bypass sobre tenant y proyecto, porque ambos dependen del JWT.

Decision recomendada:

- Eliminar todos los fallbacks hardcodeados.
- Fallar en boot si `process.env.JWT_SECRET` no existe.
- Unificar la politica del runtime con la que ya aplica `@bocam/auth-middleware`.

Referencia positiva:

- [packages/auth-middleware/src/middleware.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/auth-middleware/src/middleware.ts#L61)

### Critico 2. El modulo `auth` declara RLS, pero no la activa en runtime

El DDL de `auth` asume que el servicio inyecta `app.current_tenant_id`, pero el codigo actual usa `PrismaClient` directo y no encontré un wrapper equivalente a `createTenantContext()`.

- [apps/auth/prisma/rls-policies.sql](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/prisma/rls-policies.sql#L129)
- [apps/auth/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/main.ts#L34)
- [apps/auth/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/main.ts#L105)
- [apps/auth/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/main.ts#L543)

Impacto:

- El modulo que gobierna identidad y acceso no esta aplicando el mismo blindaje que los modulos de negocio.
- Si las politicas RLS de `auth` ya estan habilitadas en PostgreSQL, el comportamiento puede ser inconsistente.
- Si no estan habilitadas en runtime efectivo, el modulo depende del filtrado manual y de supuestos de aplicacion.

Decision recomendada:

- Crear `apps/auth/src/db.ts` con inyeccion de `tenant_id` y `user_id`.
- Prohibir el uso directo de `PrismaClient` fuera de esa capa.
- Alinear `auth` con el patron ya usado en Compras, Finanzas, Personal, Seguridad y Control de Obra.

### Alto 3. RBAC fino existe como paquete, pero no esta aplicado de forma sistematica en rutas

El paquete de middleware ya ofrece `requireRoles()` y `requireProjectAccess()`, pero no encontré uso real fuera de su propia definicion.

- [packages/auth-middleware/src/middleware.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/auth-middleware/src/middleware.ts#L177)
- [packages/auth-middleware/src/middleware.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/auth-middleware/src/middleware.ts#L214)

En la practica actual:

- `finanzas`, `control-obra`, `personal` y `seguridad` sí tienen varias validaciones inline.
- `compras` y `gerencia-tecnica` operan casi todo con autenticacion, pero sin una capa homogénea de autorizacion por endpoint.

Ejemplos de chequeos inline existentes:

- [apps/control-obra/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/main.ts#L247)
- [apps/control-obra/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/main.ts#L446)
- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts#L191)
- [apps/personal/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/src/main.ts#L389)
- [apps/seguridad/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/src/main.ts#L336)

Ejemplos donde solo hay autenticacion y contexto, pero no una capa RBAC equivalente:

- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L36)
- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L44)
- [apps/gerencia-tecnica/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/src/main.ts#L39)
- [apps/gerencia-tecnica/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/src/main.ts#L53)

Impacto:

- El sistema ya autentica bien, pero no autoriza de forma uniforme.
- El cumplimiento RBAC depende demasiado del criterio de cada modulo.
- Se vuelve facil introducir endpoints nuevos sin control de autoridad financiera o de rol.

Decision recomendada:

- Convertir `requireRoles()` y `requireProjectAccess()` en obligatorios para rutas sensibles.
- Agregar un helper adicional para limites de aprobacion financiera.
- Trazar una matriz endpoint -> rol -> limite -> proyecto.

### Alto 4. La consistencia inter-modulo entre Compras y Finanzas todavia es parcial

La orquestacion sincrona esta bien planteada, pero todavia hay rutas donde el estado local puede continuar aunque la operacion remota falle.

- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L217)
- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L262)
- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L274)
- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L340)
- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L353)

Impacto:

- Puede existir una OC emitida localmente sin compromiso financiero confirmado.
- Puede cancelarse una OC aunque la liberacion de fondos falle del otro lado.
- Esto rompe la trazabilidad de centros de costos y el principio de verdad unica por modulo.

Decision recomendada:

- Introducir el patron Saga/compensacion.
- No cerrar la comparativa ni dejar la OC en estado final hasta confirmar respuesta de Finanzas.
- Registrar estados intermedios: `PENDIENTE_CONFIRMACION_FINANZAS`, `ERROR_FINANZAS`, `CANCELACION_PENDIENTE`.

### Medio 5. La capa de eventos existe, pero varias automatizaciones siguen en modo placeholder

`Finanzas` ya escucha eventos correctos del dominio, pero parte del procesamiento real sigue documentado como “En producción”.

- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts#L986)
- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts#L991)
- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts#L998)
- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts#L1007)

Impacto:

- El bus ya da visibilidad, pero no completa todavia la automatizacion del dominio financiero.
- La integracion actual depende mas de HTTP directo que de coreografia madura.

Decision recomendada:

- Completar consumidores idempotentes para `compras.oc_creada`, `compras.oc_cancelada` y `control_obra.estimacion_aprobada`.
- Persistir huella de eventos procesados por modulo.
- Definir DLQ, reintentos e idempotencia por `event_type + referencia_id + tenant_id + proyecto_id`.

### Medio 6. El Event Bus tambien tiene credenciales por default en codigo

No es el principal riesgo del sistema, pero sigue violando el criterio de no dejar credenciales embebidas.

- [packages/event-bus/src/index.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/event-bus/src/index.ts#L47)
- [packages/event-bus/src/index.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/event-bus/src/index.ts#L65)

Decision recomendada:

- Eliminar `DEFAULT_AMQP_URL` con usuario y password.
- Fallar en arranque o entrar en modo degradado explicito si no existe `RABBITMQ_URL`.

---

## 3. Lo que ya esta bien resuelto

### Aislamiento SaaS

El modelo de datos ya refleja correctamente la doble jerarquia `tenant_id + proyecto_id`.

Ejemplos:

- [apps/compras/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/prisma/schema.prisma#L37)
- [apps/control-obra/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/prisma/schema.prisma#L30)
- [apps/finanzas/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/prisma/schema.prisma#L27)
- [apps/personal/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/prisma/schema.prisma#L83)
- [apps/seguridad/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/prisma/schema.prisma#L32)
- [apps/gerencia-tecnica/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/prisma/schema.prisma#L46)

### RLS en modulos operativos

Los modulos de negocio principales ya envuelven operaciones con un contexto de seguridad que inyecta `SET LOCAL app.current_tenant_id` y `SET LOCAL app.current_proyecto_id`.

Ejemplos:

- [apps/compras/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/db.ts#L32)
- [apps/control-obra/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/db.ts#L28)
- [apps/finanzas/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/db.ts#L45)
- [apps/personal/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/src/db.ts#L20)
- [apps/seguridad/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/src/db.ts#L20)
- [apps/gerencia-tecnica/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/src/db.ts#L69)

### Multi-proyecto dentro del mismo tenant

Este punto ya esta bastante bien resuelto a nivel de identidad:

- El JWT incluye `projects` y `proyecto_id` activo.
- Existe `switch-project`.
- El Shell ya consume ese flujo sin headers manuales.

Referencias:

- [apps/auth/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/main.ts#L61)
- [apps/auth/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/main.ts#L516)
- [apps/app-shell/src/lib/api.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/lib/api.ts#L53)
- [apps/app-shell/src/lib/api.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/lib/api.ts#L158)

### Patron correcto de integracion entre modulos

La decision arquitectonica base tambien esta bien:

- HTTP sincrono cuando la respuesta es requisito del flujo.
- Eventos asincronos cuando se trata de reaccion del dominio.

Evidencia:

- La directiva de arquitectura exige que Compras consulte suficiencia antes de emitir OC.
- `Compras` consulta `Finanzas` via API para suficiencia y compromiso.
- El bus de eventos exige `tenant_id` y `proyecto_id` en el contexto.

Referencias:

- [directives/Visión Arquitectónica.md](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/directives/Visi%C3%B3n%20Arquitect%C3%B3nica.md#L25)
- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts#L217)
- [packages/event-bus/src/index.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/event-bus/src/index.ts#L126)

---

## 4. Estado actual por modulo

### App Shell

- Estado: Operativo como shell autenticado.
- Fortalezas: ya usa Bearer token, auto-refresh y cambio de proyecto.
- Ya inicio migracion real a `@bocam/ui-core`, redujo CSS heredado, limpio branding fijo visible y usa `tenant.name` / `tenant.logoUrl` en el shell.
- Ya extendio `@bocam/ui-core` a formularios base (`FormField`, `Input`, `Textarea`, `Select`) y dejo `ComprasView` como primera vista operativa completa migrada al design system compartido.
- Ya subio tablas y listados base a `@bocam/ui-core` (`EmptyStatePanel`, `Table*`, `TableFooterBar`) y migro `ControlObraView` como segunda vista operativa completa.
- Ya migro tambien `LoginView` a `Input` y `Select` compartidos, y `FinanzasView` a tablas/listados base del design system.
- Ya migro `PersonalView` al design system compartido y dejo evaluado `SlidePanel` como candidato viable para extraccion parcial a `ui-core`, no como subida 1:1.
- Ya migro `SeguridadView` a `@bocam/ui-core` y creo `SideSheet` como primitiva neutral en el paquete compartido, dejando `SlidePanel` como adapter del shell encima de esa base.
- Ya migro `DashboardView` al design system compartido y extrajo `MetricCard` a `@bocam/ui-core` como patron reusable de KPI/metric cards para el frente visual principal del shell.
- Ya homogeneizo los bloques ejecutivos locales mas repetibles del shell con `BudgetHealthCard`, `ProgressRing` y `OperationalBanner`, dejando validadas nuevas primitives reales de dashboard dentro de `@bocam/ui-core`.
- Ya confirmo reutilizacion de primitives de dashboard fuera de `Dashboard`, migrando un banner ejecutivo real de `FinanzasView` a `OperationalBanner`.
- Ya confirmo tambien reutilizacion de `BudgetHealthCard` fuera de `Dashboard`, aplicandolo a un resumen comparativo real de `FinanzasView`.
- Ya reorganizo `@bocam/ui-core` con una subcapa explicita `dashboard/`, separando primitives base de primitives ejecutivas sin romper compatibilidad de imports.
- Ya inicio la transicion a imports explicitos desde `@bocam/ui-core/dashboard` en `DashboardView` y `FinanzasView`, dejando el barrel general solo como compatibilidad temporal.
- Ya corrio una pasada de control sobre imports del shell y no quedan primitives ejecutivas entrando indebidamente por `@bocam/ui-core`; hoy solo `DashboardView` y `FinanzasView` consumen esa capa y ambas ya apuntan a `@bocam/ui-core/dashboard`.
- Punto pendiente: consolidar branding white-label real desde `Tenant_Config` y extender `@bocam/ui-core` al resto de vistas operativas del shell.

### Auth

- Estado: Operativo, pero con deuda critica.
- Ya resuelve login, refresh, `/me`, registro y `switch-project`.
- Es la pieza que confirma el modelo multi-proyecto por tenant.
- Pendiente mayor: activar RLS en runtime y eliminar secretos embebidos.

### Gerencia Tecnica

- Estado: Base fundacional correcta, cobertura funcional todavia corta.
- Endpoints detectados: 2.
- Ya es duenio del catalogo maestro de insumos y del presupuesto base.
- Pendiente: ampliar operaciones CRUD y eventos de liberacion/versionamiento.

### Compras

- Estado: MVP funcional con buena integracion horizontal.
- Endpoints detectados: 8.
- Ya modela requisiciones, comparativas y ordenes, y consume a Finanzas como dependencia dura.
- Ya adopto reutilizacion transversal de `tenant-idempotency` en el consumidor `finanzas.fondos_comprometidos`.
- Ya cerro el feedback loop financiero reutilizable en `finanzas.fondos_comprometidos` y `finanzas.fondos_liberados`.
- Ya usa la segunda primitiva compartida para handlers terminales asincronos (`not_found`, `idempotent`, `applied`).
- Ya usa un helper minimo compartido de logging estructurado por estado terminal en el feedback loop financiero (`finanzas.fondos_comprometidos` y `finanzas.fondos_liberados`).
- Ya extendio ese helper tambien a `finanzas.presupuesto_insuficiente`, cubriendo el trio terminal completo del feedback loop de `Compras` con `Finanzas`.
- Pendiente mayor: robustecer consistencia transaccional con Finanzas y aplicar RBAC por ruta.

### Control de Obra

- Estado: Bastante avanzado en flujo operativo.
- Endpoints detectados: 12.
- Ya maneja avances, validacion y aprobacion de estimaciones.
- Ya adopto reutilizacion transversal de `tenant-idempotency` en `finanzas.pago_registrado`.
- Ya usa la segunda primitiva compartida para handlers terminales asincronos (`not_found`, `idempotent`, `applied`).
- Ya adopto tambien el helper minimo compartido de logging estructurado por estado terminal en `finanzas.pago_registrado`.
- Ya probo `buildTerminalHttpResponse(...)` fuera de `Contabilidad` en `reconciliar-finanzas`, con comportamiento HTTP realmente idempotente (`applied` en la primera llamada, `idempotente` en la segunda sin reprocesar Finanzas).
- Pendiente: reforzar saga con Finanzas e idempotencia de eventos.

### Finanzas

- Estado: Uno de los modulos mas maduros en reglas de negocio.
- Endpoints detectados: 13.
- Ya implementa suficiencia, compromisos, liberaciones, limites de autoridad e integracion con eventos.
- Ya inicio la extraccion de primitivas compartidas de idempotencia; primer caso migrado: `comprometer-fondos`.
- Ya cerro una primera capa homogenea de idempotencia en `comprometer-fondos`, `liberar-fondos` y `pagos`.
- Pendiente: convertir placeholders de consumidores a automatizaciones reales.

### Contabilidad

- Estado: Operativo como modulo consumidor soberano.
- Endpoints detectados: 5.
- Ya traduce `finanzas.pago_registrado`, `compras.oc_creada`, `compras.oc_cancelada` y `finanzas.transferencia_presupuestal` a asientos contables propios y emite `contabilidad.asiento_contable_generado`.
- Ya cubre pago real, apertura de conciliacion fiscal, cierre CFDI, validacion SAT (`VIGENTE` / `CANCELADO`) via flujo asincrono con worker, reintentos, DLQ, monitoreo de `VALIDACION_EN_PROCESO`, deduplicacion por `dispatch_id` frente a redeliveries, helper transaccional reusable para alta idempotente, helper reusable para conciliacion por `referencia_funcional` / `evento_conciliacion_key`, helper reusable para mutaciones operativas `apply-or-idempotent`, alta inicial de `finanzas.pago_registrado` endurecida contra carreras concurrentes, conciliacion bancaria unitaria, masiva por lote y por archivo (`CSV` / `XLSX`), pasivo proyectado, conciliacion con `finanzas.fondos_comprometidos`, reversa de pasivo proyectado, conciliacion con `finanzas.fondos_liberados` y polizas internas por transferencia.
- Ya reutiliza la segunda primitiva compartida de handlers terminales tambien dentro de `Contabilidad`, en conciliaciones funcionales de `finanzas.fondos_comprometidos` y `finanzas.fondos_liberados`, y consolido un helper local de logging terminal como paso previo a una posible tercera capa compartida.
- Ya migro ese helper local a una primitiva minima compartida de logging estructurado por estado terminal, aplicada primero en `Contabilidad` y `Compras`.
- Ya extendio esa primitiva compartida tambien a operaciones internas repetitivas de `Contabilidad`, incluyendo alta idempotente de asientos y placeholders fiscal/bancario.
- Ya incorporo una primitiva hermana minima para respuestas terminales HTTP, probada primero en conciliacion CFDI y conciliacion bancaria.
- Ya extendio esa primitiva HTTP tambien a `validar-sat`, confirmando que el patron funciona en mutaciones fiscales idempotentes y no solo en conciliaciones directas.
- Ya probo esa primitiva HTTP en una ruta mas compleja de `Contabilidad` (`conciliaciones-bancarias/lote`) con exito parcial, lo que da evidencia suficiente para considerar expansion controlada a otros modulos.
- Pendiente: politicas/asientos derivados de nomina, impuestos y exponer operacion/DLQ SAT en dashboard del shell con alertamiento.

### Personal

- Estado: Operativo en RRHH / prenomina.
- Endpoints detectados: 13.
- Ya incluye controles RBAC puntuales.
- Pendiente: revisar cobertura completa de autoridad por proyecto y aprobaciones cruzadas.

### Seguridad

- Estado: Operativo y amplio en superficie.
- Endpoints detectados: 15.
- Ya incluye permisos, incidentes y autorizaciones con RBAC parcial.
- Pendiente: homogeneizar reglas de proyecto y permisos por accion.

---

## 5. En que punto esta realmente el sistema

Si lo tuviera que ubicar en un mapa de madurez:

1. **Fase 1 superada:** separacion modular, esquemas independientes y contratos iniciales.
2. **Fase 2 muy avanzada:** JWT centralizado, RLS en negocio, App Shell integrado, varios flujos verticales completos.
3. **Fase 3 incompleta:** hardening de seguridad, RBAC uniforme, sagas, idempotencia y operacion event-driven completa.
4. **Fase 4 aun no iniciada del todo:** observabilidad seria, pruebas E2E multi-tenant, despliegue con politicas de secreto y recuperacion operativa.

Conclusion ejecutiva:

**Hoy el sistema esta en una “beta interna fuerte” o un “MVP empresarial avanzado”, pero no en una version lista para un SaaS multi-tenant de produccion regulada.**

---

## 6. Siguiente paso recomendado

Orden sugerido de trabajo:

1. Blindar seguridad base.
   - Quitar todos los secrets hardcodeados.
   - Hacer fail-fast sin `.env`.
   - Corregir `auth` para usar contexto RLS real.

2. Estandarizar autorizacion.
   - Aplicar `requireRoles()` y `requireProjectAccess()` a rutas sensibles.
   - Crear helper de autoridad financiera.
   - Revisar endpoint por endpoint contra la matriz RBAC.

3. Endurecer orquestacion.
   - Implementar saga Compras <-> Finanzas.
   - Completar consumidores reales en Finanzas.
   - Agregar idempotencia y DLQ en eventos.

4. Validar el SaaS como plataforma.
   - Pruebas E2E con dos tenants y multiples proyectos.
   - Casos de fuga cruzada entre tenants.
   - Casos de cambio de proyecto con JWT renovado.

---

## 7. Fuentes revisadas

- `AGENTS.md`
- `directives/Visión Arquitectónica.md`
- `directives/Diccionario de Entidades Globales (MDM).md`
- `directives/Matriz de Autorizaciones (RBAC).md`
- `directives/skills/02-system-architecture-reviewer.md`
- `apps/*/src/main.ts`
- `apps/*/src/db.ts`
- `apps/*/prisma/schema.prisma`
- `apps/*/prisma/rls-policies.sql`
- `packages/auth-middleware/src/middleware.ts`
- `packages/event-bus/src/index.ts`
- `apps/app-shell/src/lib/api.ts`

---

*Propiedad Intelectual: Constructora Bocam, S. A. de C.V. - Estrictamente Confidencial.*
