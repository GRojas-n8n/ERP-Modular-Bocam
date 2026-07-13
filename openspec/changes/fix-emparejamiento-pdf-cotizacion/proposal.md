## Why

Al "Aplicar cotización" de un PDF subido por proveedor en el Cuadro Comparativo, el sistema
reporta éxito ("Cotización aplicada — Precios del PDF aplicados al cuadro") incluso cuando el
emparejamiento automático entre los renglones extraídos del PDF y las líneas del cuadro falla
para todas las líneas, dejando la tabla sin ningún precio, sin avisar al usuario. Confirmado en
producción (2026-07-13, usuario administrador, requisición `80ffce1d-4092-4061-8728-824f6df764e6`,
cuadro `93a9fd4e-d304-42df-8ffe-4be0b60a6926`): el servicio de IA extrajo correctamente 2
renglones de cada uno de 3 PDFs (logs 200 OK), los 3 PDFs se persistieron como respaldo, pero
`comparativas_detalles` quedó con 0 filas — el emparejamiento falló para las 3 cotizaciones y el
usuario recibió el toast de éxito las 3 veces igual.

Causa raíz: `handleAplicarCotizacion` (`apps/app-shell/src/components/ComparativaDetail.tsx:888-922`)
empareja cada línea con un renglón del PDF comparando solo los primeros 10 caracteres de la
descripción como substring, en minúsculas — criterio demasiado frágil para texto libre real de
proveedores (orden de palabras distinto, sinónimos, formato distinto). Sin match, la línea queda
intacta y el código sigue sin avisar.

## What Changes

- Reemplazar el criterio de emparejamiento de substring-de-10-caracteres por un puntaje de
  solapamiento de palabras significativas (tokenizar, normalizar acentos/mayúsculas, ignorar
  palabras cortas/stopwords), eligiendo por línea el renglón con mejor puntaje por encima de un
  umbral mínimo.
- Cuando una o más líneas no logran emparejarse con ningún renglón del PDF, el sistema debe
  avisar explícitamente cuántas líneas no se pudieron relacionar automáticamente y que deben
  capturarse manualmente, en vez de mostrar siempre el mismo mensaje de éxito genérico.
- Sin cambios en la persistencia del PDF como respaldo (ya funciona correctamente hoy,
  independiente del resultado del emparejamiento).
- Sin cambios de schema/backend — el fix es de lógica de emparejamiento en frontend.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `cotizacion-compras-ux`: el requirement existente "El PDF de cotización SHALL subirse y
  persistirse únicamente desde el cuadro comparativo" (`openspec/specs/cotizacion-compras-ux/spec.md:123-149`)
  no cubre el comportamiento esperado cuando el emparejamiento automático falla parcial o
  totalmente. Este change agrega ese comportamiento.

## Impact

- **Frontend**: `apps/app-shell/src/components/ComparativaDetail.tsx` (`handleAplicarCotizacion`),
  posible extracción de la lógica de emparejamiento a un módulo puro testeable en
  `apps/app-shell/src/lib/`.
- **Sin cambios de backend/schema.**
- Afecta el flujo real de Compras en producción (tenant Bocam) — bloqueaba la continuación de la
  prueba manual del usuario administrador sobre el flujo completo requisición→factura.
