## Context

`personal.empleados.contacto_emergencia` es hoy un único `VARCHAR(200)` de
texto libre, capturado y editado desde un solo `<Input>` tanto en el panel de
alta como en el de edición (`PersonalView.tsx`), y expuesto sin cambios por
`POST/PATCH /api/v1/personal/empleados`. También se imprime tal cual en el
reverso de la credencial física (`credencialesPrint.ts`). No hay ningún otro
consumidor del campo (confirmado por búsqueda en `apps/`).

No existe un formato consistente de captura histórica — distintos RH pueden
haber guardado "Juan Pérez 55-1234-5678", solo un nombre, solo un teléfono, o
"Esposa: María, 5551234567". No es parseable de forma confiable con reglas
simples ni justifica un parseo con LLM para un campo de este tamaño.

## Goals / Non-Goals

**Goals:**
- Capturar nombre, teléfono y parentesco del contacto de emergencia como
  campos independientes, en alta y edición.
- No perder el dato ya capturado en `contacto_emergencia` para empleados
  existentes.
- Mantener la credencial física útil en una emergencia real (nombre + teléfono
  visibles).

**Non-Goals:**
- No se intenta parsear/separar automáticamente el texto libre histórico en
  teléfono/parentesco (no es confiable — ver Context).
- No se valida formato de teléfono (ni el `telefono` propio del empleado se
  valida hoy; se mantiene la misma convención de campo libre).
- No se elimina la columna `contacto_emergencia` en este change (ver Migration
  Plan) — el cleanup queda fuera de alcance.

## Decisions

- **3 columnas nuevas nullable, sin FK ni tabla aparte.** El contacto de
  emergencia es 1:1 con el empleado y no se reutiliza entre empleados; una
  tabla aparte sería sobre-ingeniería para 3 campos de texto.
- **Migración copia `contacto_emergencia` → `contacto_emergencia_nombre` tal
  cual, sin intentar separar teléfono/parentesco.** Alternativa considerada:
  dejar los 3 campos nuevos vacíos y el dato viejo solo visible en la columna
  legacy. Se descarta porque RH dejaría de ver el dato existente en el
  formulario de edición al primer render, aumentando el riesgo de que un
  empleado quede sin contacto de emergencia visible mientras se re-captura.
  Copiarlo a `nombre` lo mantiene visible (aunque potencialmente mezclado con
  teléfono/parentesco) y el campo teléfono vacío es una señal clara para RH
  de que falta completarlo.
- **No se hace DROP de `contacto_emergencia`.** Regla del proyecto: no tocar
  ni eliminar de más en código/esquema legacy sin necesidad. La columna queda
  huérfana (sin lectura/escritura desde la app) hasta un cleanup futuro fuera
  de este change.
- **Sin validación de formato en `contacto_emergencia_telefono`.** Se sigue la
  convención ya existente del campo `telefono` del propio empleado (tampoco
  validado). Introducir validación aquí y no allá sería inconsistente.
- **La credencial imprime nombre + teléfono, no parentesco.** El reverso de la
  credencial tiene espacio limitado; parentesco es útil en el sistema pero no
  crítico para que quien encuentre al empleado sepa a quién llamar.

## Risks / Trade-offs

- [El nombre migrado puede contener teléfono/parentesco mezclados, no solo el
  nombre] → Es data ya sucia hoy (un solo campo de texto libre); no empeora la
  situación actual y queda visible para que RH lo limpie campo por campo la
  próxima vez que edite a ese empleado. No se automatiza la limpieza.
- [RH dejará campos `telefono`/`parentesco` vacíos si no se le pide
  explícitamente completarlos] → Fuera de alcance forzar completitud (no hay
  ningún campo obligatorio de este tipo hoy en el formulario, salvo los 5 ya
  definidos por `alta-individual-empleado`); no se agrega esta validación para
  no bloquear altas legítimas donde el contacto de emergencia simplemente no
  se conoce aún.
- [Columna `contacto_emergencia` queda huérfana en el esquema] → Aceptado
  explícitamente (ver Decisions); un cleanup futuro puede evaluarla contra
  datos reales de producción antes de eliminarla.

## Migration Plan

1. Migración Prisma: `ALTER TABLE empleados ADD COLUMN contacto_emergencia_nombre
   VARCHAR(200), ADD COLUMN contacto_emergencia_telefono VARCHAR(30), ADD COLUMN
   contacto_emergencia_parentesco VARCHAR(50)` + `UPDATE empleados SET
   contacto_emergencia_nombre = contacto_emergencia WHERE contacto_emergencia
   IS NOT NULL`.
2. Backend (`apps/personal/src/main.ts`): aceptar los 3 campos nuevos en alta
   y edición; dejar de leer/escribir `contacto_emergencia`; el mapeo de salida
   expone los 3 campos nuevos.
3. Frontend (`PersonalView.tsx`, `credencialesPrint.ts`): reemplazar el input
   único por 3 inputs en alta y edición; actualizar tipos; actualizar render
   de credencial.
4. Actualizar tests existentes que referencian `contacto_emergencia`
   (`PersonalView.editar-empleado.test.tsx`,
   `PersonalView.imprimir-lote-credenciales.test.tsx`) + agregar cobertura de
   los 3 campos nuevos.
5. Verificar contra el VPS real (dato migrado visible, alta/edición
   funcionando, credencial imprimiendo teléfono) antes de archivar, siguiendo
   la práctica ya usada en changes anteriores de `personal`.

Rollback: la migración solo agrega columnas y copia datos (no destructiva);
revertir el código de aplicación a la versión anterior sigue funcionando sin
necesidad de revertir la migración, porque `contacto_emergencia` no se toca.

## Open Questions

Ninguna — alcance y comportamiento quedaron definidos arriba.
