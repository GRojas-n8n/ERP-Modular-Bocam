## ADDED Requirements

### Requirement: Los consumidores de Finanzas SHALL reintentar y no descartar eventos
Cada suscripción de Finanzas SHALL usar la cola `finanzas.<patrón>.v2` con reintento configurable y DLQ. Un error
del handler SHALL reintentarse; agotados los intentos, el evento SHALL quedar en `<cola>.dlq`. La cola principal no
SHALL tener `x-message-ttl`.

#### Scenario: Falla transitoria
- **WHEN** un handler falla dos veces y la tercera termina bien
- **THEN** el evento SHALL procesarse una vez y la `.dlq` SHALL quedar vacía

#### Scenario: Falla permanente
- **WHEN** un handler falla en todos los intentos
- **THEN** el evento SHALL quedar en `<cola>.dlq` después de exactamente los intentos configurados

### Requirement: Los movimientos de nómina SHALL ser únicos por prenómina
Como máximo SHALL existir un COMPROMISO y un EJERCIDO por prenómina (`uq_movimiento_nomina`). Una reentrega,
incluso simultánea, SHALL tratarse como evento ya procesado.

#### Scenario: Reentrega simultánea
- **WHEN** llegan tres entregas simultáneas de `personal.nomina_autorizada` de la misma prenómina
- **THEN** SHALL existir un solo COMPROMISO, el comprometido SHALL aumentar una vez y ninguna entrega SHALL fallar
