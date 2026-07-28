## 1. Test primero (TDD)

- [x] 1.1 Agregar/ajustar test en `Layout.tsx` que verifique que el botón del selector de
      proyecto ya NO tiene la clase `lg:max-w-[480px]` (rojo hoy, esa clase sigue presente).

## 2. Implementación

- [x] 2.1 En `Layout.tsx`, reemplazar `max-w-full lg:max-w-[480px]` por `max-w-full` en el botón
      del selector de proyecto.
- [x] 2.2 (agregado durante verificación visual, no estaba en el plan original) Centrar el
      nombre/código del proyecto (`text-center` + `items-center`) dentro de la barra expandida —
      con el texto alineado a la izquierda, la barra dejaba un tramo de color vacío grande antes
      del chevron/ícono, lo que no lucía "minimalista y ordenado"; centrado se ve como un banner
      limpio en vez de una barra desbalanceada.

## 3. Verificación

- [x] 3.1 Correr la suite completa de `app-shell` — 41 archivos, 117 tests, todo en verde.
- [x] 3.2 Levantar `app-shell` localmente y verificar visualmente en navegador en un viewport
      ancho (1600px): el selector se extiende hasta cerca del ícono de sol/luna, con el nombre
      centrado en la barra, sin solaparse con los íconos de la derecha. Confirmado con
      `getBoundingClientRect` que el centro del texto coincide con el centro de la barra.
- [x] 3.3 Verificar también en mobile (390px) — sin regresión, texto centrado y truncado
      correctamente, sin desbordes ni solapes.
