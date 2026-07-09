## ADDED Requirements

### Requirement: Ningún indicador de demo SHALL mostrarse fuera del modo demo
Toda vista de la aplicación SHALL condicionar cualquier badge, etiqueta o dato de
demostración a la bandera `isDemo` (derivada de `tenant?.id === 'iretum-demo'`).
Ningún elemento visual que indique "modo demo" SHALL renderizarse
incondicionalmente.

#### Scenario: Usuario real navega a un módulo con badge de demo
- **WHEN** un usuario autenticado en un tenant real (no `iretum-demo`) navega a
  cualquier vista de la aplicación
- **THEN** ninguna etiqueta ni texto de "DEMO" es visible en esa vista

#### Scenario: Usuario en modo demo navega a un módulo con badge de demo
- **WHEN** un usuario en modo demo (`tenant.id === 'iretum-demo'`) navega a una
  vista que tiene contenido de demostración
- **THEN** la etiqueta "DEMO" sí se muestra, indicando claramente que los datos
  visibles son simulados
