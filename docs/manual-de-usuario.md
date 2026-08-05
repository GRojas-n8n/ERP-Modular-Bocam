# Manual de Usuario — OBSOLETO

Este documento quedó **retirado el 2026-08-05**. Su contenido describía pestañas y flujos que ya no existen en la aplicación (ej. Gerencia Técnica como "Insumos / Presupuesto / APU / Comparativa" cuando el nav real es "Catálogo de Obra / Insumos / Control de Costos / Control Presupuestal / Transferencias / Trazabilidad") y se desactualizaba en silencio porque vivía fuera de la app.

## Dónde está la ayuda ahora

Cada uno de los 13 módulos del sidebar tiene un botón **"?"** en su encabezado que abre un panel de ayuda contextual: qué hace el módulo, sus roles típicos, el flujo de negocio, con qué otros módulos se conecta, una sección por cada pestaña visible, y errores comunes con causa y solución.

Esa ayuda in-app:
- Vive junto al código (`apps/app-shell/src/help/`) y tiene un test de cobertura (`help/registry.test.ts`) que falla en CI si un módulo o pestaña del sidebar se queda sin ayuda o si sobra ayuda de una pestaña que ya no existe.
- Es la fuente de verdad. Este archivo no se debe reescribir a mano — cualquier corrección de contenido va en `apps/app-shell/src/help/content/*.ts`.

Ver spec: `openspec/specs/ayuda-contextual-modulo/spec.md`.
