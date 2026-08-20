# QA Strategy — iRetum ERP

> Para proyecto existente (~60%). Este documento describe **qué** probar y **cómo**.

## 📌 Principio rector

En un proyecto nuevo, los tests se escriben antes del código (TDD).
En un proyecto existente como iRetum, los tests se escriben:

1. **Para bugs:** antes del fix (el test reproduce el bug)
2. **Para features nuevos:** antes de la implementación (TDD puro)
3. **Para el legacy que se toca:** cuando Claude Code modifica un archivo legacy, debe agregar tests para el código modificado
4. **Para regresión:** después de cualquier cambio, el test suite completo debe pasar

---

## Niveles de prueba para iRetum

### 🟢 Nivel 1 — Unit tests (por microservicio)

**Stack:** Jest + Supertest
**Dónde:** dentro de cada `services/XX/__tests__/`
**Propósito:** funciones puras, validaciones, helpers, lógica de negocio sin side effects

| Microservicio | Prioridad | Ejemplo de test |
|---|---|---|
| auth | 🔴 Crítica | Login JWT, RBAC, refresh token, expiración |
| gerencia-tecnica | 🔴 Crítica | Cálculo de APU, congelamiento de versiones |
| compras | 🔴 Crítica | Validación OC, suficiencia presupuestal |
| finanzas | 🔴 Crítica | Compromiso/liberación, cálculo de presupuesto |
| control-obra | 🟡 Alta | Registro QR, avance físico, estimaciones |
| personal | 🟢 Media | Cálculo IMSS/ISR, prenóminas |
| seguridad | 🟢 Media | Validación permisos alto riesgo |
| contabilidad | 🟢 Media | Catálogo de cuentas, timbrado |
| calidad | 🟢 Media | SGC versionado, no conformidades |
| reportes | 🔵 Opcional | Formato PDF/Excel |
| asistente-ia | 🔵 Opcional | Prompt building, parseo de respuesta |
| ventas | 🔴 Crítica | Módulo nuevo — TDD desde el inicio |

**Cobertura objetivo:** 80% módulos nuevos, 60% módulos existentes

**⚠️ Pitfall unit tests en legacy:** Muchos microservicios legacy no tienen tests. No escribas tests para TODO el legacy de golpe. Escribe tests SOLO para el código que tocas (bug fix o feature nueva). La regla es: **toca código legacy → agregas tests para ese código**.

---

### 🟡 Nivel 2 — Integration tests (dentro del mismo microservicio)

**Stack:** Jest + Supertest + PostgreSQL de prueba
**Dónde:** `services/XX/integration/`
**Propósito:** probar endpoints HTTP reales contra base de datos de prueba

**Qué probar en cada endpoint:**

```
[POST] /api/XX/recurso
  ✅ 201 — creación exitosa
  ✅ 400 — body inválido (campos faltantes, tipos incorrectos)
  ✅ 401 — sin token de autenticación
  ✅ 403 — token sin permisos para este rol
  ✅ 409 — duplicado (si aplica)

[GET] /api/XX/recurso/:id
  ✅ 200 — recurso encontrado
  ✅ 404 — recurso no existe
  ✅ 401 — sin token

[PUT] /api/XX/recurso/:id
  ✅ 200 — actualización exitosa
  ✅ 400 — body inválido
  ✅ 404 — recurso no existe
  ✅ 409 — conflicto de versión (si aplica)

[DELETE] /api/XX/recurso/:id
  ✅ 200 — borrado exitoso (o 204)
  ✅ 404 — recurso no existe
  ✅ 409 — recurso en uso por otra entidad
```

**Base de datos de prueba:**
- Usar PostgreSQL separada (puede ser la misma instancia con DB distinta)
- Seed mínimo: obtener del schema del microservicio
- Reset entre ejecuciones: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` + migración + seed

---

### 🟠 Nivel 3 — Event bus tests (RabbitMQ)

**Stack:** Jest + RabbitMQ test container (o mock de `amqplib`)
**Dónde:** `services/XX/events/__tests__/`
**Propósito:** probar que los eventos correctos se emiten y consumen

**Qué probar:**

```
✅ El microservicio A emite el evento correcto cuando ocurre X
✅ El microservicio B consume el evento Y y actualiza su estado correctamente
✅ El event bus es idempotente (mismo evento dos veces = mismo resultado)
✅ El timeout/error en el consumidor no deja el sistema inconsistente
⚠️ Si RabbitMQ no responde, el emisor debe reintentar (no perder el evento)
```

**Eventos críticos en iRetum:**

| Evento | Emisor | Consumidor(es) |
|---|---|---|
| `compra.oc.creada` | compras | finanzas, control-obra |
| `finanzas.fondo.comprometido` | finanzas | compras |
| `finanzas.fondo.liberado` | finanzas | compras |
| `personal.empleado.registrado` | personal | seguridad, control-obra |
| `control-obra.estimacion.creada` | control-obra | finanzas |

**⚠️ Pitfall microservicios y puertos:** Los tests de integración entre servicios requieren ambos servicios corriendo. Para CI, levantar los microservicios involucrados con Docker Compose antes de ejecutar. Para desarrollo local, usar `docker-compose up services-a services-b` y apuntar los tests a esos puertos.

---

### 🔴 Nivel 4 — E2E tests (multi-servicio)

**Stack:** Playwright (frontend) + Supertest (backend E2E)
**Dónde:** `tests/e2e/` (raíz del repo iRetum)
**Propósito:** flujos completos que cruzan múltiples microservicios

**Flujos E2E a probar (prioridad):**

#### Flujo crítico #1: Cotización → OC → Compromiso presupuestal
```
1. Gerencia Técnica crea catálogo de insumos
2. Compras solicita cotización a proveedor
3. Compras arma cuadro comparativo
4. Gerencia Técnica aprueba comparativo
5. Compras convierte a OC
6. Finanzas compromete fondos automáticamente
7. Almacén registra entrada de materiales
→ Verificar: OC tiene número, estado "comprometido", presupuesto reducido en X
```

#### Flujo crítico #2: Residente → Avance físico → Estimación
```
1. Residente registra asistencia QR de cuadrilla
2. Residente captura avance físico del periodo
3. Creación de estimación
4. Finanzas recibe evento y libera pago
→ Verificar: estimación tiene cálculo correcto, fondos liberados
```

#### Flujo crítico #3: Login → Dashboard → KPIs
```
1. Login con cada rol (GT, Compras, Residente, Finanzas)
2. Verificar sidebar contextual solo muestra módulos autorizados
3. Dashboard carga KPIs correctos según el proyecto activo
4. Narrativa IA se generó (sin errores)
→ Verificar: 401 en rutas no autorizadas por rol
```

#### Flujo crítico #4: Multi-tenant aislamiento
```
1. Login con tenant A
2. Crear OC, comprometer fondos
3. Login con tenant B (otra sesión)
4. Verificar que NO ve datos del tenant A
5. Verificar que IDs autoincrementales no se filtran entre tenants
→ Verificar: RLS de PostgreSQL funciona correctamente
```

**Configuración de Playwright:**

```ts
// playwright.config.ts (en raíz de iRetum)
import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.E2E_URL || 'https://iretum.com',
    headless: true,
  },
});
```

---

### 🔵 Nivel 5 — Visual Regression tests (Frontend)

**Stack:** Playwright + screenshot diff
**Dónde:** `tests/e2e/visual/`
**Propósito:** detectar cambios visuales no intencionales

**Cuándo se activa:** solo cuando se toca el frontend (nuevo componente, cambio de layout)

**Flujo:**
1. Tomar screenshot de referencia (main actual)
2. Tomar screenshot del cambio (feature branch)
3. Comparar con `pixelmatch` o `jest-image-snapshot`
4. Si diff > 1%, marcar como cambio visual — requiere revisión humana

---

### ⚪ Nivel 6 — Performance / Load tests

**Stack:** k6 (Grafana)
**Dónde:** `tests/performance/`
**Propósito:** medir latencia y throughput bajo carga

**Cuándo ejecutar:**
- Antes de cada release a producción
- Cuando se agrega un nuevo endpoint que puede ser llamado frecuentemente
- Cuando se cambia la lógica de consultas a PostgreSQL

**Mínimo:**
```
/auth/login — 100 usuarios concurrentes → < 500ms p95
/compras/oc — 50 usuarios concurrentes → < 800ms p95
/reportes/dashboard — 20 usuarios concurrentes → < 2s p95
```

---

## QA Gate — ¿Qué pasa antes de mergear un PR?

Cada PR contra `main` debe pasar:

```markdown
### QA Gate checklist

- [ ] Unit tests del microservicio modificado pasan
- [ ] Integration tests del microservicio modificado pasan  
- [ ] Tests de eventos (si el cambio emite/consume eventos) pasan
- [ ] E2E tests de flujo crítico pasan (al menos el flujo afectado)
- [ ] Sin regresiones: `npx playwright test` completo pasa
- [ ] Sin errores de lint: `npm run lint` en frontend y backend
- [ ] Build exitoso: `npm run build` en frontend y servicios modificados
- [ ] Cobertura de código nuevo ≥ 80%
```

**⚠️ Pitfall: QA gate demasiado pesado mata la productividad.**
Para PRs pequeños (bugs, typo fixes, doc changes):
- Solo correr unit tests + integration tests del servicio afectado
- Los E2E completos se corren 1 vez al día (o en release)

**QA gate diferencial:**

| Tipo de PR | QA gate mínimo |
|---|---|
| Bug fix en 1 microservicio | ✅ Unit + Integration del servicio |
| Feature en 1 microservicio | ✅ Unit + Integration + Event tests |
| Feature cross-servicio | ✅ Unit + Integration + Event tests + E2E del flujo |
| Refactor frontend | ✅ Lint + Build + Visual regression |
| Release semanal | ✅ Todo |

---

## Bugs — Flujo de QA

### Bug report → Fix

1. **Reportar:** issue en GitHub con: steps to reproduce, expected vs actual, evidencia (screenshot, log, curl)
2. **Test de reproducción:** escribir test unitario o de integración que FALLA con el bug presente
3. **Spec del bug:** archivo en `specs/bugs/bug-XX-descripcion.md` con el caso borde documentado
4. **Fix:** implementar con Claude Code — debe hacer pasar el test de reproducción
5. **QA gate:** todos los tests legacy deben seguir pasando
6. **PR:** merge contra main

### Ejemplo de spec de bug

```markdown
# Bug-042 — OC duplicada por reintento de evento

## Descripción
Cuando RabbitMQ retrasa la entrega del evento `compra.oc.creada`,
finanzas procesa la OC dos veces y compromete el doble del presupuesto.

## Causa raíz
El handler en finanzas no es idempotente. Falta verificar `event_id`
antes de procesar.

## Test que reproduce
```typescript
test('procesar OC duplicada no compromete presupuesto dos veces', async () => {
  const evento = crearEvento('compra.oc.creada', { ocId: 'OC-001', monto: 50000 });
  await finanzasHandler(evento);
  await finanzasHandler(evento); // mismo evento_id

  const presupuesto = await obtenerPresupuesto('proyecto-X');
  expect(presupuesto.comprometido).toBe(50000); // no 100000
});
```

## Fix esperado
Agregar verificación de idempotencia en `services/finanzas/events/handler.ts`
```

---

## Infraestructura de testing

### Docker Compose para tests

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: iretum_test
    ports: ["5433:5432"]  # puerto diferente para no chocar con dev

  rabbitmq-test:
    image: rabbitmq:3-alpine
    ports: ["5673:5672"]  # puerto diferente

  # Microservicios bajo prueba se levantan según necesidad
```

### Seed de prueba

```sql
-- tests/seed/base.sql
-- Datos mínimos compartidos entre todos los tests
INSERT INTO tenants (id, nombre, rfc) VALUES ('demo-tenant', 'Bocam Demo', 'XAXX010101000');
INSERT INTO proyectos (id, tenant_id, nombre, presupuesto_total)
  VALUES ('demo-proyecto', 'demo-tenant', 'Obra Demo', 50000000);
INSERT INTO roles (id, nombre) VALUES
  ('rol-gt', 'Gerencia Técnica'),
  ('rol-compras', 'Compras'),
  ('rol-residente', 'Residente de Obra'),
  ('rol-finanzas', 'Finanzas');
```

### Comandos para CI

```bash
# Test unitarios de un servicio
cd services/auth && npm run test

# Integration tests de un servicio (con PostgreSQL)
docker compose -f docker-compose.test.yml up -d postgres-test
cd services/auth && npm run test:integration
docker compose -f docker-compose.test.yml down

# Tests de eventos
docker compose -f docker-compose.test.yml up -d postgres-test rabbitmq-test
cd services/finanzas && npm run test:events
docker compose -f docker-compose.test.yml down

# E2E completo (Playwright)
docker compose -f docker-compose.test.yml up -d
cd tests && npm run test:e2e
docker compose -f docker-compose.test.yml down
```

---

## Mapa de pruebas actual de iRetum

> Esto debe actualizarse a medida que se agregan tests.

| Microservicio | Unit tests | Integration tests | Event tests | Estado |
|---|---|---|---|---|
| auth | ? | ? | N/A | ❓ Sin datos |
| gerencia-tecnica | ? | ? | N/A | ❓ Sin datos |
| compras | ? | ? | ? | ❓ Sin datos |
| finanzas | ? | ? | ? | ❓ Sin datos |
| control-obra | ? | ? | ? | ❓ Sin datos |
| personal | ? | ? | N/A | ❓ Sin datos |
| seguridad | ? | ? | N/A | ❓ Sin datos |
| contabilidad | ? | ? | ? | ❓ Sin datos |
| calidad | ? | ? | N/A | ❓ Sin datos |
| reportes | ? | ? | N/A | ❓ Sin datos |
| asistente-ia | ? | ? | N/A | ❓ Sin datos |
| ventas | — | — | — | 🆕 Pendiente |

## Herramientas necesarias (instalar en PC y CI)

- [ ] Jest + ts-jest
- [ ] Supertest
- [ ] Playwright
- [ ] k6 (solo CI, no local)
- [ ] Docker Compose para entornos de prueba
- [ ] GitHub Actions (runner CI)

---

## ⚠️ Anti-patrones de QA en iRetum

| Anti-patrón | Por qué no funciona | Alternativa |
|---|---|---|
| Querer 100% cobertura del legacy antes de avanzar | El proyecto nunca se termina — 60% de 12 servicios es mucho código | Escribir tests SOLO del código que se toca |
| Tests E2E sin tests unitarios | Cuando un E2E falla, no sabes qué servicio falló | Pirámide: muchos unit, algunos integration, pocos E2E |
| Mockear RabbitMQ en tests de integración | No pruebas el contrato real entre servicios | Usar RabbitMQ test container o instancia separada |
| Probar todo con datos reales de producción | Datos sensibles expuestos, seed impredecible | Seed controlado con datos sintéticos |
| Testear multi-tenant solo con un tenant | El aislamiento es la feature más fácil de romper | Siempre probar con 2+ tenants en paralelo |
| QA gate manual sin CI automatizado | Se salta cuando hay prisa | CI ejecuta el QA gate automáticamente en cada PR |
| Tests frágiles por depender de IDs autoincrementales | Un seed diferente cambia todos los IDs | Usar UUIDs en tests o buscar por campos únicos lógicos |