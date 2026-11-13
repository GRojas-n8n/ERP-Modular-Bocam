## MODIFIED Requirements

### Requirement: Los errores de Finanzas SHALL tener un formato único
Toda respuesta de error SHALL ser `{ success: false, error: { code, message } }` con un código estable. Un 500 no
SHALL exponer el mensaje interno de la excepción.

### Requirement: Los listados SHALL paginarse por llave
`/pagos`, `/pagos-oc` y `/movimientos` SHALL aceptar `limit` (1 a 500) y `cursor`, y SHALL devolver
`meta.paginacion.next_cursor`. Recorrer todas las páginas SHALL devolver cada fila exactamente una vez, en el mismo
orden que sin paginar.

#### Scenario: Cursor inválido
- **WHEN** el cursor no fue emitido por el servicio
- **THEN** SHALL responder 400 `FIN_CURSOR_INVALIDO`

### Requirement: El dashboard SHALL reflejar bancos, cuentas por pagar y por cobrar reales
`GET /dashboard` SHALL devolver `kpis`, `alertas` y `actividad_reciente`, con el saldo de las cuentas bancarias activas,
las OCs por pagar y las cuentas por cobrar del proyecto activo.
