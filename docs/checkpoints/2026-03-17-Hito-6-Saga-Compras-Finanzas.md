# Checkpoint: Hito 6 - Saga Compras / Finanzas

**Fecha:** 2026-03-17  
**Estado:** Endurecimiento aplicado sobre el flujo crítico de Órdenes de Compra  
**Responsable:** Codex

---

## 1. Objetivo

Después del Hito 5, el siguiente riesgo mayor seguía siendo la consistencia entre `Compras` y `Finanzas`.

Antes:

- `Compras` hablaba con `Finanzas` dentro del mismo callback transaccional de Prisma.
- Si la red fallaba en un momento intermedio, era fácil dejar estados ambiguos.
- `Finanzas` no era idempotente para compromisos/liberaciones de la misma OC.

En este hito se corrigió eso con un patrón de saga simplificado y reintentos seguros.

---

## 2. Cambios implementados

### A. `Compras` ya no mezcla transacción local con llamada remota

Se reescribió el flujo de conversión de comparativa a OC en:

- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts)

Nuevo comportamiento:

1. Se lee la comparativa ganadora dentro de contexto local.
2. Se valida suficiencia presupuestal en `Finanzas` fuera de la transacción local.
3. Se crea la OC en estado transitorio `PENDIENTE_CONFIRMACION_FINANZAS`.
4. Se intenta comprometer fondos en `Finanzas`.
5. Si `Finanzas` falla, la OC queda en `ERROR_FINANZAS`.
6. Si `Finanzas` confirma, la OC pasa a `EMITIDA` y se cierra la comparativa.

Resultado:

- Ya no se mantiene una transacción SQL abierta durante una llamada HTTP.
- El estado local refleja mejor si el problema fue interno o financiero.

### B. Cancelación de OC con estado transitorio real

También se reescribió la cancelación:

- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts)

Nuevo comportamiento:

1. Se valida que la OC sea cancelable.
2. Si tiene `presupuesto_id`, la OC pasa a `CANCELACION_PENDIENTE`.
3. Se solicita la liberación a `Finanzas`.
4. Si `Finanzas` confirma, la OC pasa a `CANCELADA`.
5. Si `Finanzas` no confirma, la OC se queda explícitamente en `CANCELACION_PENDIENTE`.

Resultado:

- Ya no se “finge” una cancelación completa cuando la liberación financiera falló.
- El equipo puede detectar y reconciliar pendientes operativos reales.

### C. `Finanzas` ahora es idempotente para OC repetidas

Se endurecieron estos endpoints:

- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts)

Cambios:

- `POST /comprometer-fondos`
  - Si ya existe un movimiento `COMPROMISO` para la misma `OrdenCompra`, regresa respuesta idempotente en vez de duplicar.

- `POST /liberar-fondos`
  - Si ya existe un movimiento `LIBERACION` para la misma `OrdenCompra`, regresa respuesta idempotente.
  - Ahora también valida que exista saldo comprometido suficiente antes de liberar.

Resultado:

- Los reintentos no generan doble compromiso ni doble liberación.
- Se reduce riesgo de corrupción financiera por errores de red o reenvíos del cliente.

---

## 3. Estados nuevos o formalizados

En `Compras` se formalizó el uso de estos estados operativos:

- `PENDIENTE_CONFIRMACION_FINANZAS`
- `ERROR_FINANZAS`
- `CANCELACION_PENDIENTE`
- `EMITIDA`
- `CANCELADA`

Esto no requirió migración estructural porque `estado` ya es `String` en:

- [apps/compras/prisma/schema.prisma](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/prisma/schema.prisma)

---

## 4. Validación realizada

Validaciones ejecutadas:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`

Ambas pasaron correctamente.

---

## 5. Impacto arquitectónico

Este hito mejora el SaaS en tres dimensiones:

1. **Consistencia distribuida**
   - Se evita mezclar transacción DB local con dependencia remota bloqueante.

2. **Recuperación operativa**
   - Los estados transitorios hacen visible cuándo una OC quedó a medio camino.

3. **Seguridad financiera**
   - `Finanzas` ya no duplica movimientos por reintentos del mismo caso de negocio.

---

## 6. Qué sigue después de este hito

Siguiente capa recomendada:

1. Crear un proceso de reconciliación para OCs en `ERROR_FINANZAS` y `CANCELACION_PENDIENTE`.
2. Emitir eventos específicos de error o compensación.
3. Llevar idempotencia también a `control-obra` cuando aprueba estimaciones.
4. Agregar pruebas E2E cruzadas entre `Compras` y `Finanzas`.

---

*Propiedad Intelectual: Constructora Bocam, S. A. de C.V. - Estrictamente Confidencial.*
