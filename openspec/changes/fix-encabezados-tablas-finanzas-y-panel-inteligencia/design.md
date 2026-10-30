## Context

`@bocam/ui-core` (`packages/ui-core/src/primitives.tsx`) sigue la convención de shadcn: `TableHeader` → `<thead>`, `TableHead` → `<th>`. En `FinanzasView.tsx` los nombres se usaron al revés en las tablas "Presupuestos asignados" y "Pagos de OCs". Como React crea el DOM sin pasar por el parser de HTML, el navegador no "corrige" la anidación inválida: queda un único `<th>` en la tabla que contiene 7 `<thead>`, cada uno en su propio bloque, y por eso los títulos se apilan en la primera columna. Las clases `text-right` caen en los `<thead>` y no alinean nada.

## Goals / Non-Goals

**Goals:**
- Encabezado y filas con la misma estructura: un `<th>` por cada `<td>`, en el mismo orden.
- Títulos de montos alineados a la derecha, igual que sus celdas.
- Panel "Inteligencia financiera" oculto por defecto sin borrar su código.

**Non-Goals:**
- Conectar el panel a datos reales (otro change).
- Quitar otros valores fijos de la vista (por ejemplo "Impacto en caja 65%").
- Renombrar los componentes de `ui-core` o cambiar su API.

## Decisions

1. **Corregir el uso, no el componente.** El resto de las vistas usa bien `TableHeader`/`TableHead`; solo esta vista los tiene invertidos. Cambiar `ui-core` rompería las demás.
2. **Bandera por variable de build (`import.meta.env`), en un módulo propio.** `src/lib/feature-flags.ts` exporta `FLAGS.inteligenciaFinanciera = import.meta.env.VITE_FLAG_INTELIGENCIA_FINANCIERA === 'true'`. Cualquier otro valor, o su ausencia, la deja apagada. Alternativas descartadas: una constante en la vista, que no se puede encender sin editar código; y una bandera en backend, que es desproporcionada para un panel sin datos. Al vivir en un módulo, los tests pueden activarla con `vi.mock`.
3. **El layout no queda con hueco.** Hoy el panel comparte columna con "Proyección semanal"; al ocultarlo, esa columna conserva solo esa tarjeta.

## Risks / Trade-offs

- [Alguien espera ver el panel en producción] → El panel no mostraba nada real; la bandera permite encenderlo en un build cuando use datos reales.
- [Hay otros valores fijos en la vista] → Se anotan en la propuesta como fuera de alcance.
