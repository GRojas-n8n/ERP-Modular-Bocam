# Checkpoint: Hito 5 - Hardening SaaS Multi-Tenant / Multi-Proyecto

**Fecha:** 2026-03-17  
**Estado:** Parcialmente endurecido y con mejor consistencia transversal  
**Responsable:** Codex

---

## 1. Objetivo del corte

Este checkpoint aplica un endurecimiento directo sobre la base SaaS ya existente, siguiendo:

- `AGENTS.md`
- `directives/Visión Arquitectónica.md`
- `directives/Matriz de Autorizaciones (RBAC).md`
- `directives/skills/01-saas-architect.md`
- `directives/skills/04-api-endpoint-engineer.md`

La prioridad fue corregir lo que más comprometía la arquitectura:

1. Secretos embebidos.
2. Desalineación del módulo `auth` respecto al patrón RLS.
3. Autorización por proyecto aplicada de forma desigual.
4. Configuración insegura o implícita en el bus de eventos.

---

## 2. Cambios implementados

### A. Se eliminó el fallback inseguro de `JWT_SECRET`

Antes, varios servicios aceptaban una clave JWT hardcodeada si el entorno no estaba bien configurado.  
Ahora todos los servicios tocados hacen **fail-fast** con `requireEnv('JWT_SECRET')`.

Archivos impactados:

- [packages/auth-middleware/src/middleware.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/auth-middleware/src/middleware.ts)
- [packages/auth-middleware/src/index.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/auth-middleware/src/index.ts)
- [apps/auth/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/main.ts)
- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts)
- [apps/control-obra/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/main.ts)
- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts)
- [apps/gerencia-tecnica/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/src/main.ts)
- [apps/personal/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/src/main.ts)
- [apps/seguridad/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/src/main.ts)

Resultado:

- Ya no existe una degradación silenciosa de seguridad si falta `.env`.
- El arranque ahora falla explícitamente cuando la plataforma no tiene secreto válido.

### B. El módulo `auth` ahora usa contexto de tenant y deja de operar “por fuera”

Se agregó una nueva capa de acceso a datos en `auth`:

- [apps/auth/src/db.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/db.ts)

Qué hace:

- Inyecta `app.current_tenant_id`.
- Inyecta `app.current_user_id`.
- Ejecuta operaciones tenant-scoped dentro de transacción.
- Deja un camino `runAsSystem()` solo para el caso excepcional de localizar el tenant de un refresh token opaco antes de tener JWT.

Además, `auth/main.ts` fue reestructurado para que:

- `login` use contexto de tenant.
- `register` use contexto de tenant.
- `refresh` localice el tenant y luego rote el token dentro del contexto correcto.
- `/me` use `req.securityContext`.
- `switch-project` use `req.securityContext`.

Archivo principal:

- [apps/auth/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/src/main.ts)

Resultado:

- `auth` ya no se queda atrás respecto al patrón Multi-Tenant del resto.
- Se reduce el riesgo de bypass accidental del aislamiento lógico.

### C. Se aplicó control de acceso por proyecto a nivel transversal

Los módulos operativos endurecidos ahora aplican `requireProjectAccess()` inmediatamente después del middleware JWT.

Archivos:

- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts)
- [apps/control-obra/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/main.ts)
- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts)
- [apps/gerencia-tecnica/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/src/main.ts)
- [apps/personal/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/src/main.ts)
- [apps/seguridad/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/src/main.ts)

Resultado:

- Los roles de nivel proyecto quedan acotados a sus obras asignadas.
- Los roles tenant-level siguen pudiendo operar globalmente según el helper compartido.

### D. Se aplicó RBAC explícito a rutas críticas de Compras

Se endurecieron dos mutaciones sensibles:

- Convertir comparativa a Orden de Compra.
- Cancelar Orden de Compra.

Ahora estas rutas exigen roles:

- `admin`
- `superintendent`
- `procurement`

Archivo:

- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts)

Resultado:

- Se evita que cualquier usuario autenticado pueda operar sobre OCs.
- Se acerca el comportamiento a la matriz RBAC del documento maestro.

### E. El Event Bus ya no tiene credenciales hardcodeadas

Se retiró la URL AMQP por default con usuario y password embebidos.

Archivo:

- [packages/event-bus/src/index.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/event-bus/src/index.ts)

Nuevo comportamiento:

- Si `RABBITMQ_URL` no existe, el bus se deshabilita de forma explícita con warning.
- No intenta usar credenciales ficticias o implícitas.

### F. Se corrigió tipado compartido y compatibilidad de build parcial

Se hicieron ajustes para que la capa compartida compile mejor:

- Tipado de conexión/canales en `event-bus`.
- Ajustes de `tsconfig` para los apps que consumen código compartido desde `packages/*/src`.

Archivos:

- [apps/auth/tsconfig.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/auth/tsconfig.json)
- [apps/gerencia-tecnica/tsconfig.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/gerencia-tecnica/tsconfig.json)
- [apps/personal/tsconfig.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/personal/tsconfig.json)
- [apps/seguridad/tsconfig.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/seguridad/tsconfig.json)

---

## 3. Validación realizada

Validaciones exitosas:

- `npx tsc --noEmit -p apps/auth/tsconfig.json`
- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npx tsc --noEmit -p packages/auth-middleware/tsconfig.json`

Adicional:

- Ya no existen coincidencias del fallback `bocam_dev_secret_CAMBIAR_EN_PRODUCCION_2026`.
- Ya no existe `DEFAULT_AMQP_URL` con credenciales embebidas en `event-bus`.

Observación operativa:

- La compilación con emisión a `dist` choca en este entorno con errores `EPERM` al escribir archivos.
- El build global del monorepo también mantiene deuda previa ajena a este corte, especialmente en módulos que ya tenían problemas de `generated/prisma`, tipado histórico o restricciones del entorno para Vite.

---

## 4. Impacto arquitectónico

Después de este corte, el sistema queda mejor blindado en cuatro sentidos:

1. **Seguridad base**
   - Ya no depende de secretos embebidos.
   - Falla explícitamente ante configuración insegura.

2. **Consistencia SaaS**
   - `auth` ahora participa del patrón tenant-scoped en vez de ser una excepción.

3. **RBAC / alcance espacial**
   - El control por proyecto ya no queda solo a criterio de cada módulo.

4. **Operación distribuida**
   - El bus no arranca con credenciales inventadas.
   - El modo degradado queda explícito.

---

## 5. Lo que sigue pendiente

Este hito no cierra todavía toda la deuda de plataforma. Quedan como siguientes pasos recomendados:

1. Implementar saga real entre `Compras` y `Finanzas`.
2. Llevar RBAC fino a más endpoints críticos, no solo control por proyecto.
3. Homogeneizar los `tsconfig` y la estrategia de consumo de paquetes compartidos.
4. Resolver los módulos que aún dependen de `generated/prisma` faltante o tipado histórico.
5. Completar automatizaciones de eventos en `Finanzas`.
6. Ejecutar pruebas E2E multi-tenant y multi-proyecto con dos tenants y varios centros de costos.

---

## 6. Conclusión

El sistema sigue estando en fase de **MVP empresarial avanzado**, pero ahora con una base más seria para producción:

- menos riesgo criptográfico,
- mejor alineación de IAM con RLS,
- mejor control de alcance por proyecto,
- y mejor disciplina de configuración compartida.

No es el final del hardening, pero sí un corte importante de saneamiento arquitectónico.

---

*Propiedad Intelectual: Constructora Bocam, S. A. de C.V. - Estrictamente Confidencial.*
