## Why

Dos problemas de UX reportados por usuarios reales durante las pruebas de campo del
2026-07-08: no podían verificar si habían escrito bien su contraseña al iniciar
sesión (no había forma de mostrarla), y la vista de Residencia de Obra mostraba una
etiqueta "DEMO" permanentemente, generando confusión sobre si estaban en un entorno
de prueba o en producción real.

## What Changes

- `LoginView.tsx`: se agrega un botón de mostrar/ocultar contraseña (ícono de ojo,
  `lucide-react`) en el campo de contraseña del login.
- `ResidenciaView.tsx`: la etiqueta `DEMO` junto al título "Residencia de Obra" se
  renderizaba sin ninguna condición — el único lugar en toda la vista sin el guard
  `isDemo` que sí se usa consistentemente en el resto del archivo. Se corrige para
  que solo aparezca en modo demo real.

## Capabilities

### New Capabilities
- `demo-mode-visibility`: Ningún indicador o dato de demostración SHALL mostrarse a
  un usuario que no esté en modo demo — invariante ya aplicada en el resto de la
  aplicación, aquí formalizada como requerimiento explícito tras encontrar una
  excepción.

## Impact

- `apps/app-shell/src/views/LoginView.tsx`
- `apps/app-shell/src/views/ResidenciaView.tsx`

## Nota SDD

*Ambos fixes se implementaron y desplegaron fuera del flujo SDD estándar (sin spec
previo, sin tests-first) durante pruebas de campo en vivo. Se documentan
retroactivamente al cierre de la sesión.*
