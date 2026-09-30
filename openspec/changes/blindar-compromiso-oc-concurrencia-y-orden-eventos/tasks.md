## 1. Evidencia previa

- [x] 1.1 Trazar los caminos de compromiso y liberación en `convertir-oc`, Finanzas y GT (revisión de repositorio, 2026-09-30).
- [x] 1.2 Consulta productiva agregada de solo lectura: duplicados de `COMPROMISO` y `LIBERACION`, compromisos sin liberación, liberaciones sin compromiso, restricciones e índices, aislamiento. Resultado: tabla vacía (0 filas); solo índices no únicos; `read committed`.
- [ ] 1.3 **Titular:** auditar los mismos conteos en los demás entornos con datos antes de la migración.

## 2. Pruebas obligatorias en rojo (PostgreSQL real, sin simular el motor; una por escenario)

- [ ] 2.1 HTTP `comprometer-fondos` y evento `oc_creada` concurrentes sobre la misma OC → un solo `COMPROMISO`, un solo incremento de `monto_comprometido`.
- [ ] 2.2 `partida_comprometida` y `oc_creada` concurrentes → un solo `COMPROMISO`.
- [ ] 2.3 Duplicado del mismo evento (secuencial y concurrente) → un solo efecto.
- [ ] 2.4 Cancelación antes de creación → sin compromiso residual tras procesar ambas; la creación tardía es un no-op.
- [ ] 2.5 Creación después de cancelación (misma OC ya cancelada) → sin compromiso nuevo.
- [ ] 2.6 `fondos_comprometidos` tardío sobre una OC `CANCELADA` (y sobre `RECIBIDA`/`PARCIALMENTE_RECIBIDA`) → el estado no cambia.
- [ ] 2.7 `presupuesto_insuficiente` tardío sobre una OC `EMITIDA` → el estado no cambia.
- [ ] 2.8 Liberación sin compromiso de esa OC → no libera; no consume el compromiso de otra OC del mismo presupuesto.
- [ ] 2.9 Dos cancelaciones concurrentes (HTTP y evento) → una sola `LIBERACION`.
- [ ] 2.10 Evento idempotente → no republica datos falsos.
- [ ] 2.11 Migración: con datos duplicados preexistentes aborta sin modificar nada; sin duplicados crea el índice; el rollback deja el esquema y los datos originales.

## 3. Implementación (fase posterior, PR propio por servicio)

- [ ] 3.1 Migración de Finanzas: auditoría de duplicados, índice único parcial, tabla de tombstone.
- [ ] 3.2 Finanzas: inserción atómica y advisory lock por OC en los tres caminos de compromiso y los dos de liberación.
- [ ] 3.3 Compras: transiciones condicionadas de `fondos_comprometidos` y `presupuesto_insuficiente`.
- [ ] 3.4 Eventos idempotentes sin datos falsos.

## 4. Cierre

- [ ] 4.1 Suite completa en verde en CI.
- [ ] 4.2 Confirmar que #182 puede reanudarse (junto con la aprobación contable).
- [ ] 4.3 Archivar el change.
