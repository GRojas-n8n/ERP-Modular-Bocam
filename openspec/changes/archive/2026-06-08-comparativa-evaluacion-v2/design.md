# Design — comparativa-evaluacion-v2

## Context

El `CuadroComparativo` tiene un state machine definido:
`BORRADOR → EN_EVALUACION_TECNICA → EVALUADO_TECNICAMENTE → EN_APROBACION_GT → APROBADO_GT → CERRADO`

Este change extiende ese state machine con `LOCKED` y `SUPERSEDIDO`, y añade la granularidad técnica necesaria para una evaluación ISO-compliant.

## Goals

- Reemplazar evaluación binaria por C/NC/DA con trazabilidad del valor ofrecido.
- Permitir aclaraciones documentadas por celda sin perder el estado de evaluación.
- Garantizar que un cuadro firmado nunca puede ser modificado (ni por el Residente, ni por admin, ni por un script).
- Crear historial de revisiones legible y comparable.

## Non-Goals

- Flujo de notificaciones push cuando se agregan aclaraciones (fuera de scope, podría ser futuro).
- Comparación side-by-side de revisiones en la UI (solo se muestra la activa; el historial es navegable).
- Firma con certificado criptográfico externo (la "firma digital" es la captura auditada de userId + timestamp en DB, no PKI).

## Decisions

**D1 — LOCKED se agrega después de EVALUADO_TECNICAMENTE, antes de EN_APROBACION_GT.**
El Residente firma su evaluación técnica. El cuadro pasa a LOCKED y habilita el flujo de aprobación económica (GT → Finanzas → OC). Un cuadro LOCKED puede ser aprobado o rechazado por GT, pero sus datos técnicos son inmutables.

**D2 — Nueva revisión = clonar todo el cuadro, no diff.**
Rev B es un nuevo `CuadroComparativo` con `revision = 'B'` y `revision_padre_id = id_rev_a`. Todos sus `ComparativaDetalle` y `ComparativaLinea` se copian. El original (Rev A) pasa a `SUPERSEDIDO`. Decisión del usuario confirmada. Ventaja: la UI puede cargar cualquier revisión de forma independiente sin reconstruir.

**D3 — `valor_ofrecido_spec` es texto libre.**
El comprador captura lo que el proveedor ofrece en sus propios términos ("Ø 2 cédula 40 A53", "no especifica", "cotización adjunta"). No se normaliza — la comparación la hace el Residente con criterio técnico.

**D4 — El trigger DB de inmutabilidad usa `RAISE EXCEPTION`.**
La excepción sube hasta el `$transaction` de Prisma y se convierte en error 500, que el backend transforma en 403 con mensaje `COMPARATIVA_LOCKED`. La protección existe en dos capas: backend (chequeo explícito) y motor DB (trigger de failsafe).

**D5 — `?` es el cuarto valor de evaluación técnica, no un indicador derivado.**
Compras no conoce las especificaciones técnicas — su rol es capturar `valor_ofrecido_spec` transcribiendo lo que el proveedor ofrece. El Residente evalúa. Cuando el Residente no puede decidir con los datos actuales, marca la celda como `?` con comentario de qué falta. Esto crea automáticamente una `AclaracionComparativa` de tipo PREGUNTA dirigida a Compras. Una celda `?` bloquea el firmado. Cuando el Residente re-evalúa la celda como C/NC/DA, el sistema resuelve automáticamente las aclaraciones abiertas de esa celda.

**D6 — Compras puede actualizar `valor_ofrecido_spec` en cualquier momento antes de LOCKED.**
Cuando Compras obtiene más info del proveedor en respuesta a un `?`, actualiza `valor_ofrecido_spec` y agrega manualmente una `AclaracionComparativa` de tipo RESPUESTA. El Residente ve la respuesta y re-evalúa.

**D6 — La selección de primera/segunda opción es requisito para firmar.**
El endpoint `POST /comparativas/:id/firmar` retorna 400 si `primera_opcion_proveedor_id` es null. La segunda opción es opcional.

## State Machine actualizado

```
BORRADOR
  → EN_EVALUACION_TECNICA       (enviar al Residente)
  → LOCKED                      (firmar por Residente — INMUTABLE desde aquí)
  → EN_APROBACION_GT            (enviar a GT para revisión económica)
  → APROBADO_GT                 (GT aprueba)
  → CERRADO                     (convertido a OC)
  → RECHAZADO_GT                (terminal — puede generar nueva revisión)
  → SUPERSEDIDO                 (reemplazado por una revisión posterior)
```

## Migration Plan

1. Alter `comparativas_detalles`: agregar `valor_ofrecido_spec TEXT`, cambiar constraint de `evaluacion_tecnica` a aceptar C/NC/DA (en Prisma: solo cambiar el valor default y documentar los valores válidos; la validación es en backend).
2. Alter `cuadros_comparativos`: agregar `revision VARCHAR(5) DEFAULT 'A'`, `firmado_por UUID`, `fecha_firma TIMESTAMPTZ`, `revision_padre_id UUID NULLABLE`, `primera_opcion_proveedor_id UUID NULLABLE`, `segunda_opcion_proveedor_id UUID NULLABLE`.
3. Crear modelo `AclaracionComparativa`.
4. Ejecutar `prisma migrate dev`.
5. Aplicar trigger SQL manualmente en VPS (como en `oc-error-finanzas-alert`).
6. Implementar endpoints backend.
7. Actualizar `ComparativaDetail.tsx` y `ResidenciaView.tsx`.
8. Deploy en VPS.

## Risks

**R1 — Registros existentes con `evaluacion_tecnica = 'APROBADO'`.**
Tras la migración, los valores válidos son C/NC/DA/PENDIENTE. Los registros históricos con APROBADO/RECHAZADO quedan con valores legacy. El backend debe aceptar ambos conjuntos de valores en lectura para no romper cuadros ya cerrados. Para escritura nueva, solo acepta C/NC/DA/PENDIENTE.

**R2 — El trigger puede bloquear migraciones futuras.**
Si una migración de Prisma intenta hacer UPDATE en `cuadros_comparativos` para rellenar datos, el trigger lo bloqueará si el estado es LOCKED. Solución: en el script de migración del VPS, deshabilitar el trigger temporalmente con `ALTER TABLE cuadros_comparativos DISABLE TRIGGER trg_comparativa_locked`, ejecutar el fill, re-habilitar.
