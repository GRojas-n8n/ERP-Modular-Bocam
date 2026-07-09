## ADDED Requirements

### Requirement: El sistema SHALL continuar la conversación cuando un microservicio consultado falla
El sistema SHALL continuar el turno con los datos disponibles de las demás
tools invocadas cuando una tool que consulta un microservicio falla (error de
red, timeout, error HTTP 5xx), en vez de interrumpir la respuesta completa.

#### Scenario: Un microservicio no responde durante una consulta combinada
- **WHEN** el usuario hace una pregunta que requiere consultar tres
  microservicios y uno de ellos no responde dentro de su timeout
- **THEN** el sistema responde con los datos de los dos microservicios que sí
  respondieron, sin devolver un error genérico ni dejar la conversación sin
  respuesta

### Requirement: La respuesta SHALL declarar explícitamente cuando es parcial
Toda respuesta de `/chat` SHALL incluir una bandera `parcial: true` y SHALL
listar qué servicios no respondieron, cuando la respuesta se generó con uno o
más microservicios inaccesibles.

#### Scenario: Dos servicios fallan, uno responde
- **WHEN** de tres microservicios consultados en un turno, dos fallan y uno
  responde
- **THEN** la respuesta incluye `parcial: true`, el texto generado menciona
  explícitamente qué información no pudo obtenerse, y la respuesta lista los
  identificadores de los servicios que fallaron

#### Scenario: Todos los servicios consultados responden
- **WHEN** todos los microservicios consultados en un turno responden
  correctamente
- **THEN** la respuesta incluye `parcial: false` y no menciona ninguna
  limitación de datos

### Requirement: Cada tool SHALL tener un timeout independiente
El sistema SHALL aplicar un timeout individual a cada llamada de tool, de forma
que una tool lenta o caída no bloquee indefinidamente el turno completo de
conversación.

#### Scenario: Una tool excede su timeout individual
- **WHEN** una tool invocada durante un turno no responde dentro de su timeout
  configurado
- **THEN** el sistema trata esa tool como fallida, continúa con las demás
  tools del turno, y el turno completo respeta su propio timeout total sin
  quedar bloqueado por la tool lenta
