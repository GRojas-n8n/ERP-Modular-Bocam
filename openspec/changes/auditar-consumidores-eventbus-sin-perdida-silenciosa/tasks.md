## 1. Inventario

- [ ] 1.1 Listar todas las suscripciones de `apps/*` con su evento, cola, handler e idempotencia actual.
- [ ] 1.2 Clasificar cada suscripción como crítica, relevante o informativa, con la consecuencia de perder el evento.
- [ ] 1.3 Documentar el comportamiento actual ante un error del handler en cada una.

## 2. Colas

- [ ] 2.1 **Titular:** listar en modo solo lectura las colas sin consumidor con su última actividad conocida.
- [ ] 2.2 Proponer retiro o conservación de cada una. Ningún retiro se ejecuta sin autorización expresa.

## 3. Decisión

- [ ] 3.1 Definir la política de fallo por suscripción, con parámetros de reintento y espera.
- [ ] 3.2 Definir el monitoreo de las colas de mensajes fallidos y el procedimiento de reproceso.
- [ ] 3.3 Redactar el plan de adopción por lotes, priorizado por riesgo, con los criterios de prueba de cada uno.

## 4. Cierre de la auditoría

- [ ] 4.1 Crear un change por lote de adopción; cada uno con su spec, pruebas primero y PR propio.
- [ ] 4.2 Archivar este change tras aprobar el plan.
