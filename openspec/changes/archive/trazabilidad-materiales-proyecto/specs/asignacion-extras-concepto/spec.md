# Spec — Asignación de Extras a Concepto (Incisos)

## Criterios de Aceptación

**CA-1: Solo materiales EXTRA pueden asignarse a concepto**
- Dado un renglón con semáforo EXTRA (sin presupuesto de origen)
- Cuando el usuario procurement/admin hace clic en "Asignar a Partida"
- Entonces aparece un picker con los conceptos del catálogo del proyecto
- Y puede seleccionar el concepto al que pertenece lógicamente este gasto

**CA-2: El monto extra aparece en los totales del concepto**
- Dado que un inciso extra fue asignado al concepto "02.03 Instalación Eléctrica" con monto $5,200
- Y ese concepto tiene monto_base $80,000
- Cuando se consulta el resumen por concepto
- Entonces el total del concepto es $85,200 con desglose: base $80,000 + extra $5,200

**CA-3: La justificación del ítem es visible en el inciso**
- Al expandir un concepto con incisos extra
- Cada inciso muestra el texto de justificación del requisitante

**CA-4: Un mismo ítem solo puede asignarse una vez**
- Si un ítem ya tiene asignación a un concepto, el botón "Asignar" cambia a "Re-asignar"
- Re-asignar elimina la asignación anterior y crea la nueva (no duplica)

**CA-5: No se puede eliminar asignación si la OC está EMITIDA**
- Dado que la OC que cubre ese ítem ya está en estado EMITIDA
- Cuando el usuario intenta eliminar el inciso
- Entonces el sistema rechaza con: "No se puede desasignar: la OC ya fue emitida"

**CA-6: Residente y gerencia_técnica pueden ver incisos pero no modificarlos**
- Los roles resident, residencia, gerencia_tecnica ven los incisos con su justificación
- El botón "Asignar" y "Eliminar inciso" solo es visible para procurement y admin
