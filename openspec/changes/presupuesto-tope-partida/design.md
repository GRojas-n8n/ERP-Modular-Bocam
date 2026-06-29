## Context

El presupuesto APU en GT tiene `precio_unitario × cantidad` por concepto, pero ese número nunca se convirtió en un control operativo. Compras genera OC sin saber si una partida tiene saldo. El resultado son sobre-costos por partida que solo se detectan al revisar manualmente los reportes.

`PresupuestoAsignado` en Finanzas controla fondos a nivel proyecto (bolsa total). Este change añade un segundo nivel: la partida del catálogo de conceptos.

**Restricción clave:** No podemos usar el endpoint de Finanzas para esto. `PresupuestoAsignado` no tiene granularidad por concepto y agregar esa dimensión requeriría refactorizar Finanzas (out of scope). Por eso `SaldoPartida` vive en GT, que ya tiene el presupuesto por concepto.

## Goals / Non-Goals

**Goals:**
- Hard block en generación de OC cuando partida agotada
- Soft block en aprobación de req (estado `PENDIENTE_TRANSFERENCIA`) con visibilidad en CP
- Saldo actualizado en tiempo real vía B2B calls de Compras/Personal → GT
- Evento `gerencia_tecnica.partida_bloqueada` para alertas en CP
- Escape de emergencia auditado: director puede anular bloqueo con justificación

**Non-Goals:**
- Transferencias entre partidas (eso es `transferencia-entre-partidas` spec separado)
- Tope en nómina (se añade en una segunda iteración cuando `nomina-a-contabilidad` esté en prod)
- Reporte de variaciones presupuestales (es feature de CP, no de GT)

## Decisions

### Decisión 1: SaldoPartida vive en GT, no en Finanzas

**Alternativas consideradas:**
- A) Extender `PresupuestoAsignado` con `concepto_id` — requeriría cambiar el esquema de Finanzas, afectaría sus reportes existentes y mezclaría dos dominios
- B) Crear microservicio de presupuesto independiente — overhead innecesario para un único módulo nuevo
- **C) SaldoPartida en GT** — GT ya tiene `Concepto` con `precio_unitario × cantidad`; la tabla nueva es un derivado directo del presupuesto aprobado. Menor acoplamiento, sin romper Finanzas.

### Decisión 2: Compras llama a GT en tiempo real (B2B), no vía eventos

Para la verificación (¿puedo generar esta OC?), necesito respuesta síncrona. El flujo es:
```
POST /ordenes-compra
  → GET /api/v1/gerencia-tecnica/partidas/:id/saldo   (B2B interno)
  → si disponible OK → continuar
  → POST /api/v1/gerencia-tecnica/partidas/:id/comprometer (B2B interno)
  → crear OC en BD
```

Timeout: 2 segundos. Si GT no responde → la OC se genera con warning en log (fail-open para no bloquear operaciones por falla de red interna). En producción ambos servicios están en la misma Docker network, latencia <5ms.

**Fail-open justificado:** Es preferible que una OC se genere sin verificar a que la operación quede bloqueada por un timeout. El CP detectará la desviación mediante alertas de saldo.

### Decisión 3: Saldo es acumulador, no calculado en tiempo real

`monto_disponible` se mantiene actualizado incrementalmente en cada operación. No se recalcula consultando todas las OC y pagos en cada request. Esto es:
- Más rápido en lectura (un solo campo)
- Más simple en el gate de verificación
- **Riesgo:** posible desfase si un evento falla. Mitigación: job de reconciliación diaria que recalcula desde las OC y pagos reales.

### Decisión 4: Estado PENDIENTE_TRANSFERENCIA en req — sin bloqueo hard en req

Para requisiciones, optamos por bloqueo suave: la req pasa a `PENDIENTE_TRANSFERENCIA` en lugar de rechazarla. Razón: una req rechazada requiere re-crearla; una req en `PENDIENTE_TRANSFERENCIA` puede desbloquearse automáticamente cuando llegue la transferencia. Mejor UX y menos pérdida de trabajo.

## Risks / Trade-offs

**Riesgo: Desfase en saldo por falla B2B**
→ Si el `POST /comprometer` de Compras falla después de que la OC se creó, el saldo no se actualiza.
→ Mitigación: job diario de reconciliación (`SaldoReconciliacion`) que recalcula `monto_comprometido` desde todas las OC EMITIDA del proyecto.

**Riesgo: Presupuestos aprobados antes de este change**
→ Proyectos activos no tienen `SaldoPartida`. El gate verificaría contra un saldo inexistente y fallaría open.
→ Mitigación: endpoint de migración `POST /api/v1/gerencia-tecnica/saldo-partida/inicializar-proyecto?proyecto_id=` que crea los registros desde los presupuestos aprobados existentes. Solo admin.

**Trade-off: Complejidad en Compras**
→ Compras ahora tiene dependencia de GT para generar OC. Si GT está caído, Compras opera en modo degradado (fail-open con log).
→ Aceptable porque en prod ambos servicios están en misma red Docker.

## Migration Plan

1. Deploy GT con nueva tabla `SaldoPartida` (migration Prisma)
2. Ejecutar script de inicialización para proyectos activos (admin endpoint)
3. Deploy Compras con verificación B2B (fail-open) — no rompe funcionalidad existente
4. Activar evento `gerencia_tecnica.partida_bloqueada` en RabbitMQ
5. Deploy CP (cuando esté listo) para consumir el evento y generar alertas

Rollback: eliminar la verificación B2B en Compras y desactivar el evento. SaldoPartida queda como tabla muerta sin efectos.
