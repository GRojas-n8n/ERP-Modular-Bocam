# Retrofit Tests — Cobertura QA del código existente

> Cómo agregar tests al 60% de iRetum que ya está implementado, sin reescribirlo.

## Principio

No se hace TDD sobre código que ya existe. No se escriben specs para lo que ya funciona.
Se aplica **Characterization Testing** — tests que capturan el comportamiento actual
para que cualquier cambio futuro lo rompa intencionalmente (y se sepa).

**Proceso:** `curl real → test automatizado → baseline → suite de regresión`

---

## Prioridad (por impacto de negocio)

| Orden | Microservicio | # Endpoints estimados | Riesgo si falla |
|---|---|---|---|
| 1 | Auth (3003) | ~6 | Nadie entra al sistema |
| 2 | Finanzas (3004) | ~15 | Compromisos duplicados, pagos incorrectos |
| 3 | Compras (3002) | ~20 | OC sin presupuesto, proveedores mal pagados |
| 4 | Control de Obra (3005) | ~15 | Estimaciones incorrectas, QR sin efecto |
| 5 | Gerencia Técnica (3001) | ~12 | Catálogo de insumos corrupto, APUs mal calculados |
| 6 | Personal (3006) | ~10 | Nóminas mal liquidadas |
| 7 | Contabilidad (3008) | ~8 | Timbrado incorrecto, SAT rechaza |
| 8 | Seguridad (3007) | ~6 | Permisos alto riesgo sin control |
| 9 | Calidad (3009) | ~8 | ISO 9001 pierde certificación |
| 10 | Reportes (3010) | ~4 | Dashboard vacío |
| 11 | Asistente IA (3011) | ~2 | Narrativa falla, alertas no llegan |
| 12 | Ventas (3012) | — | Módulo nuevo — SDD + TDD puro |

---

## Método: Caracterización por endpoint

### Paso 1 — Descubrimiento del endpoint

Desde terminal, pegarle al endpoint real de iRetum para ver qué responde:

```bash
# Ejemplo: login
curl -s -X POST https://iretum.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@bocam.com","password":"test123"}' | jq .
```

O si es interno (Docker):

```bash
curl -s http://localhost:3003/api/auth/login -X POST ...
```

### Paso 2 — Documentar el contrato observado

```typescript
// services/auth/__tests__/contract/login.contract.ts
// GENERADO POR CARACTERIZACIÓN — documenta el comportamiento actual

test('POST /api/auth/login responde con token y usuario', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@bocam.com', password: 'test123' });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('token');
  expect(res.body).toHaveProperty('usuario');
  expect(res.body.usuario).toHaveProperty('rol');
  expect(typeof res.body.token).toBe('string');
});
```

### Paso 3 — Caracterizar variantes

```typescript
test('POST /api/auth/login con contraseña incorrecta da 401', ...)
test('POST /api/auth/login con email inexistente da 404', ...)
test('POST /api/auth/login sin body da 400', ...)
```

### Paso 4 — Agregar al suite de regresión

Una vez que el test pasa, queda como baseline.
Si alguien cambia el endpoint y el test falla, sabes exactamente qué cambió.

---

## Script de descubrimiento automático

Para acelerar, se puede usar un script que recorre los endpoints documentados y genera el esqueleto del test:

```typescript
// tools/characterize.ts — script único para descubrir endpoints
import fetch from 'node-fetch';

const ENDPOINTS = [
  { method: 'GET', path: '/api/auth/me', auth: true },
  { method: 'POST', path: '/api/auth/login', body: { email: 'admin@bocam.com', password: 'test123' } },
  { method: 'GET', path: '/api/compras/oc', auth: true },
  { method: 'POST', path: '/api/compras/oc', auth: true, body: {...} },
  // ... todos los endpoints de los 12 servicios
];

for (const ep of ENDPOINTS) {
  const res = await fetch(`http://localhost:${PORT_MAP[ep.service]}${ep.path}`, {
    method: ep.method,
    headers: { 'Content-Type': 'application/json', ...(ep.auth && { Authorization: `Bearer ${TOKEN}` }) },
    body: ep.body ? JSON.stringify(ep.body) : undefined,
  });
  const data = await res.text();
  console.log(`${ep.method} ${ep.path} → ${res.status}`);
  console.log(data.slice(0, 500));
}
```

---

## Orden de ejecución

Sugiero empezar con Auth + Finanzas (el mayor riesgo financiero).

### Sprint 1 — Auth (1 día)

```markdown
- [ ] Descubrir endpoints GET/POST de auth
- [ ] Escribir tests de caracterización para login (éxito, error, timeout)
- [ ] Escribir tests de caracterización para JWT (expirado, inválido, sin token)
- [ ] Escribir tests de caracterización para RBAC (rol correcto, rol sin permiso)
- [ ] CI: estos tests corren en cada PR
```

### Sprint 2 — Finanzas (2-3 días)

```markdown
- [ ] Endpoints de presupuesto: GET, PUT, suficiencia
- [ ] Endpoints de compromiso/liberación
- [ ] Endpoints de pagos
- [ ] Eventos: RabbitMQ handler de eventos entrantes
- [ ] Idempotencia: mismo evento dos veces no duplica
```

### Sprint 3 — Compras (2-3 días)

```markdown
- [ ] OC: CRUD + conversión desde cotización
- [ ] Flujo OC → evento → finanzas compromete
- [ ] Validación de presupuesto antes de crear OC
```

### Sprint 4 — Control de Obra + Personal (2 días)

```markdown
- [ ] Asistencia QR: registro y consulta
- [ ] Estimaciones: creación, cálculo, evento a finanzas
- [ ] Empleados: CRUD, cálculo IMSS/ISR
```

---

## ⚠️ Reglas importantes

1. **No modificar código legacy para hacerlo "testeable"**. Si el endpoint no es fácil de probar, el test se escribe igual — el test documenta lo que el endpoint hace hoy. Si está mal, se arregla en otro PR.

2. **Si el test revela un bug, el bug se documenta en spec**. El test de caracterización documenta el bug. Luego el flujo normal de SDD: spec del bug → fix → test pasa.

3. **Endpoint no documentado ≠ endpoint roto**. Si no hay Swagger/OpenAPI, los endpoints se descubren con `curl` y `jq`, no asumiendo nada.

4. **Tests frágiles = tests valiosos en caracterización**. Un test que falla por un cambio mínimo te dice EXACTAMENTE qué cambió en el contrato. No los hagas "resilientes" — hazlos precisos.

5. **No perseguir cobertura del legacy**. Los tests de caracterización cubren los endpoints de mayor riesgo. No hace falta testar cada helper interno del 60% legacy. El objetivo es **proteger el contrato de API**, no la implementación interna.