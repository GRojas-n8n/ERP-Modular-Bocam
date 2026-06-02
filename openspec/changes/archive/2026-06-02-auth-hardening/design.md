# Design — Auth Hardening

## Context

El módulo `auth` es el único punto de acceso a operaciones cross-tenant. Los endpoints
`/master/*` no pasan por el JWT middleware (línea 34 de main.ts: `excludePaths: ['/api/v1/master']`)
y solo validan el `MASTER_SECRET` via `requireMasterSecret`. Redis ya existe en la
infraestructura (`redis:6379` en la red Docker interna) y el módulo auth ya tiene
`REDIS_URL` disponible vía docker-compose. Solo hay que añadir las dependencias y el código.

## Goals

1. Rate limiting en Redis para frenar ataques de fuerza bruta en master y login
2. Trazabilidad completa de todas las operaciones master (quién, cuándo, qué)
3. Impacto mínimo en código existente — middleware y logging como capas adicionales

## Non-Goals

- Autenticación de dos factores (2FA) para el master
- Bloqueo permanente de IPs (solo throttling temporal)
- Audit log para operaciones de admin de tenant (usuarios, proyectos) — siguiente iteración
- Exportación del audit log a SIEM externo

---

## Schema Prisma — Nuevo Modelo

```prisma
// Sin tenant_id ni RLS — es tabla de sistema cross-tenant
model MasterAuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  accion      String   @db.VarChar(50)   // CREATE_TENANT | UPDATE_TENANT | DELETE_TENANT | LIST_TENANTS | GET_AUDIT_LOG
  entity_type String   @db.VarChar(30)   // tenant
  entity_id   String?  @db.Uuid          // id del tenant afectado (null en LIST)
  ip_address  String?  @db.VarChar(50)
  user_agent  String?  @db.VarChar(500)
  payload     Json?                       // body sanitizado (sin secrets)
  status_code Int                         // 200 | 201 | 400 | 401 | 404 | 500
  error_msg   String?  @db.Text          // Mensaje de error si status >= 400
  created_at  DateTime @default(now())

  @@index([created_at])
  @@index([entity_id])
  @@map("master_audit_logs")
}
```

**Sin RLS:** esta tabla es del sistema, no de un tenant. Se accede solo con `runAsSystem`.

---

## Rate Limiting — Configuración

| Endpoint | Window | Max requests | Key |
|---|---|---|---|
| `POST /api/v1/master/tenants` | 15 min | 5 | IP |
| `PATCH /api/v1/master/tenants/:id` | 15 min | 10 | IP |
| `DELETE /api/v1/master/tenants/:id` | 15 min | 5 | IP |
| `GET /api/v1/master/tenants` | 15 min | 30 | IP |
| `POST /api/v1/auth/login` | 15 min | 10 | IP |
| `POST /api/v1/auth/refresh` | 15 min | 20 | IP |

**Respuesta en 429:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Demasiadas solicitudes. Intenta de nuevo en X minutos.",
    "retry_after_seconds": 900
  }
}
```

---

## Implementación del Rate Limiter

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

const masterStrictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
  handler: (_req, res) => res.status(429).json({
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Demasiadas solicitudes.', retry_after_seconds: 900 }
  }),
});
```

---

## Audit Log — Patrón de Escritura

Cada handler de `/master/` sigue este patrón al final (tanto en éxito como en error):

```typescript
// Al final del handler, antes del return:
await runAsSystem(async (prisma) => prisma.masterAuditLog.create({
  data: {
    accion: 'CREATE_TENANT',
    entity_type: 'tenant',
    entity_id: tenant?.id_tenant ?? null,
    ip_address: req.ip,
    user_agent: req.headers['user-agent']?.slice(0, 500) ?? null,
    payload: { nombre, rfc, plan },   // nunca incluir el MASTER_SECRET
    status_code: statusCode,
    error_msg: errorMsg ?? null,
  },
}));
```

La escritura del audit log es **best-effort** (en un `try/catch` independiente) — si falla,
el resultado de la operación principal ya fue retornado. No bloquea el flujo.

---

## Decisions

**D1 — Redis para rate limiting (no in-memory)**
In-memory rate limiting no funciona si el contenedor se reinicia o si hay múltiples réplicas.
Redis ya está disponible en la red Docker interna. El módulo auth ya lo tiene en
`REDIS_URL` (docker-compose). Solo hay que conectarlo.

**D2 — Audit log best-effort**
Si la escritura del log falla (Redis o PG caído), la operación principal no debe
revertirse. El audit log es importante pero secundario al funcionamiento del sistema.

**D3 — Payload sanitizado**
El campo `payload` en `MasterAuditLog` guarda el body del request con campos sensibles
omitidos. Específicamente: nunca registrar el valor del `Authorization` header ni passwords.

**D4 — Rate limit separado por endpoint**
POST (crear tenant) tiene límite más estricto (5/15min) que GET (30/15min) porque la
creación de tenants falsos es el riesgo principal.

## Risks

**R1 — Redis no disponible al arrancar auth**
Si Redis no está listo cuando auth inicia, el rate limiter falla al conectar. Mitigación:
usar reconexión automática del cliente Redis y degradación elegante: si Redis no está
disponible, usar store en memoria como fallback temporal (loguear warning).

**R2 — IP spoofing detrás de Caddy**
Las IPs de request pueden ser `::1` (loopback) si Caddy no configura `X-Forwarded-For`.
Mitigación: configurar `app.set('trust proxy', 1)` para que Express lea el IP real
del header `X-Forwarded-For` configurado por Caddy.
