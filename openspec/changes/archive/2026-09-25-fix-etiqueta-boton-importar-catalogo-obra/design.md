## Context

Ambos botones llaman al mismo handler (`fileInputRef.current?.click()`), que abre el selector de archivo para importar el presupuesto exportado de OPUS. Solo cambia su etiqueta visible; el input de archivo, el parser y el endpoint de importación no se tocan.

## Goals / Non-Goals

**Goals:**
- Que el nombre de la acción en pantalla describa qué se importa (el catálogo de conceptos), no el software externo de origen.
- Mantener consistente el texto entre ambos botones que disparan la misma acción.

**Non-Goals:**
- No se cambia el texto explicativo que sí necesita nombrar OPUS como origen del archivo a exportar.
- No se toca el parser, el formato esperado del archivo, ni el flujo de vista previa/confirmación de importación.

## Decisions

- **Texto único "Importar Catálogo de Conceptos" para ambos botones:** se descarta mantener "Importar OPUS" en uno y "Importar Catálogo de Conceptos" en otro — dejaría una inconsistencia visible para la misma acción según el estado de la pantalla (con o sin presupuesto ya cargado).

## Risks / Trade-offs

- [Riesgo] Ninguno relevante — es un cambio de texto sin efecto funcional.
