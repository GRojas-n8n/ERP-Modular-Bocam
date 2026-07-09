## Context

`apps/gerencia-tecnica/src/main.ts` usa `requireRoles(...)` por endpoint para
controlar quién puede mutar el catálogo. En algún punto de la historia del código se
usó el rol `technical` como placeholder, pero `AdminView.tsx` (la única forma de
asignar roles a un usuario real) nunca ofreció esa opción — solo `gerencia_tecnica`.
El resultado: 3 endpoints de escritura eran inalcanzables para cualquier usuario real
del rol correspondiente, solo `admin`/`superintendent` podían usarlos.

Por separado, `express.json()` sin `limit` explícito usa el default de la librería
(100kb). Ningún otro servicio del monorepo que recibe payloads grandes (`reportes`,
`asistente`) usa el default — ambos ya tenían límites subidos (`10mb`, `1mb`). GT
importa catálogos OPUS reales de cientos de insumos y quedó fuera de ese patrón.

## Goals / Non-Goals

**Goals:**
- Que `gerencia_tecnica` (el rol real asignable) pueda usar los 3 endpoints de
  escritura del catálogo.
- Que la importación de composición APU no falle por tamaño de payload con
  catálogos de tamaño realista.

**Non-Goals:**
- No se audita si otros endpoints del monorepo tienen el mismo problema de límite
  de payload (queda como posible brecha a revisar en otro change).
- No se elimina el rol `technical` del código — se deja como alias adicional por si
  algún flujo futuro lo necesita (no genera daño, solo es redundante hoy).

## Decisions

- **Se agrega `gerencia_tecnica` a la lista existente de `requireRoles(...)` en vez
  de reemplazar `technical`.** Alternativa: quitar `technical` y dejar solo
  `gerencia_tecnica` — se descartó por ser un cambio más amplio de lo necesario para
  cerrar el bug hoy; no hay evidencia de que `technical` esté en uso, pero tampoco
  costo de mantenerlo.
- **Límite subido a 15mb, no a un valor "justo lo necesario".** Se eligió el mismo
  orden de magnitud que otros límites ya usados en el repo (`reportes`: 10mb) más
  margen, dado que un catálogo OPUS real puede crecer con el tiempo.

## Risks / Trade-offs

- [Riesgo] Un límite de 15mb en un endpoint público podría ser vector de payloads
  abusivos (DoS de memoria). → Mitigación: el endpoint ya requiere JWT válido +
  rol autorizado antes de procesar el body; no es una ruta pública anónima.
- [Riesgo] Dejar `technical` como alias no documentado puede confundir a futuros
  desarrolladores sobre qué rol usar. → Mitigación: no aplicada en este change;
  queda anotado aquí para limpieza futura.
