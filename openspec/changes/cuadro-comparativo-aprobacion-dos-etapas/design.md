## Context

El módulo de Compras tiene un `CuadroComparativo` con dos únicos estados (`ABIERTO` → `CERRADO`) y un endpoint `/comparativas/:id/convertir-oc` que cualquier usuario con rol `procurement` o `admin` puede invocar sin restricción técnica ni gerencial. Esto contradice el proceso real de adquisiciones de Bocam, donde la generación de una OC requiere que un Residente valide idoneidad técnica y un Gerente Técnico apruebe la adjudicación.

El schema actual de `ComparativaDetalle` registra el precio y un flag `es_ganador` por renglón, pero no captura ninguna evaluación de calidad ni trazabilidad de quién tomó cada decisión.

**Restricciones conocidas:**
- Hay registros de cuadros existentes con `estado = 'ABIERTO'` o `'CERRADO'` en el VPS que deben migrar sin pérdida.
- El módulo `gerencia-tecnica` (backend, puerto 3001) NO está involucrado en esta implementación: el Gerente Técnico actúa a través del módulo `compras` usando su rol `gerencia_tecnica` en el JWT.
- No se emiten notificaciones push ni emails en esta versión: la comunicación es mediante las bandejas de trabajo en el frontend.

## Goals / Non-Goals

**Goals:**
- Introducir una máquina de estados explícita para `CuadroComparativo` con transiciones controladas y protegidas por rol.
- Capturar la evaluación técnica del Residente (por renglón) con auditoría completa (quién, cuándo, comentario).
- Capturar la aprobación del Gerente Técnico (por renglón) con la restricción de que el rechazo técnico del Residente es vinculante.
- Garantizar que solo los renglones con `aprobacion_gt = APROBADO` se conviertan en ítems de OC.
- Migrar los datos existentes sin romper el sistema en producción.

**Non-Goals:**
- Notificaciones por email o push cuando un cuadro pasa de etapa.
- Integración con el módulo `gerencia-tecnica` (backend): el actor GT opera solo por JWT en el módulo `compras`.
- Versionado o reenvío de cuadros rechazados (RECHAZADO_GT cierra el cuadro; una nueva cotización implica un nuevo cuadro).
- Flujo de apelación o reconsideración post-rechazo.
- Cambios en el módulo `finanzas` (la validación de suficiencia se mantiene tal como está).

## Decisions

### D1: Máquina de estados con 7 valores en lugar de enum Postgres

**Decisión**: Los estados se almacenan como `String` en Prisma con validación en la capa de aplicación, no como un `enum` de PostgreSQL.

**Alternativa considerada**: Añadir un `CREATE TYPE` de enum Postgres. Requeriría una migración DDL más compleja y rompe el patrón de todos los demás modelos del sistema que usan `String` para estados.

**Rationale**: Consistencia con el resto del schema. Las transiciones inválidas se rechazan en el handler con un `400`, no a nivel de BD.

---

### D2: La evaluación técnica del Residente es vinculante — el GT no puede aprobar renglones rechazados por el Residente

**Decisión**: En el handler de `revisar-gt`, si un ítem de `aprobaciones[]` tiene `aprobacion_gt = APROBADO` pero el `ComparativaDetalle` correspondiente tiene `evaluacion_tecnica = RECHAZADO`, el sistema responde `400` con mensaje claro.

**Alternativa considerada**: Permitir al GT hacer override del rechazo técnico con justificación. Introduce complejidad de auditoría y crea un precedente de evasión del criterio técnico que Bocam no desea.

**Rationale**: La evaluación técnica es una barrera de cumplimiento de especificaciones, no solo una recomendación.

---

### D3: Los renglones aprobados por el GT pero sin `es_ganador = true` no generan OC

**Decisión**: La conversión a OC solo usa detalles donde `aprobacion_gt = APROBADO` **y** `es_ganador = true`. El GT aprueba idoneidad; Compras ya había marcado el ganador de precio. Si el GT aprueba pero el renglón no es ganador, no hay OC para ese renglón.

**Rationale**: El campo `es_ganador` ya expresa la decisión comercial de Compras. El GT valida la decisión técnica. Ambas condiciones deben cumplirse para comprometer fondos.

---

### D4: Un cuadro con todos los renglones rechazados por el GT pasa a `RECHAZADO_GT` y no puede reabrirse

**Decisión**: Si el handler `revisar-gt` produce 0 renglones con `aprobacion_gt = APROBADO`, el cuadro pasa a `RECHAZADO_GT`. No existe transición de `RECHAZADO_GT` a ningún otro estado activo. El equipo de Compras debe crear un nuevo cuadro.

**Rationale**: Un cuadro rechazado en su totalidad debe generar un nuevo proceso de cotización, no modificar el existente, para mantener trazabilidad de auditoría.

---

### D5: Migración de datos — ABIERTO→BORRADOR, APROBADO→APROBADO_GT, CERRADO permanece

**Decisión**: La migración Prisma incluye un `UPDATE` SQL para remapear los valores existentes antes de aplicar restricciones:
```sql
UPDATE cuadros_comparativos SET estado = 'BORRADOR' WHERE estado = 'ABIERTO';
UPDATE cuadros_comparativos SET estado = 'APROBADO_GT' WHERE estado = 'APROBADO';
-- CERRADO permanece como CERRADO
```

**Rationale**: Preserva la semántica. Los cuadros `ABIERTO` no han iniciado el flujo de aprobación → `BORRADOR`. Los `APROBADO` ya tenían una aprobación implícita → `APROBADO_GT`.

---

### D6: `enviado-gt` es un paso explícito separado de `evaluar`

**Decisión**: El Residente primero registra todas sus evaluaciones (`PATCH /evaluar` → `EVALUADO_TECNICAMENTE`) y luego, en un segundo paso explícito, lo envía al GT (`PATCH /enviar-gt` → `EN_APROBACION_GT`).

**Alternativa considerada**: Que `/evaluar` envíe automáticamente al GT cuando todos los renglones tienen evaluación.

**Rationale**: El Residente puede querer guardar evaluaciones parciales y continuarlas. El envío explícito es un acto consciente de "certifico que mi revisión está completa".

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Cuadros existentes en `ABIERTO` quedan en `BORRADOR` y bloquean a Compras si ya tienen un ganador seleccionado | Incluir en release notes: los cuadros `BORRADOR` con `es_ganador` seleccionado deben usar el nuevo flujo. Compras puede reenviar a evaluación inmediatamente. |
| El GT puede quedar como cuello de botella si hay muchos cuadros en `EN_APROBACION_GT` | Fuera de alcance de esta implementación. A documentar como proceso organizacional en Bocam. |
| El handler `convertir-oc` actual en el frontend llama el endpoint sin verificar estado | El backend rechaza con `400` si `estado !== APROBADO_GT`. El frontend recibirá el error y debe mostrar el mensaje. Se actualiza también el frontend en esta misma iteración. |
| Un residente puede rechazar todos los renglones accidentalmente | El sistema lo permite. El cuadro pasa a `EVALUADO_TECNICAMENTE` con todos `RECHAZADO`; al intentar `enviar-gt` el backend bloquea con `400` "Sin renglones aprobados técnicamente — no es posible remitir al GT". El residente puede reevaluar porque el estado es `EVALUADO_TECNICAMENTE`, no terminal. |

## Migration Plan

1. **Rama feature en git**: `feature/BOCAM-comparativa-aprobacion-dos-etapas`
2. **Migracion Prisma**: `prisma migrate dev` local → genera SQL con ALTER TABLE + UPDATE de datos existentes.
3. **Deploy VPS**:
   ```bash
   git pull origin main
   docker compose -f docker-compose.vps.yml --profile core build --no-cache compras
   docker compose -f docker-compose.vps.yml --profile core up -d compras
   # Prisma migrate deploy se ejecuta al arrancar el contenedor (en startServer o script de init)
   ```
4. **Rollback**: Si falla, revertir imagen previa. Los nuevos campos son `nullable` por defecto en la migración, sin `NOT NULL` sin default — safe to roll back.
5. **Validación post-deploy**: Verificar `GET /api/v1/compras/comparativas` retorna cuadros con nuevos campos; verificar que cuadros existentes tienen `estado = BORRADOR` o `CERRADO`.

## Open Questions

- ¿El Residente puede modificar su evaluación técnica después de haberla enviado al GT (si el GT aún no ha actuado)? → Por ahora NO: `EN_APROBACION_GT` es de solo lectura para el Residente. Puede revisarse en una iteración futura.
- ¿Debe el cuadro `RECHAZADO_GT` notificar automáticamente a Compras? → Fuera de alcance en esta versión; queda visible en la bandeja de Compras como `RECHAZADO_GT`.
