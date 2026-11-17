## 1. Inventario

- [x] 1.1 Listar todas las suscripciones de `apps/*` con su evento, cola, handler e idempotencia actual. Evidencia: `audit-2026-09-29.md` §2 (~47 suscripciones más el worker SAT, incluido el cliente propio de Gerencia Técnica).
- [x] 1.2 Clasificar cada suscripción como crítica, relevante o informativa, con la consecuencia de perder el evento. Evidencia: `audit-2026-09-29.md` §2, columna "Clase".
- [x] 1.3 Documentar el comportamiento actual ante un error del handler en cada una. Evidencia: `audit-2026-09-29.md` §2 (valores por defecto, excepciones y columna "Falla del handler") y §3.
- [x] 1.4 Matriz de contratos publicador→consumidor: documentar los tres contratos incompatibles (`estimacion_aprobada`, `avance_fisico_validado`, `oc_creada`). Evidencia: `audit-2026-09-29.md` §3. (La matriz de contratos de los demás eventos se completa en cada lote.)
- [x] 1.5 Inventariar las pruebas que usan payloads distintos a los del publicador real. Evidencia: `audit-2026-09-29.md` §3 (tres archivos de Contabilidad; los demás servicios sin verificar, se revisan en su lote).

## 2. Colas

- [ ] 2.1 **Titular:** listar en modo solo lectura las colas sin consumidor con su última actividad conocida y volver a medir las cifras de RabbitMQ (comando (b) de `audit-2026-09-29.md` §8). Opcional y recomendado: (a) y (c) para confirmar el hallazgo de Contabilidad.
- [ ] 2.2 Proponer retiro o conservación de cada una. Ningún retiro se ejecuta sin autorización expresa.

## 3. Decisión

- [ ] 3.1 Definir la política de fallo por suscripción (parámetros de reintento y espera) y cerrar la convención versionada de nombres de cola con su procedimiento de rollback (design, decisión 6).
- [ ] 3.2 Definir el monitoreo de las colas de mensajes fallidos y el procedimiento de reproceso.
- [ ] 3.3 Redactar el plan de adopción por lotes con los criterios de prueba de cada uno (borrador del orden y las dependencias en design, decisión 7; se cierra con los criterios de prueba).
- [ ] 3.4 **Titular:** decidir el contrato canónico de B1 y la opción de B2 (añadir `presupuesto_id` al publicador o relajar los consumidores).

## 4. Cierre de la auditoría

- [ ] 4.1 Crear un change por lote de adopción; cada uno con su spec, pruebas primero y PR propio. Lotes previstos, en orden recomendado (sin crear todavía código ni changes):
  - B1 `estimacion_aprobada` y `avance_fisico_validado` — Control de Proyectos + Contabilidad.
  - B2 `compras.oc_creada` con `presupuesto_id` — Compras.
  - L1 Compras — Compras.
  - L2 Contabilidad — Contabilidad (después de B1 y B2).
  - L3 Finanzas — Finanzas (después de B1 y B2).
  - L4 Control-Proyectos — Control de Proyectos.
  - L5 Gerencia Técnica — Gerencia Técnica.
  - L6 informativos y legacy — Almacén, Calidad, Seguridad, Ventas y Personal.
  - Change separado de confiabilidad de publicadores (outbox y confirmación) — fuera de este change; responsable por definir.
- [ ] 4.2 Archivar este change tras aprobar el plan.
- [ ] 4.3 Con este change fusionado, las tareas 1.1 a 1.3 cerradas con evidencia y los lotes listados en 4.1 con responsable, la tarea 7.3 de `fix-ingresos-almacen-por-recepcion-oc` puede darse por transferida a este change. Ese otro change se actualiza en su propio PR, no en este.
