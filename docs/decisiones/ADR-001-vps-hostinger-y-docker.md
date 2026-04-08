# ADR-001: VPS Hostinger y Docker como base operativa

## Estado
Aprobado para staging y pruebas integrales del ERP.

## Contexto
Se requiere una plataforma unica, controlable y suficientemente potente para correr el ERP SaaS modular completo, con capacidad de iterar rapido, corregir y ampliar modulos.

## Decision
Se adopta un VPS Hostinger con Ubuntu 24.04 LTS y Docker Compose como plataforma de despliegue operativa.

## Alcance de la decision
- Un solo VPS aloja el stack completo.
- Cada modulo corre en su propio contenedor.
- El borde publico se maneja con Caddy o Nginx.
- PostgreSQL, RabbitMQ y Redis corren en contenedores internos.

## Razones
- Despliegue rapido y reproducible.
- Facilidad de operacion y respaldo.
- Separacion clara de servicios.
- Trazabilidad por Git y scripts de bootstrap.

## Consecuencias positivas
- Menor tiempo de puesta en marcha.
- Mejor aislamiento entre modulos.
- Posibilidad de probar el flujo completo en un solo entorno.

## Riesgos
- Todo el stack comparte el mismo VPS, por lo que existe un punto unico de falla a nivel host.
- Se requiere disciplina para mantener bases por modulo y no volver a una base compartida.
- El crecimiento futuro puede requerir partir servicios fuera del VPS.

## Mitigaciones
- Backups.
- Reverse proxy unico.
- Healthchecks.
- Runbook de operacion.
- Documentacion de arquitectura e infraestructura.
