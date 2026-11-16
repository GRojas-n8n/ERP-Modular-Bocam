# Formulario de decisión contable (para aprobación del responsable contable)

Contexto: [memo-decision-b1-contabilidad.md](./memo-decision-b1-contabilidad.md) (fusionado en #183). Este formulario **no contiene respuestas ni asientos definitivos**: las opciones son las posibles, no propuestas. Mientras no esté aprobado, permanecen bloqueados **B1** (`estimacion_aprobada`, `avance_fisico_validado`) y el **despliegue de #182** (`compras.oc_creada`, que haría efectivo el asiento `PASIVO_PROYECTADO`: cargo 5110 / abono 2100).

Catálogo de cuentas actual (`seed_catalogo_cuentas.sql`): 1100 Bancos · 1200 Cuentas por Cobrar · 1300 Inventarios · 1400 Anticipos a Proveedores · 2100 Cuentas por Pagar · 2200 Nómina por Pagar · 2300 IVA Trasladado por Pagar · 4100 Ingresos por Contratos · 5100 Costo Directo de Obra · 5110 Materiales · 5120 Mano de Obra · 5130 Maquinaria y Equipo · 5140 Subcontratos · 6100 Gastos de Administración. No existen cuentas de IVA acreditable, fondo de garantía por cobrar ni obra ejecutada por facturar.

Hechos del sistema relevantes (ver memorando): los asientos generan partida doble desde 2026-06-29; la balanza de comprobación y el estado de resultados suman todos los movimientos **sin filtrar por el estatus** del asiento (`PROYECTADO` incluido); hoy no hay eventos de recepción ni de factura que generen asientos.

| # | Pregunta | Opciones posibles (marque una o describa) | Respuesta |
|---|---|---|---|
| 1 | ¿Cuándo nace el **compromiso** presupuestal de una OC? | ☐ Al emitir la OC ☐ Al recibir la mercancía ☐ Otro: ____ | |
| 2 | ¿Cuándo nace el **pasivo real** (cuenta por pagar exigible)? | ☐ Al crear la OC ☐ Al recibir la mercancía ☐ Al recibir la factura ☐ Otro: ____ | |
| 3 | ¿Cuándo se reconoce el **costo**? | ☐ Al crear la OC ☐ Al recibir ☐ Al facturar ☐ Al validar el avance ☐ Otro: ____ | |
| 4 | ¿Una OC debe aparecer en el **libro contable** o solo en el **control presupuestal**? | ☐ Solo control presupuestal (fuera de balanza y estado de resultados) ☐ Libro contable con tratamiento distinto de lo devengado ☐ Libro contable sin distinción | |
| 5 | Cuentas e importe (con o sin IVA) aplicables a la OC | Cuenta de costo/inventario: ____ · IVA acreditable (cuenta a crear): ____ · Importe: ☐ con IVA ☐ sin IVA | |
| 6 | Estimaciones: ¿sobre qué importe se reconoce el ingreso? | ☐ Subtotal ☐ Total neto ☐ Otro: ____ | |
| 7 | IVA de la estimación: ¿base y cuenta? | ☐ Sobre subtotal completo ☐ Sobre subtotal menos retención (como calcula hoy el código) · Cuenta IVA: ____ | |
| 8 | Retención de fondo de garantía (5 %): ¿cómo se registra y cuándo se libera? | ☐ Cuenta nueva por cobrar ☐ Dentro de 1200 ☐ Otro: ____ · Liberación: ____ | |
| 9 | Amortización de anticipo (el spec la menciona; el código no la calcula): ¿aplica? | ☐ No aplica ☐ Aplica · Cuenta: ____ · Fórmula: ____ | |
| 10 | ¿El **avance físico validado** genera asiento? ¿Qué representa? | ☐ Costo ☐ Ingreso devengado (obra ejecutada) ☐ Solo control, sin asiento | |
| 11 | Reversión y cancelación: ¿qué eventos revierten y cómo? | OC cancelada: ____ · Estimación/avance rechazado o corregido: ____ · Método: ☐ asiento inverso ☐ cancelar el original | |
| 12 | Autorización y vigencia de la regla | Responsable: ____ · Fecha de aprobación: ____ · Aplica desde: ____ · ¿Aplica a asientos anteriores?: ☐ Sí ☐ No | |

## Aprobación

- Nombre y cargo del responsable contable: ____________________
- Fecha: ____________________
- Firma / evidencia de aprobación (referencia): ____________________

Tras la aprobación se abrirá el change correspondiente (B1 y/o ajuste de `PASIVO_PROYECTADO`) con spec y pruebas primero. Ningún asiento ni cuenta cambia antes.
