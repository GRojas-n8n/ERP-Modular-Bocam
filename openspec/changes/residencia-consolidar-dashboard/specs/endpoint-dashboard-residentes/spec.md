## MODIFIED Requirements

### Requirement: Endpoint agregado de dashboard para residente
`apps/control-proyectos` SHALL exponer `GET /api/v1/control-proyectos/dashboard/residente?proyectoId=<uuid>`, protegido por `requireRoles('residencia', 'admin')`.

(Nota: el spec anterior documentaba `GET /api/v1/control-obra/dashboard/residente` — ruta que nunca existió en el código; esta es la ruta real, implementada en `apps/control-proyectos/src/main.ts`.)

La respuesta SHALL tener la forma:

```json
{
  "mis_requisiciones": 4,
  "estimaciones_pendientes": 2,
  "prenominas_pendientes": 3,
  "complementos_pendientes": 1,
  "ocs_por_recibir": [
    { "id": "uuid", "folio": "OC-2026-012", "proveedor": "Materiales SA", "monto": 85000.00, "estado": "EMITIDA" }
  ],
  "alertas": [
    { "tipo": "ESTIMACIONES_PENDIENTES", "mensaje": "2 estimacion(es) pendiente(s) de revisión", "severidad": "advertencia" }
  ],
  "parcial": false,
  "generado_at": "2026-08-21T10:00:00Z"
}
```

- `estimaciones_pendientes`: BD local — `Estimacion` con `estado` en
  `BORRADOR` o `EN_REVISION`.
- `mis_requisiciones` y `ocs_por_recibir`: backend-to-backend a Compras
  (`GET /requisiciones`, `GET /ordenes-compra?estado=EMITIDA,
  PARCIALMENTE_RECIBIDA`), vía `Promise.allSettled` con `timeout: 3000`.
- `prenominas_pendientes`: backend-to-backend a `personal`
  (`GET /api/v1/personal/prenominas`), contando las filas con
  `estado === 'CALCULADA' && !revisado_por_residencia`.
- `complementos_pendientes`: backend-to-backend a `personal`
  (`GET /api/v1/personal/complementos`), contando las filas con
  `!revisado_por_residencia`.
- Ambas llamadas a `personal` SHALL usar el mismo patrón que las
  llamadas a Compras (`Promise.allSettled`, `timeout: 3000`).

#### Scenario: Compras y personal responden correctamente
- **WHEN** un residente pide su dashboard y tanto Compras como
  `personal` responden dentro del timeout
- **THEN** la respuesta incluye `mis_requisiciones`, `ocs_por_recibir`,
  `prenominas_pendientes` y `complementos_pendientes` con datos reales y
  `parcial: false`

#### Scenario: personal no responde a tiempo
- **WHEN** `personal` no responde dentro de 3000ms (o responde con
  error)
- **THEN** `prenominas_pendientes` y `complementos_pendientes` quedan en
  `null`, `parcial` pasa a `true`, y el resto de la respuesta
  (`estimaciones_pendientes`, datos de Compras si sí respondió) se
  entrega sin bloquearse

#### Scenario: Compras no responde pero personal sí
- **WHEN** Compras falla y `personal` responde correctamente
- **THEN** `mis_requisiciones` queda en `0`/vacío y `ocs_por_recibir` en
  `[]`, `prenominas_pendientes`/`complementos_pendientes` sí traen datos
  reales, y `parcial: true` (basta que una de las dos llamadas B2B falle
  para marcar la respuesta como parcial)

#### Scenario: Alerta de estimaciones pendientes
- **WHEN** `estimaciones_pendientes > 0`
- **THEN** la respuesta incluye una alerta `tipo: "ESTIMACIONES_
  PENDIENTES"` con severidad `advertencia`
