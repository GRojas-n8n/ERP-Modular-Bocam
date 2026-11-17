## 1. Test que reproduce el bug (primero, sin fix)

- [x] 1.1 Crear un archivo/fixture de prueba de Explosión de Insumos (arreglo de arreglos estilo OPUS) con al menos: una fila `HH-001 Herramienta Menor` con Costo Unitario y Importe distintos, una fila `HS-002 Equipo de Seguridad Básico Industrial` con Costo Unitario y Importe distintos, y una fila de material normal.
- [x] 1.2 Escribir un test unitario para `parsearArchivoExplosion` que, con el código actual (sin fix), demuestre que las filas `HH`/`HS` toman el valor de Costo Unitario en vez de Importe (test que falla/reproduce el bug). Confirmado en rojo: 2 tests fallando antes del fix.

## 2. Fix del parser

- [x] 2.1 En `apps/app-shell/src/views/InsumosView.tsx`, agregar detección de la columna IMPORTE en el bloque de detección de encabezados (~605-609), junto a la detección existente de Costo Unitario/Precio Unitario/Costo Directo.
- [x] 2.2 Implementar el criterio de selección por prefijo de clave (`HH`, `HS`) para elegir Importe sobre Costo Unitario al construir cada fila del preview (~629).
- [x] 2.3 Mantener el fallback a Costo Unitario cuando no se detecta columna Importe en el archivo.

## 3. Verificación

- [x] 3.1 Correr el test de la sección 1 contra el código con el fix — debe pasar (las filas HH/HS ahora toman Importe). Confirmado en verde: 10/10 tests del archivo.
- [x] 3.2 Agregar/ajustar test para el escenario de fallback (archivo sin columna Importe) y para una fila de material estándar (comportamiento sin cambios).
- [ ] 3.3 Probar manualmente en la vista de Explosión de Insumos importando un archivo real con filas HH/HS y confirmar que el preview y el guardado final muestran el importe correcto. (Pendiente — requiere un archivo OPUS real y ambiente corriendo; queda para QA/revisión humana.)

## 4. PR

- [x] 4.1 Abrir PR contra `main` desde branch `fix/explosion-insumos-costo-vs-importe` con el spec de este change referenciado en la descripción.
