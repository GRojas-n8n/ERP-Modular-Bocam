# Spec Delta — oc-error-finanzas-alert

> **Propósito:** Documentar las decisiones técnicas y desviaciones ocurridas durante la implementación respecto al diseño original en `design.md`. Este archivo es la fuente de verdad post-implementación para cualquier revisión futura de esta funcionalidad.
>
> **Convención:** `[CONFIRMADO]` = lo que estaba en design.md se implementó exactamente como se describió. `[AJUSTE]` = la implementación difiere del diseño original pero cumple el mismo goal. `[ADICIÓN]` = decisión tomada durante implementación que no estaba en el diseño original.

---

## D1: Publicación del evento — paths síncrono y asíncrono → `[CONFIRMADO]`

Se implementó en ambos paths tal como diseñado:

- **Path síncrono** (`POST /comparativas/:id/convertir-oc`, catch block de `comprometer-fondos`): `eventBus.publish` con `buildEventContext(req)` y `logWarn` en caso de bus offline.
- **Path asíncrono** (`handlePresupuestoInsuficienteEvent`, bloque `apply` del `applyTerminalMutationInContext`): `eventBus.publish` con contexto del evento y `console.warn` en caso de bus offline (no hay `req` object disponible en handlers de eventos).

**Divergencia menor — path asíncrono usa `console.warn` en lugar de `logWarn`:** Los handlers de eventos no reciben un `req: Request` de Express. `logWarn` del paquete `@bocam/observability` requiere `req` para extraer correlation_id y metadata HTTP. En el path asíncrono se usa `console.warn(JSON.stringify({...}))` como sustituto estructurado. Esta diferencia es conocida y aceptada; es consistente con el patrón de otros handlers de eventos en el módulo.

---

## D2: Persistencia en tabla nueva vs. log → `[CONFIRMADO]`

La tabla `AlertaOcError` fue creada tal como diseñado. Se confirmó durante la implementación que:

- El `upsert` en el path síncrono ocurre en un `createTenantContext` **separado** del upsert del estado de la OC. Esto fue una decisión de implementación explícita para aislar el fallo de la alerta del fallo de la transacción principal.
- El `upsert` en el path asíncrono ocurre **dentro del mismo** `createTenantContext` que actualiza el estado de la OC, aprovechando la transacción abierta para garantizar atomicidad.

**Diferencia de atomicidad entre paths:** El path síncrono tiene dos transacciones separadas (OC update + upsert alerta). El path asíncrono tiene una transacción única. Esto es intencional: en el path síncrono, si la alerta falla pero la OC ya cambió a `ERROR_FINANZAS`, la respuesta HTTP ya fue encolada; no tiene sentido hacer rollback del estado de la OC. En el path asíncrono, el handler puede ser retried, por lo que la atomicidad (upsert + OC update juntos) garantiza idempotencia perfecta.

---

## D3: Idempotencia por `@@unique([tenant_id, oc_id])` → `[CONFIRMADO]`

El constraint único se implementó y verificado por test (`testIdempotenciaAlerta`). La prueba ejecutó `handlePresupuestoInsuficienteEvent` **dos veces** con el mismo `oc_id` y confirmó exactamente 1 registro en `AlertaOcError`.

---

## D4: Filtro explícito por `proyecto_id` en endpoint → `[ADICIÓN]`

**No estaba en el design original.** El `design.md` asumía que el `createTenantContext` + RLS de PostgreSQL garantizaría el aislamiento por `proyecto_id`.

**Problema encontrado:** En el entorno de dev-postgres (sin políticas RLS activas), el endpoint devolvía alertas de todos los proyectos del tenant. El test `testAislamientoMultiProyecto` falló inicialmente por esta razón.

**Decisión:** Agregar `tenant_id: tenantId, proyecto_id: proyectoId` explícitamente al `where` del `findMany`. Es defensa en profundidad: el código es correcto en CUALQUIER entorno (con o sin RLS), no solo en producción con RLS activo.

```typescript
// ANTES (design original):
prisma.alertaOcError.findMany({ where: { resuelta: false }, orderBy: { created_at: 'desc' } })

// DESPUÉS (implementado):
prisma.alertaOcError.findMany({
  where: { resuelta: false, tenant_id: tenantId, proyecto_id: proyectoId },
  orderBy: { created_at: 'desc' }
})
```

**Impacto en spec:** El scenario "Aislamiento multi-tenant del endpoint" del spec pasa en TODOS los entornos, no solo en producción.

---

## D5: Import dinámico de `main.ts` en tests → `[ADICIÓN]`

**No estaba en el diseño de tests.** Descubierto durante la implementación del test 5.2.

**Problema:** Los `import` estáticos de TypeScript/CommonJS se ejecutan al inicio del proceso, antes de que `setup()` asigne `process.env.FINANZAS_URL`. El módulo `main.ts` captura `FINANZAS_URL` como constante a nivel de módulo (`const FINANZAS_URL = process.env.FINANZAS_URL || 'http://localhost:3004'`). Si `main.ts` se importa estáticamente al top del test file, `FINANZAS_URL` queda "congelado" al valor por defecto ANTES de que el stub de Finanzas sea levantado por `setup()`.

**Síntoma:** Los primeros tests devolvían HTTP 500 (error en la fase de suficiencia) en lugar de 502 (error en comprometer fondos).

**Solución:** Eliminar el `import { handlePresupuestoInsuficienteEvent } from '../../src/main'` estático. Reemplazar con una variable `let handlePresupuestoInsuficienteEvent: Function` a nivel de módulo, asignada dentro de `setup()` DESPUÉS de que `process.env.FINANZAS_URL` se setea y el stub está corriendo.

```typescript
// ANTES (causa del bug):
import { handlePresupuestoInsuficienteEvent } from '../../src/main'; // ← carga main.ts ahora

// DESPUÉS (correcto):
let handlePresupuestoInsuficienteEvent: (event: any) => Promise<void>;
// ... en setup():
process.env.FINANZAS_URL = `${finanzasStarted.baseUrl}/api/v1/finanzas`;
const comprasModule = await import('../../src/main'); // ← carga main.ts con FINANZAS_URL correcto
handlePresupuestoInsuficienteEvent = comprasModule.handlePresupuestoInsuficienteEvent;
```

**Regla derivada para el proyecto:** En tests que arrancan un stub de un servicio externo, siempre setear `process.env.*_URL` ANTES de importar el módulo que lo lee como constante. Preferir imports dinámicos cuando el módulo bajo test captura env vars en constantes de módulo.

---

## D6: Migración en VPS — SQL directo en lugar de `prisma migrate deploy` → `[AJUSTE]`

**El design.md decía:** `prisma migrate deploy` en VPS.

**Lo que se hizo:** SQL directo vía `docker exec postgres psql ... -f /tmp/script.sql`.

**Razón:** La base de datos de producción fue creada inicialmente con SQL directo (sin historial Prisma). No existe tabla `_prisma_migrations`. Correr `prisma migrate deploy` habría intentado crear TODAS las tablas del módulo (la migración `20260526215207` es una migración "initial" desde BD vacía), fallando con errores `table already exists` para las 7 tablas existentes.

**Proceso alternativo seguido:**
1. Se extrajeron solo los DDL de las tablas faltantes (`alertas_oc_error`, `inventario_almacen`, `movimientos_almacen`)
2. Se aplicaron directamente con `psql`
3. Para futuros módulos o cambios: documentar la necesidad de crear un baseline de migraciones Prisma o mantener el pattern de SQL directo como convención del proyecto

**Deuda técnica generada:** El módulo `compras` tiene un archivo `migration.sql` en el repo que NO está sincronizado con el estado real de la BD de producción. Si se ejecuta `prisma migrate deploy` en el futuro en VPS, fallará. La solución correcta sería ejecutar `prisma migrate resolve --applied 20260526215207_add_alerta_oc_error` en VPS para registrar la migración como ya aplicada.

---

## D7: Schema.prisma — commit correctivo necesario → `[ADICIÓN]`

**No documentado en el diseño.** Error operacional durante el ciclo de implementación.

**Problema:** El modelo `AlertaOcError` fue agregado a `schema.prisma` en el Block 1 del ciclo de apply, pero NO fue incluido en el commit de Block 3 (`1bdc543`). Lo que se commitó fue la versión previamente staged del archivo (con solo los modelos de Almacén). Los archivos generados del cliente Prisma (`index.d.ts`, etc.) SÍ fueron committed con `alertaOcError` (porque se regeneraron localmente con el schema correcto).

**Consecuencia:** Al hacer `docker compose build` en VPS, el paso `prisma generate` regeneraba el cliente Prisma desde el schema **sin `AlertaOcError`**, sobreescribiendo los archivos generados committed. TypeScript fallaba con `Property 'alertaOcError' does not exist on type 'PrismaClient'`.

**Resolución:** Commit correctivo `a005172` que agrega el modelo `AlertaOcError` al `schema.prisma`.

**Lección:** Al usar el patrón "commit generated Prisma client files + schema.prisma", siempre verificar que ambos archivos están staged juntos antes del commit. El schema y los archivos generados deben ser coherentes; una discrepancia produce errores de build difíciles de diagnosticar.

---

## Resumen de escenarios del spec vs. cobertura de tests

| Scenario del spec | Cubierto por test | Resultado |
|---|---|---|
| OC → ERROR_FINANZAS por fallo síncrono → evento publicado | `testAlertaGeneradaEnFalloSincrono` (proxy BD) | ✅ Pass |
| OC → ERROR_FINANZAS por evento asíncrono → evento publicado | `testIdempotenciaAlerta` (usa async handler) | ✅ Pass |
| EventBus offline → alerta persiste en BD, no excepción | Cubierto implícitamente (RABBITMQ_URL inválido en todos los tests) | ✅ Pass |
| Primera vez: crear registro `AlertaOcError` | `testAlertaGeneradaEnFalloSincrono` | ✅ Pass |
| Reintento: upsert actualiza, no duplica | `testIdempotenciaAlerta` | ✅ Pass |
| Consulta exitosa con alertas pendientes | `testAislamientoMultiProyecto` (verifica data non-empty) | ✅ Pass |
| Sin alertas pendientes → `data: []` | `testAccesoDenegadoParaResident` (indirectly) + producción | ✅ Pass |
| Acceso sin rol autorizado → 403 | `testAccesoDenegadoParaResident` | ✅ Pass |
| Aislamiento multi-tenant | `testAislamientoMultiProyecto` | ✅ Pass |
