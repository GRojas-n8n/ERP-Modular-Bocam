# Memorando de decisión contable para B1 (y su relación con B2)

Fecha: 2026-09-30 · Destinatario: responsable contable · Estado: **pendiente de validación; no se implementa B1 ni se cambia ninguna cuenta hasta tenerla**.

Todos los importes de este documento son **ficticios**. Las cuentas y fórmulas salen del código (`apps/control-proyectos/src/main.ts`, `apps/contabilidad/src/mapper.ts`, `apps/contabilidad/prisma/seed_catalogo_cuentas.sql`) y del spec archivado `polizas-partida-doble`.

## 1. Qué se pide decidir y por qué

B1 alinea los eventos `control_obra.estimacion_aprobada` y `control_obra.avance_fisico_validado` con lo que exige Contabilidad. La alineación técnica es sencilla; lo que **no** es una decisión técnica es qué importe se contabiliza y cuándo. Hoy el código no lo define con claridad, y el spec solo dice "cargo 1200 / abono 4100" (estimación) y "cargo 5100 / abono 2100" (avance), sin precisar el importe.

Dato importante: hoy Contabilidad **descarta** ambos eventos (contrato incompatible), así que no hay asientos de estimación ni de avance. Al corregirlo, la decisión empezará a mover el libro real. Por eso conviene decidirla antes.

## 2. Datos de partida (cómo están las cuentas)

Catálogo sembrado: 1100 Bancos · 1200 Cuentas por Cobrar · 1300 Inventarios · 1400 Anticipos a Proveedores · 2100 Cuentas por Pagar · 2200 Nómina por Pagar · 2300 IVA Trasladado por Pagar · 4100 Ingresos por Contratos · 5100 Costo Directo de Obra · 5110 Materiales · 5120 Mano de Obra · 5130 Maquinaria y Equipo · 5140 Subcontratos · 6100 Gastos de Administración. **No existen** cuentas de IVA acreditable, de fondo de garantía por cobrar ni de obra ejecutada por facturar.

Asientos con partida doble solo desde el 2026-06-29 (`PARTIDA_DOBLE_CUTOFF`). La balanza de comprobación y el estado de resultados suman **todos** los movimientos por fecha de creación, sin filtrar por el estatus del asiento (`PROYECTADO`, `REVERTIDO`, etc.).

## 3. `estimacion_aprobada`

### Cómo se calcula hoy (Control-Proyectos)

Con importes ficticios, para una estimación cuyos avances validados suman:

| Concepto | Fórmula en el código | Ejemplo |
|---|---|---:|
| Subtotal (suma de `importe_periodo` de los avances) | Σ importe_periodo | 1,000,000.00 |
| Retención fondo de garantía | 5 % × subtotal | 50,000.00 |
| Base de IVA | subtotal − retención | 950,000.00 |
| IVA | 16 % × (subtotal − retención) | 152,000.00 |
| **Total neto (a programar como cobro)** | subtotal − retención + IVA | **1,102,000.00** |

Observaciones que el responsable contable debe validar:

1. El código calcula el IVA **después** de restar la retención. Fiscalmente lo usual es que el IVA se cause sobre el importe estimado completo y que la retención solo difiera el cobro. Con esa lectura el IVA sería 160,000 y el total a cobrar ahora 1,110,000.
2. El spec `avances-y-estimaciones` menciona `amortizacion_anticipo`, pero el código **no** la calcula. Si el contrato tiene anticipo, `total_neto` no lo refleja.
3. El evento hoy publica solo `total_neto`; Contabilidad exige `monto_total`, que nadie envía.

### Asiento vigente (según el mapper)

Una sola línea de partida doble: **cargo 1200 Cuentas por Cobrar / abono 4100 Ingresos por Contratos**, por `monto_total`. No hay separación de IVA ni de retención.

### Qué pasa según qué importe se use (ejemplo ficticio)

| Opción | Cargo 1200 | Abono 4100 | IVA 2300 | Comentario |
|---|---:|---:|---:|---|
| A. `subtotal` | 1,000,000 | 1,000,000 | — | Ingreso correcto, pero el IVA y la retención no se ven; el cobro real (1,102,000) no coincide con la cuenta por cobrar. |
| B. `total_neto` | 1,102,000 | 1,102,000 | — | **Sobrestima el ingreso** en 102,000: incluye IVA (152,000) y descuenta la retención (50,000) como si fuera ingreso. No recomendable. |
| C. Desglosado | 1,102,000 (+ 50,000 fondo de garantía por cobrar) | 1,000,000 | 152,000 | Correcto, pero exige una cuenta nueva (fondo de garantía por cobrar) y cambiar el spec de partida doble. |

Recomendación técnica (sujeta a validación): publicar `subtotal`, `retencion_fondo_garantia`, `iva` y `total_neto` en el evento (todo ya existe) para que la decisión contable no obligue a otro cambio de contrato, y arrancar con **A** hasta decidir **C**.

## 4. `avance_fisico_validado`

| Campo del evento | Qué es en Control-Proyectos | Equivale a lo que Contabilidad pide |
|---|---|---|
| `importe` | `importe_periodo` = cantidad del periodo × precio unitario del concepto | `monto_avaluado` (mismo significado: valor del avance del periodo) |
| `concepto` | Clave del catálogo (`concepto_presupuesto`, p. ej. "CIM-001"), estable | `codigo` |
| (no se publica) | `concepto_id` (UUID del catálogo de Gerencia Técnica), `importe_acumulado`, `porcentaje_avance` | opcional |

Asiento vigente: **cargo 5100 Costo Directo de Obra / abono 2100 Cuentas por Pagar**, por el importe del periodo.

Ejemplo ficticio: avance del mes de 400,000 → cargo 5100 400,000 / abono 2100 400,000. El costo **acumulado** (por ejemplo 1,300,000 tras tres periodos) no se registra en el asiento; solo el incremento del periodo.

Preguntas de fondo:

1. `importe_periodo` es cantidad × **precio unitario del presupuesto** (precio de venta/contrato), no el costo real incurrido. Reconocer con él un costo directo y una cuenta por pagar mezcla valor de obra ejecutada con costo. Contablemente, el avance es más naturalmente **ingreso devengado / obra ejecutada**, no costo.
2. La cuenta por pagar 2100 no corresponde a ningún proveedor identificado: nace de un avance, no de una factura.

## 5. `compras.oc_creada` y `PASIVO_PROYECTADO`

- Asiento: **cargo 5110 Materiales / abono 2100 Cuentas por Pagar**, por el `total` de la OC. Estatus del asiento: `PROYECTADO`.
- La OC `total` incluye IVA (subtotal + 16 %), de modo que el cargo a 5110 y el abono a 2100 incluyen IVA. No hay cuenta de IVA acreditable en el catálogo.
- **¿Afecta el libro real?** Sí. Los movimientos entran a `movimientos_poliza` (para fechas ≥ 2026-06-29), y la balanza y el estado de resultados los suman sin mirar el estatus `PROYECTADO`. Que se llame "proyectado" es una etiqueta del asiento, no una exclusión del libro. En la práctica, crear una OC ya reconoce costo de materiales y una cuenta por pagar.
- **¿Cuándo se revierte?** Al cancelarse la OC (`compras.oc_cancelada`): se crea otro asiento `REVERSION_PASIVO_PROYECTADO` (cargo 2100 / abono 5110) y el original pasa a `REVERTIDO`; el original **conserva sus movimientos**, por lo que el neto es cero pero se ven ambos asientos. **No** se revierte al recibir la mercancía ni al pagar: al pagar, el asiento `EGRESO` (cargo 2100 / abono 1100) liquida la cuenta por pagar, y el costo ya había sido reconocido al crear la OC.

Esto es lo que B2 desbloquea: hoy `oc_creada` se descarta, así que el pasivo proyectado no se genera. Al desplegar B2, el efecto contable descrito empezará a ocurrir. **Recomendación: validar esta sección antes de desplegar B2**, no solo B1.

## 6. Escenarios de duplicidad OC ↔ avance (importes ficticios)

Supuesto: una partida con obra que incluye materiales por 500,000 (sin IVA) que Compras adquiere con una OC; la misma obra se avanza y valúa en el mes.

| Paso | Evento | Asiento | Efecto |
|---|---|---|---|
| 1 | Se crea la OC por 580,000 (500,000 + IVA 80,000) | Dr 5110 580,000 / Cr 2100 580,000 | Costo de materiales y pasivo reconocidos |
| 2 | Se valida un avance del periodo de 500,000 (misma obra, valuada a precio de contrato) | Dr 5100 500,000 / Cr 2100 500,000 | **Segundo costo y segundo pasivo por el mismo trabajo** |
| 3 | Se paga al proveedor 580,000 | Dr 2100 580,000 / Cr 1100 580,000 | Liquida la primera cuenta por pagar |

Resultado: costo reconocido 1,080,000 (por un trabajo cuyo costo es ≈500,000 + IVA) y un saldo de 2100 de 500,000 que **nadie va a pagar** (el que nace del avance). El escenario se agrava con dos avances sucesivos sobre el mismo concepto si se cambiara a acumulado por error.

Escenario B: sin OC (mano de obra propia). El avance genera 5100/2100 pero no hay factura ni pago que liquide 2100: la cuenta por pagar queda abierta.

Escenario C: la estimación (paso posterior) reconoce el ingreso 4100 sobre los mismos avances. Con el avance ya tratado como costo, el resultado del periodo refleja ingreso (estimación) y costo doble (OC + avance).

Todas estas duplicidades desaparecen si se define con claridad cuál de los dos eventos es "el" reconocimiento del costo.

## 7. Decisiones concretas que debe tomar el responsable contable

1. **Momento de reconocimiento del ingreso.** ¿Al aprobar la estimación (hoy, cuenta 4100 vía el evento), o al validar cada avance (obra ejecutada), o al facturar? Si es al validar el avance, la estimación solo debe pasar de "obra ejecutada por facturar" a "cuenta por cobrar".
2. **Base del ingreso en la estimación.** `subtotal` (recomendado como punto de partida) frente a `total_neto` (incorrecto, incluye IVA y resta retención).
3. **Separación de IVA.** ¿Se registra IVA trasladado (2300, que ya existe) en la estimación? ¿Y IVA acreditable en la OC (cuenta que no existe)? Además, ¿el IVA se causa sobre el subtotal completo o sobre subtotal − retención, como calcula hoy el código?
4. **Tratamiento de la retención de fondo de garantía (5 %).** ¿Es cuenta por cobrar diferida (cuenta nueva) o se sigue dentro de 1200? ¿Cuándo se libera y cómo se registra su cobro?
5. **Amortización de anticipo.** El spec la menciona y el código no la calcula: ¿aplica, y en qué cuenta (1400 es anticipo a proveedores, no de clientes)?
6. **Momento de reconocimiento del costo.** ¿Al crear la OC (hoy `PASIVO_PROYECTADO`), al recibir la mercancía, al recibir la factura, o al validar el avance? Solo uno de los eventos debería reconocer el costo de un mismo insumo.
7. **Compromiso, pasivo proyectado y pasivo real.** Formalizar la diferencia:
   - *Compromiso presupuestal* (Finanzas, `monto_comprometido`): control de presupuesto, no es asiento contable.
   - *Pasivo proyectado* (Contabilidad, `PASIVO_PROYECTADO`): hoy **sí** entra al libro; ¿debe entrar, o debe quedar fuera de balanza y estado de resultados hasta la recepción/factura?
   - *Pasivo real*: cuenta por pagar exigible (recepción o factura).
8. **Semántica del avance.** ¿Es costo (5100/2100 como hoy), ingreso devengado, o solo un dato de control que no genera asiento? Si es control, B1 para avance se reduce a **no publicar/no consumir** para asientos.
9. **Reversiones.** ¿Un cambio de estimación o un avance rechazado posterior debe revertir el asiento? Hoy no existe evento de reversión para estos dos.

## 8. Qué se hará cuando se decida

- Con la decisión 2, 3 y 4: se ajusta el contrato de `estimacion_aprobada` (adición de campos) y el mapper, con spec y pruebas primero.
- Con la decisión 6 y 8: se decide si el consumo de `avance_fisico_validado` genera asiento, y se evita la duplicidad con la OC.
- Con la decisión 7: se ajusta si `PASIVO_PROYECTADO` entra o no en balanza/estado de resultados **antes** de desplegar B2.
- Ningún cambio de cuentas ni de reportes se hará sin la respuesta escrita del responsable contable.
