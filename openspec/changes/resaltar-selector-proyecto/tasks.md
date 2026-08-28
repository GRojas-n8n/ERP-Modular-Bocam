## 1. Estilo del selector de proyecto

- [x] 1.1 Clase `glow-primary` agregada al botón selector de proyecto (`Layout.tsx`). Test unitario
      confirmado en rojo antes del cambio, verde después.
- [x] 1.2 `opacity-60` → `opacity-80` en el label "Proyectos" — se reduce el contraste sin
      eliminarlo del todo (mantiene jerarquía: el label sigue siendo secundario al nombre del
      proyecto, solo deja de competir tan fuerte con el glow del selector).

## 2. Validación visual

- [ ] 2.1 Verificación visual en tema claro/oscuro en navegador real — pendiente, requiere ambiente
      corriendo; queda para QA/revisión humana.
- [x] 2.2 No se tocó el `truncate`/`max-w` del nombre del proyecto — el cambio es solo `box-shadow`
      (glow) y opacidad del label, sin alterar el layout del texto. Suite completa de
      `Layout.*.test.tsx` (incluye el test de "sin tope de ancho fijo") sigue en verde (9/9).
