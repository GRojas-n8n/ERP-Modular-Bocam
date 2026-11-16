## 1. Frontend — descartar filas de boilerplate en los parsers

- [x] 1.1 Escribir tests (RTL o unitarios sobre las funciones de parseo) que reproduzcan el bug real: una fila con texto largo repetido en todas las columnas (firma) al final del archivo NO debe generar un insumo, en `parsearArchivoAPU` y `parsearArchivoExplosion`
- [x] 1.2 Escribir test de que un título de reporte repetido a media hoja (APU) sin disparador de nuevo concepto no genera un insumo
- [x] 1.3 Escribir test de que insumos reales (clave/unidad dentro de rango) se siguen agregando normalmente
- [x] 1.4 Agregar el descarte por longitud (`clave` > 50, `unidad_medida` > 20) en `parsearArchivoAPU`
- [x] 1.5 Agregar el mismo descarte en `parsearArchivoExplosion`
- [x] 1.6 Verificar que los tests de 1.1-1.3 pasan

## 2. Frontend — extracción correcta de la clave de concepto (APU)

- [x] 2.1 Escribir test de que `extraerClaveConcepto` (o el comportamiento observable de `parsearArchivoAPU`) extrae el valor real ("2.1.1") cuando la etiqueta "Clave:" está duplicada en celdas consecutivas por combinación de celdas
- [x] 2.2 Corregir `extraerClaveConcepto` para ignorar celdas que sean copias de la etiqueta "Clave:"/"Clave" al buscar el valor en la celda siguiente
- [x] 2.3 Verificar que el test de 2.1 pasa

## 3. Frontend — mensaje de error real

- [x] 3.1 Escribir test de que, ante un error de `POST /insumos/importar-lote`, el toast muestra `error.message` del backend
- [x] 3.2 Corregir `handleConfirmarInsumos` para leer `err.response?.data?.error?.message`
- [x] 3.3 Verificar que el test de 3.1 pasa

## 4. Backend — validación de longitud/rango antes de `createMany`

- [x] 4.1 Escribir test de integración: un lote con un ítem `unidad_medida` > 20 caracteres junto con ítems válidos responde 200, crea los válidos, y cuenta el inválido como omitido (no debe tumbar el endpoint)
- [x] 4.2 Escribir test de integración: un lote donde todos los ítems exceden algún límite responde 400
- [x] 4.3 Agregar la validación de longitud (`clave`, `unidad_medida`) y rango (`costo_base`) en el loop de validación de `POST /insumos/importar-lote`, antes de separar `nuevos`/`aActualizar`
- [x] 4.4 Verificar que los tests de 4.1-4.2 pasan

## 5. Verificación manual

- [x] 5.1 Correr `run-app-shell` y subir los archivos reales de APU y Explosión que causaban el 500 — confirmar que la importación termina exitosamente
- [x] 5.2 Confirmar que las composiciones APU se agrupan por clave de concepto real, no por "Clave:"
- [x] 5.3 Confirmar que el suite completo de tests de `app-shell` y de `gerencia-tecnica` sigue en verde
