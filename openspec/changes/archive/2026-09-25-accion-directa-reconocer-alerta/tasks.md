## 1. Reconocer directo

- [x] 1.1 Escribir test: clic en "Reconocer" envía el `PATCH .../reconocer` con `nota_cp` vacío sin abrir ningún modal
- [x] 1.2 Escribir test: mientras la petición está en curso, el botón de esa alerta muestra estado de carga y las demás alertas siguen interactuables
- [x] 1.3 Cambiar `enviandoAlerta` de `boolean` a `Set<string>` (IDs de alerta en proceso) en `ControlObraView.tsx`
- [x] 1.4 Implementar `reconocerDirecto(alerta)` y conectar el botón "Reconocer" a esta función en vez de abrir el modal
- [x] 1.5 Verificar que los tests de 1.1-1.2 pasan

## 2. Reconocer con nota (acción secundaria)

- [x] 2.1 Escribir test: clic en "Agregar nota" abre el modal existente en modo `reconocer`, y confirmar con una nota envía el `PATCH` con esa nota
- [x] 2.2 Agregar la acción secundaria "Agregar nota" junto al botón "Reconocer", que abre el modal ya existente (`setModalAlerta({ alerta, accion: 'reconocer' })`)
- [x] 2.3 Verificar que el test de 2.1 pasa

## 3. Verificar que Ignorar no cambia

- [x] 3.1 Escribir/confirmar test de que "Ignorar" sigue abriendo el modal con justificación obligatoria (mínimo 20 caracteres) y no tiene camino de un clic
- [x] 3.2 Verificar que el test de 3.1 pasa

## 4. Verificación manual

- [x] 4.1 Correr `run-app-shell` y probar "Reconocer" en un clic sobre una alerta activa
- [x] 4.2 Probar "Agregar nota" y confirmar que la nota queda registrada en el expediente de la alerta
- [x] 4.3 Confirmar que "Ignorar" sigue exigiendo justificación de 20+ caracteres
- [x] 4.4 Confirmar que el suite completo de tests de `app-shell` sigue en verde
