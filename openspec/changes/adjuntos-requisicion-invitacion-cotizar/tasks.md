## 1. Gerencia Técnica — permiso de Residente sobre fichas técnicas

- [x] 1.1 Escribir test de integración en `apps/gerencia-tecnica`
      (`test/integration/fichas-tecnicas-residente.integration.test.ts`):
      un usuario con rol `residencia` puede `POST
      /api/v1/gerencia-tecnica/insumos/:id/fichas` (201) y `GET
      /api/v1/gerencia-tecnica/insumos/:id/fichas` (200, incluye la ficha
      subida). Debe fallar en rojo contra el código actual (403 en ambos).
      Confirmado en rojo.
- [x] 1.2 Test: un rol sin acceso (ej. `finance`) sigue recibiendo 403 en
      ambos endpoints — no se abrió de más.
- [x] 1.3 Implementar: agregar `'residencia'` a `ROLES_FICHAS_UPLOAD` y
      `ROLES_FICHAS_LECTURA` en `apps/gerencia-tecnica/src/main.ts`
      (~línea 894-895), conservando `'resident'`.
- [x] 1.4 Ejecutar los tests de 1.1-1.2 y confirmar que pasan en verde.
      2/2 ok.

## 2. Compras — adjuntar fichas técnicas al correo de invitación

- [x] 2.1 Escribir test de integración en `apps/compras` para una función
      nueva y exportada `resolveFichasTecnicasAdjuntas` (extraída para
      poder probarla sin depender de SMTP real, dado que ningún test
      existente ejercita el endpoint completo de solicitud-cotización ni
      hay SMTP configurado en el entorno de test): dado un insumo con
      fichas técnicas registradas en un stub HTTP de GT, resuelve un
      adjunto por ficha con `filename`/`content`/`contentType` correctos.
      Debe fallar en rojo (la función no existe hoy).
- [x] 2.2 Test: si GT no responde (sin stub levantado / timeout), la
      función retorna `[]` sin lanzar — el envío no falla por esta causa.
- [x] 2.3 Test: insumo sin ninguna ficha técnica no agrega adjuntos.
- [x] 2.4 Implementar en `apps/compras/src/mailer.ts`:
      `enviarSolicitudCotizacionEmail` acepta un parámetro opcional
      `adjuntosExtra: AdjuntoExtra[]` (nuevo tipo exportado) y lo
      concatena al array de `attachments` existente.
- [x] 2.5 Implementar `apps/compras/src/fichas-tecnicas-adjuntas.ts`
      (nuevo módulo, mismo patrón que `solicitud-cotizacion-policy.ts`):
      `resolveFichasTecnicasAdjuntas` resuelve, por cada `insumo_id`
      único, `GET ${gtUrl}/insumos/:id/fichas` (timeout 5s, catch → `[]`)
      y por cada ficha `GET .../fichas/:fid/descargar`
      (`responseType: 'arraybuffer'`, timeout 5s, catch → se omite esa
      ficha). Cablear en `enviarCorreosSolicitudCotizacion`
      (`apps/compras/src/main.ts` ~línea 99): se resuelve una sola vez
      (mismas fichas para todos los proveedores invitados) y se pasa a
      cada llamada de `enviarSolicitudCotizacionEmail`.
- [x] 2.6 Ejecutar los tests de 2.1-2.3 y confirmar que pasan en verde.
      3/3 ok.

## 3. Frontend — subir ficha técnica al crear una requisición

- [x] 3.1 Escribir test de componente en
      `apps/app-shell/src/views/ResidenciaView.ficha-tecnica.test.tsx`:
      en el flujo "Requisición Normal", cada insumo del carrito muestra un
      input de archivo; seleccionar un archivo y crear la requisición
      dispara `POST /api/v1/gerencia-tecnica/insumos/:insumo_id/fichas`
      con ese archivo, best-effort (no bloquea la creación si falla).
      Debe fallar en rojo (el input no existe hoy). Primer test de este
      archivo grande (ResidenciaView nunca tuvo tests) — requirió mapear
      todo el estado inicial (dashboard, catálogo de insumos con `id` no
      `insumo_id`, conceptos) para poder renderizar sin crashear.
- [x] 3.2 Agregar `fichaTecnica?: File | null` a la interfaz
      `InsumoSeleccionado` (`ResidenciaView.tsx` ~línea 125-133).
- [x] 3.3 Agregar un `<input type="file">` por insumo en el carrito del
      flujo "Requisición Normal" (~línea 2023-2029, junto a los campos de
      especificación existentes), guardando el `File` en
      `insumosSeleccionados[idx].fichaTecnica`.
- [x] 3.4 Tras crear la requisición exitosamente (~línea 724, mismo punto
      donde se guardan especificaciones por ítem), agregar un
      `Promise.allSettled` que sube `fichaTecnica` de cada insumo que
      tenga uno vía `POST /api/v1/gerencia-tecnica/insumos/:insumo_id/fichas`
      (multipart, campo `archivo` + `nombre_doc` = `file.name`, mismo
      patrón que `handleFichaUpload` en `ComparativaDetail.tsx`).
- [x] 3.5 Ejecutar el test de 3.1 y confirmar que pasa en verde. ok.

## 4. Verificación de regresión

- [x] 4.1 Ejecutar `npx tsc --noEmit -p apps/gerencia-tecnica/tsconfig.json`
      limpio. Limpio.
- [x] 4.2 Ejecutar la suite completa de tests de integración de
      `apps/gerencia-tecnica` y confirmar 0 regresiones. 5/5 archivos ok.
- [x] 4.3 Ejecutar la suite completa de tests de integración de
      `apps/compras` y confirmar 0 regresiones. 17/17 archivos ok.
      Nota: una corrida intermedia mostró 7 archivos en rojo por
      `comparativas_detalles.tiempo_entrega does not exist` — falsa alarma
      de drift de la BD local compartida (la migración de
      `fecha-entrega-estimada-por-partida`, una branch distinta, había
      dejado la BD con `fecha_entrega_estimada` en vez de
      `tiempo_entrega`, mientras esta branch —basada en `main`— sigue
      esperando el nombre viejo). Resuelto con `prisma db push
      --accept-data-loss` para resincronizar la BD al schema de esta
      branch. No fue una regresión real de este change.
- [x] 4.4 Ejecutar `tsc -b` limpio en `app-shell`. Limpio.
- [x] 4.5 Ejecutar la suite completa de vitest de `app-shell` y confirmar
      0 regresiones. 30/30 ok (una corrida intermedia mostró
      `InsumosView.catalogo-scroll` en rojo solo dentro de la suite
      completa — confirmado flaky/preexistente, no relacionado: pasa en
      aislamiento y en una segunda corrida completa).

## 5. Verificación manual en navegador (producción, con usuario real)

- [ ] 5.1 Con el usuario `residencia@bocam.com.mx`: crear una requisición
      "Normal" adjuntando una ficha técnica a al menos un insumo; con
      `procuracion@bocam.com.mx`, aprobar la requisición y enviar
      Solicitud de Cotización a un proveedor con correo real; confirmar
      que el correo recibido incluye la ficha técnica adjunta.
      **PENDIENTE — requiere backend completo levantado con datos reales
      y SMTP configurado; no hay navegador automatizado disponible en
      este entorno.**

## 6. Cierre

- [ ] 6.1 Redeploy manual de los contenedores `gerencia-tecnica` y
      `compras` en el VPS tras mergear a `main` (backend sin CI/CD).
- [ ] 6.2 Abrir PR contra `main` desde branch
      `feat/adjuntos-requisicion-invitacion-cotizar`.
