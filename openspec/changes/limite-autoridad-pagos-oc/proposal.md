## Why

Se marcó como sospechosa la diferencia entre `PATCH /pagos/:id/pagar`
(`admin`, `finanzas`) y `POST /pagos` (`admin`, `superintendent`, `finanzas`).
Al levantar la matriz completa de las 13 mutaciones de Finanzas, **no es una
inconsistencia**: es una segregación de funciones deliberada y consistente.

| Mutación | Roles | Límite de autoridad |
|---|---|---|
| `POST /presupuestos` | admin, superintendent, finanzas | sí |
| `POST /movimientos` | admin, superintendent, finanzas | sí |
| `POST /transferencias-presupuestales` | admin, superintendent, finanzas | **no** |
| `POST /comprometer-fondos` | + procurement | no |
| `POST /liberar-fondos` | + procurement | no |
| `POST /pagos` | admin, superintendent, finanzas | **no** |
| `POST /pagos/bulk` | admin, superintendent, finanzas | **no** |
| `PATCH /pagos/:id/pagar` | admin, finanzas | sí |
| `POST /cuentas-bancarias` (y PATCH/DELETE) | finanzas, admin | no |
| `POST /proyectos/:id/anticipo` | finanzas, admin | **no** |
| `POST /pagos-oc` | finanzas, admin | **no** |

Se leen dos niveles limpios: **planeación presupuestal**
(`admin`+`superintendent`+`finanzas`) y **tesorería, donde sale dinero**
(`admin`+`finanzas`). `PATCH /pagos/:id/pagar` está en el segundo junto con
`pagos-oc`, `cuentas-bancarias` y `anticipo`. Que un superintendente pueda
*programar* un pago pero no *ejecutarlo* es correcto, y el mensaje de error del
handler («Solo admin o finanzas pueden registrar pagos») confirma que fue una
decisión, no un descuido. **No hay nada que corregir en los roles.**

Lo que el barrido sí destapó es un problema real en la columna de al lado: el
**Límite de Autoridad Financiera se aplica en 3 de 13 mutaciones**, y falta
justamente en el camino de pago que usa la interfaz.

`POST /pagos-oc` registra el pago de una orden de compra: descuenta el saldo de
la cuenta bancaria (`saldo: { decrement: montoTotal }`) o consume el anticipo del
proyecto, y publica el evento de dominio que Contabilidad consume. Es dinero
saliendo. No valida `limiteAprobacion` en ningún punto. `FinanzasView` usa
exactamente este endpoint (`api.post('/api/v1/finanzas/pagos-oc', ...)`).

El resultado es un bypass con la misma consecuencia por dos caminos distintos:
un usuario con rol `finanzas` y límite de $10,000 recibe 403 `FIN_LIMIT_EXCEEDED`
si intenta ejecutar un pago programado de $500,000 vía `PATCH /pagos/:id/pagar`,
pero puede registrar ese mismo medio millón contra una OC vía `POST /pagos-oc`
—descontándolo de la cuenta bancaria— sin que nadie mire su límite.

El módulo declara en su propia cabecera: «Límites de Autoridad Financiera
validados antes de mutaciones». Hoy eso es cierto en 3 de 13.

## What Changes

- `POST /api/v1/finanzas/pagos-oc` SHALL validar `limiteAprobacion` contra el
  monto total del pago antes de descontar saldo o anticipo, rechazando con la
  misma forma de error que ya usa `PATCH /pagos/:id/pagar`
  (`FIN_LIMIT_EXCEEDED`).
- `POST /api/v1/finanzas/proyectos/:proyectoId/anticipo` y
  `POST /api/v1/finanzas/transferencias-presupuestales` SHALL validar el límite
  con el mismo criterio — ambos mueven montos sin control de autoridad hoy.
- Se documenta explícitamente en el código por qué `POST /pagos` y
  `/pagos/bulk` **no** validan el límite: programar un pago no mueve dinero, y el
  límite se ejerce al ejecutarlo. Sin ese comentario, el próximo barrido volverá
  a marcarlos como huecos.
- Los conjuntos de roles NO cambian. La segregación planeación/tesorería se
  documenta como intencional para que no se "corrija" por error.

## Out of scope

- `comprometer-fondos` y `liberar-fondos` no validan límite y así se quedan:
  congelar fondos no es sacar dinero, y el monto lo determina la OC ya aprobada
  en Compras, que tiene su propio control de límite.
- Las mutaciones de `cuentas-bancarias` no manejan monto propio.

## Capabilities

### New Capabilities
- `limite-autoridad-financiera`: formaliza en qué mutaciones de Finanzas se
  ejerce el Límite de Autoridad Financiera y en cuáles no, y por qué.
