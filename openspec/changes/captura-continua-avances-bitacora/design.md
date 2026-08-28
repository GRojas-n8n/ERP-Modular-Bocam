## Context

`ControlObraView.tsx` maneja el panel "Registrar Avance" y el panel "Nueva Entrada" de bitácora como formularios modales/inline controlados por estado local del componente (`useState`). Al confirmar el `POST`, el handler de éxito hoy resetea todo el estado del panel (incluyendo la bandera que lo mantiene visible), lo que lo cierra. No hay backend involucrado en este cambio: el contrato de `POST /api/v1/control-proyectos/avances` y `POST /api/v1/control-proyectos/bitacoras` no cambia.

## Goals / Non-Goals

**Goals:**
- Después de un guardado exitoso, el panel permanece visible y listo para una nueva captura, sin recargar la pestaña completa.
- El usuario recibe una confirmación clara e inmediata de que el guardado ocurrió (para no dudar si debe reintentar).
- El usuario puede cerrar el panel explícitamente cuando termina su sesión de captura.

**Non-Goals:**
- No se cambia el contrato de API ni se agregan endpoints de "guardado en lote".
- No se rediseña el layout general de las pestañas Avances Físicos o Bitácora, solo el ciclo de vida del panel de captura.
- No se agrega persistencia de borrador entre sesiones (recargar la página sigue perdiendo el panel abierto).

## Decisions

- **Qué se limpia vs. qué se conserva al guardar:**
  - Avances: se limpian `cantidad_periodo`, `periodo_inicio`/`periodo_fin` y el estado de envío; el concepto seleccionado se limpia también (obliga a elegir explícitamente el siguiente concepto, evitando registrar dos avances al mismo concepto por descuido). Justificación: en el flujo típico, un usuario captura avances de conceptos *distintos* en la misma sesión, no repite el mismo concepto.
  - Bitácora: se limpian los campos de la entrada (`actividades_realizadas`, `personal_en_sitio`, etc.); el `frente_trabajo` seleccionado se conserva, porque el patrón típico es capturar varias entradas seguidas para el mismo frente antes de cambiar.
- **Confirmación de guardado:** mensaje inline dentro del propio panel (no un modal ni un toast global), con el nombre del concepto/entrada recién guardado, que desaparece al iniciar la siguiente captura o tras unos segundos. Se evita un modal de confirmación porque agregaría un clic para cerrarlo, contradiciendo el objetivo del cambio.
- **Cierre explícito:** se agrega un botón "Cerrar" (o reutiliza el botón "Cancelar" existente, renombrado) visible en todo momento en el panel, en vez de depender de un guardado para cerrarlo.
- **Alcance del cambio:** el mismo patrón se aplica a ambos paneles (Avances y Bitácora) para mantener consistencia de comportamiento dentro de `ControlObraView`, aunque cada uno decide qué campo conserva según su flujo (ver arriba).

## Risks / Trade-offs

- [Riesgo] Un usuario podría no notar que el guardado ocurrió si la confirmación inline es demasiado sutil, y reintentar el envío → Mitigación: confirmación visible con color/ícono de éxito y el identificador de lo guardado (clave de concepto o número de entrada), no solo un mensaje genérico.
- [Riesgo] Limpiar el concepto en Avances pero conservar el frente en Bitácora es una asimetría intencional, pero podría percibirse como inconsistente → Mitigación: documentarlo en la spec con el razonamiento (flujos distintos), y validar con el usuario en la revisión de la spec antes de implementar.
- [Trade-off] No se agrega guardado en lote (varios avances en un solo POST); se mantiene un POST por captura, solo se evita cerrar el panel entre cada uno. Es la opción más simple y no requiere cambios de backend.
