# Checkpoint: Hito 7 - Reconciliacion de OCs y Estimaciones

**Fecha:** 2026-03-17  
**Estado:** Flujo de recuperacion operativa implementado  
**Responsable:** Codex

---

## 1. Objetivo

Este hito extiende el hardening previo en dos frentes:

1. Crear un proceso de reconciliacion para OCs en `ERROR_FINANZAS` o `CANCELACION_PENDIENTE`.
2. Llevar la misma logica de saga e idempotencia a `Control de Obra` cuando una estimacion dispara efectos financieros en `Finanzas`.

---

## 2. Cambios implementados

### A. Reconciliacion operativa en `Compras`

Archivo principal:

- [apps/compras/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/compras/src/main.ts)

Se agregaron dos capacidades nuevas:

- `GET /api/v1/compras/ordenes-compra/reconciliacion/pendientes`
  - Lista OCs atascadas en:
    - `ERROR_FINANZAS`
    - `CANCELACION_PENDIENTE`

- `POST /api/v1/compras/ordenes-compra/:id/reconciliar-finanzas`
  - Reintenta el efecto financiero según el estado actual:
    - si la OC está en `ERROR_FINANZAS`, vuelve a intentar `comprometer-fondos`
    - si está en `CANCELACION_PENDIENTE`, vuelve a intentar `liberar-fondos`

Resultado:

- Ya existe un proceso formal para recuperar OCs incompletas.
- La operación ya no depende de intervención manual directa en base de datos.

### B. Saga financiera para estimaciones en `Control de Obra`

Archivos:

- [apps/control-obra/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/main.ts)
- [apps/control-obra/src/types.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/control-obra/src/types.ts)

La aprobación de estimaciones ya no sigue el patrón “aprueba y si Finanzas falla no pasa nada”.

Nuevo flujo:

1. La estimación pasa a `PENDIENTE_CONFIRMACION_FINANZAS`.
2. Se intenta programar el pago en `Finanzas`.
3. Si falla, la estimación pasa a `ERROR_FINANZAS`.
4. Si confirma, la estimación pasa a `APROBADA_FINANCIERA`.
5. Solo después se emite el evento `control_obra.estimacion_aprobada`.

Estados nuevos formalizados:

- `PENDIENTE_CONFIRMACION_FINANZAS`
- `ERROR_FINANZAS`

Resultado:

- La trazabilidad del workflow técnico-financiero ya es explícita.
- Una estimación no queda falsamente “aprobada” si la programación financiera falló.

### C. Reconciliacion de estimaciones en `Control de Obra`

Se agregaron dos endpoints nuevos:

- `GET /api/v1/control-obra/estimaciones/reconciliacion/pendientes`
  - Lista estimaciones en:
    - `PENDIENTE_CONFIRMACION_FINANZAS`
    - `ERROR_FINANZAS`

- `POST /api/v1/control-obra/estimaciones/:id/reconciliar-finanzas`
  - Reintenta la programación financiera para la estimación.
  - Si `Finanzas` responde bien, la estimación pasa a `APROBADA_FINANCIERA`.

Resultado:

- El equipo operativo ya tiene un proceso de recuperación parecido al de OCs.

### D. Idempotencia extendida en `Finanzas`

Archivo:

- [apps/finanzas/src/main.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/finanzas/src/main.ts)

Además de lo ya implementado en compromisos/liberaciones, ahora:

- `POST /api/v1/finanzas/pagos`
  - si ya existe un `ProgramaPago` con la misma referencia:
    - `referencia_modulo`
    - `referencia_entidad`
    - `referencia_id`
  - devuelve el registro existente en lugar de duplicarlo.

Resultado:

- Las estimaciones reconciliadas o reintentadas no duplican pagos programados.

### E. Compatibilidad con middleware compartido

Archivos:

- [packages/auth-middleware/src/types.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/auth-middleware/src/types.ts)
- [packages/auth-middleware/src/middleware.ts](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/packages/auth-middleware/src/middleware.ts)

Se añadió `userName` como alias en `SecurityContext` para que módulos heredados como `Control de Obra` no queden desalineados respecto a `name`.

---

## 3. Validación realizada

Validaciones exitosas:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`
- `npx tsc --noEmit -p packages/auth-middleware/tsconfig.json`

Validación parcial:

- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`

Resultado:

- La lógica nueva de saga/reconciliación quedó limpia.
- El único error restante fue:
  - falta `apps/control-obra/src/generated/prisma`

Eso corresponde a una deuda previa del módulo y no a esta implementación.

---

## 4. Impacto arquitectónico

Después de este hito, el SaaS mejora en cuatro cosas:

1. **Operación recuperable**
   - Ya hay procesos explícitos para recuperar transacciones partidas.

2. **Coherencia inter-módulo**
   - `Compras` y `Control de Obra` ya siguen un patrón homogéneo frente a `Finanzas`.

3. **Idempotencia**
   - Reintentos de compromiso, liberación y programación de pago ya no duplican efectos.

4. **Trazabilidad de estados**
   - Los errores financieros quedan visibles en el dominio funcional.

---

## 5. Siguiente paso recomendado

Lo que sigue ahora, para completar esta línea de madurez:

1. Generar o restaurar `generated/prisma` en `control-obra`.
2. Agregar pruebas E2E de reconciliación:
   - OC con fallo de compromiso y posterior recuperación
   - OC con cancelación pendiente y posterior liberación
   - estimación con fallo de programación y posterior reconciliación
3. Emitir eventos específicos de error:
   - `compras.oc_reconciliada`
   - `control_obra.estimacion_reconciliada`
4. Crear un job administrativo para reconciliación masiva automática.

---

*Propiedad Intelectual: Constructora Bocam, S. A. de C.V. - Estrictamente Confidencial.*
