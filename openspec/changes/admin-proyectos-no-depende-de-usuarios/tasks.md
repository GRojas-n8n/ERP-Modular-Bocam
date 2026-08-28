## 1. Reproducir el bug

- [x] 1.1 `AdminView.proyectos-independiente-de-usuarios.test.tsx`: rol `gerencia_tecnica`, `/admin/users` rechaza con 403, `/admin/proyectos` responde 200 con un proyecto. Confirmado en rojo contra el código actual (mostraba "Error al cargar datos de administración.").

## 2. Fix

- [x] 2.1 `AdminView.loadAll()`: `Promise.all` → `Promise.allSettled`, cada resultado se aplica de forma independiente; el error genérico solo se dispara si ambas promesas se rechazan.

## 3. Verificación

- [x] 3.1 Test de 1.1 en verde tras el fix.
- [x] 3.2 Suite completa de `AdminView.*.test.tsx` sin regresiones (5 archivos / 13 tests).
- [x] 3.3 `tsc -b` limpio.

## 4. PR

- [x] 4.1 PR contra `main` desde `fix/admin-proyectos-no-depende-de-usuarios`, hotfix priorizado por reporte directo de producción.
