## 1. Mostrar/ocultar contraseña en Login

- [x] 1.1 Importar `Eye`/`EyeOff` de `lucide-react` en `LoginView.tsx`
- [x] 1.2 Agregar estado `showPassword` y botón toggle dentro del input de
      contraseña (`type={showPassword ? 'text' : 'password'}`)
- [x] 1.3 CSS del botón (`.lr-icon-toggle`) + padding derecho del input para no
      solaparse
- [x] 1.4 Build local limpio, commit `8902010`, deploy verificado (`app-shell`
      healthy, bundle nuevo servido)

## 2. Quitar badge DEMO fijo en Residencia de Obra

- [x] 2.1 Encontrar el badge `<SectionBadge>DEMO</SectionBadge>` sin guard en
      `ResidenciaView.tsx` (único caso en toda la vista sin `isDemo`)
- [x] 2.2 Envolver en `{isDemo && (...)}`
- [x] 2.3 Build local limpio, commit `8e391b9`, deploy verificado (`app-shell`
      healthy)

## Nota sobre tests

**No se escribieron tests automatizados.** Son cambios de UI puntuales verificados
por build limpio + confirmación visual tras el deploy. Un test de snapshot/render
para `ResidenciaView` que confirme la ausencia del badge fuera de modo demo sería
razonable pero no existe infraestructura de testing de componentes React en este
proyecto todavía (no hay ningún `*.test.tsx` en `apps/app-shell`).
