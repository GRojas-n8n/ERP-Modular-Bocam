## Why

`@bocam/event-bus` hace `nack(msg, false, false)` cuando un handler lanza una excepción y sus colas solo declaran un TTL de 24 h, sin exchange de mensajes muertos. Por defecto, un error descarta el mensaje. Solo el worker SAT de Contabilidad configura reintento y cola de mensajes fallidos. El hallazgo se detectó al analizar `fix-ingresos-almacen-por-recepcion-oc`, que resuelve el caso de las recepciones de OC con opciones por suscripción y no toca a los demás consumidores.

Hay 67 colas en producción, 20 sin consumidor y solo 2 con exchange de mensajes muertos. Los efectos de perder un evento varían mucho: un aviso de centro de costos no equivale a un pago registrado.

## What Changes

- Inventariar todos los consumidores del bus y clasificar cada suscripción por consecuencia de perder el evento, idempotencia actual y comportamiento ante errores del handler.
- Decidir, por suscripción, si requiere reintentos y cola de mensajes fallidos, y con qué parámetros, reutilizando las opciones del change de recepciones.
- Auditar las colas sin consumidor (restos de servicios retirados y de pruebas) y proponer su retiro.
- Definir el monitoreo y el procedimiento de reproceso de las colas de mensajes fallidos.
- Producir un plan de adopción por lotes, priorizado por riesgo, sin cambiar aún ningún consumidor.

## Capabilities

### New Capabilities

- `consumidores-eventbus-sin-perdida-silenciosa`: toda suscripción declara su política de fallo y ningún error de handler descarta un evento de negocio en silencio.

### Modified Capabilities

(ninguna)

## Impact

- Fase de auditoría: solo documentación y lectura de configuración; sin cambios en servicios ni en producción.
- Fases posteriores, cada una con su propio spec y PR: adopción por servicio (`compras`, `contabilidad`, `control-proyectos`, `calidad`, `seguridad`, `ventas`, `almacen`).
- Depende de que el change `fix-ingresos-almacen-por-recepcion-oc` entregue las opciones `retry` y `deadLetter` en el bus.
- No se amplía automáticamente el change de recepciones a estos consumidores.
