## Context

Consumidores identificados por búsqueda estática de `eventBus.subscribe` el 2026-09-25:

| Servicio | Suscripciones | Observaciones |
|---|---:|---|
| `compras` | 7 | fondos comprometidos y liberados, presupuesto insuficiente, OC pagada total y parcial, transferencia de partida aprobada, centro de costos creado |
| `contabilidad` | 10 + worker SAT | eventos financieros, de nómina y de obra; el worker SAT ya tiene reintento y DLQ |
| `control-proyectos` | 6 | centro de costos, pago registrado, salida de obra, OC creada y cancelada |
| `calidad`, `seguridad`, `ventas` | 1 cada uno | solo centro de costos creado |
| `almacen` | 3 | dos de recepción de OC (cubiertas por `fix-ingresos-almacen-por-recepcion-oc`) y centro de costos |

En RabbitMQ: 67 colas, 20 sin consumidor y 2 con exchange de mensajes muertos. Ninguna política global define DLX.

## Goals / Non-Goals

**Goals**

- Un inventario completo y una clasificación por riesgo.
- Una decisión explícita y documentada por suscripción.
- Un plan de adopción por lotes con criterios de prueba.

**Non-Goals**

- Cambiar consumidores en esta fase.
- Aplicar políticas globales de RabbitMQ ni modificar colas durables existentes.
- Rediseñar los contratos de los eventos.

## Decisions

### 1. Clasificación por consecuencia de la pérdida

Cada suscripción se clasifica como **crítica** (pérdida afecta dinero, inventario, nómina o cumplimiento fiscal), **relevante** (afecta proyecciones o alertas recuperables) o **informativa** (solo registro).

### 2. Política mínima por clase

Crítica: reintentos con espera y DLQ, idempotencia comprobada por prueba, y monitoreo. Relevante: reintentos y DLQ. Informativa: DLQ o descarte explícito y documentado.

### 3. Sin cambios en colas existentes

RabbitMQ no permite redeclarar una cola durable con argumentos distintos. La adopción usa colas nuevas por suscripción, con el mismo criterio del change de recepciones.

### 4. Colas sin consumidor

Se inventarían con su última actividad conocida y se propone retirar las que pertenezcan a servicios ya retirados o a pruebas. Ningún retiro se ejecuta sin autorización expresa.

### 5. Lotes de adopción

Por riesgo descendente: contabilidad y compras primero, después control-proyectos, y al final las informativas.

## Risks / Trade-offs

- Activar reintentos sin idempotencia comprobada puede duplicar efectos: se exige la prueba antes de cada adopción.
- Una DLQ sin vigilancia solo traslada la pérdida: el monitoreo es parte de cada lote.
