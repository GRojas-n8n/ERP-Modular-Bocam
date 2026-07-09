## 1. Diagnóstico

- [x] 1.1 Reproducir el 403 al llamar `POST /api/v1/gerencia-tecnica/presupuestos`
      con un usuario de rol `gerencia_tecnica` real
- [x] 1.2 Confirmar en `AdminView.tsx` (`ROLES` constante) que `technical` no es un
      rol asignable — solo existe `gerencia_tecnica`
- [x] 1.3 Revisar logs del contenedor `gerencia-tecnica` y encontrar
      `PayloadTooLargeError` en la importación de composición APU
- [x] 1.4 Confirmar en DB (`concepto_insumos`) que la importación previa había
      quedado en 0 filas pese a que el toast de éxito no mostraba error claro

## 2. Fix de permisos

- [x] 2.1 Agregar `'gerencia_tecnica'` a `requireRoles(...)` en
      `POST /api/v1/gerencia-tecnica/insumos`
- [x] 2.2 Agregar `'gerencia_tecnica'` a `requireRoles(...)` en
      `PATCH /api/v1/gerencia-tecnica/insumos/:id`
- [x] 2.3 Agregar `'gerencia_tecnica'` a `requireRoles(...)` en
      `POST /api/v1/gerencia-tecnica/presupuestos`

## 3. Fix de límite de payload

- [x] 3.1 Cambiar `express.json()` a `express.json({ limit: '15mb' })` en
      `apps/gerencia-tecnica/src/main.ts`
- [x] 3.2 Agregar `client_max_body_size 20m;` a la location
      `/api/v1/gerencia-tecnica` en `docker/nginx.qnap.conf`

## 4. Verificación y cierre

- [x] 4.1 `npm run build -w @bocam/gerencia-tecnica` — compila limpio
- [x] 4.2 Deploy en VPS (rebuild + recreate `gerencia-tecnica` y `app-shell`),
      ambos `healthy`
- [x] 4.3 Commits `bbf4ec0` (permisos) y `052e7be` (límite de payload)
- [x] 4.4 Verificación: se le indicó al usuario de GT reintentar la subida del
      catálogo de conceptos y de la composición APU tras el deploy — confirmado
      sin más 403 ni fallas silenciosas reportadas

## Nota sobre tests

**No se escribieron tests automatizados.** La verificación fue manual: compilación
limpia + deploy + confirmación funcional directa del usuario de campo. Sería
razonable agregar un test de integración que llame `requireRoles` con el rol
`gerencia_tecnica` y confirme `200`/`201` en los 3 endpoints — pendiente para un
change futuro de cobertura de tests retroactivos.
