## 1. Test que reproduce el bug (primero, en rojo)

- [x] 1.1 Test Playwright E2E en `apps/app-shell/test/e2e/boton-enviar-gt-tras-firma.e2e.spec.ts`:
      Residente evalúa un renglón como C, selecciona 1ª opción, escribe veredicto,
      selecciona proveedor sugerido, firma (flujo real completo vía UI, sin atajos) →
      asertar que el botón "Enviar al Gerente Técnico →" es visible. Corrido contra el
      código actual: confirmado en rojo — el cuadro llega genuinamente a
      `FIRMADO_BLOQUEADO` (verificado con captura: badge "🔒 FIRMADO Y BLOQUEADO" visible)
      pero el botón nunca aparece.

## 2. Fix

- [x] 2.1 `apps/app-shell/src/components/ComparativaDetail.tsx` línea 884: agregar
      `'FIRMADO_BLOQUEADO'` a la condición de `showEnviarGTBtn`, sin remover los otros dos
      valores ya presentes (`EVALUADO_TECNICAMENTE`, `LOCKED`) por compatibilidad legacy.

## 3. Verificación

- [x] 3.1 Test de 1.1 en verde contra el código corregido (sin modificar el test),
      incluyendo el paso 3 (el cuadro aparece en la bandeja de pendientes del GT tras el
      envío).
- [x] 3.2 `tsc -b` en `apps/app-shell` limpio.

## 4. Cierre

- [ ] 4.1 PR contra main (branch `fix/`), CI verde, merge.
- [ ] 4.2 Redeploy manual de `app-shell` en VPS (compose build + up -d, sin migración de
      BD) y smoke 200.
