## Context

`PersonalView.tsx` ya mantiene en memoria, para la vista de empleados: la lista completa de `empleados`, las `asignacionesFrente` (cuadrilla/frente de trabajo por empleado) y la relación empleado↔residente vigente (usada para resolver `residente_nombre`, ver `directorio-usuarios-por-rol`/`edicion-datos-empleado`). El flujo `handleImprimirSeleccionados` ya resuelve, para un `Set<string>` de `empleado_ids`, los tokens de credencial vía `POST .../credenciales/imprimir-lote` y arma el QR client-side con `qrcode`. Esta capability es la base a extender: no hay necesidad de un endpoint nuevo, solo de (a) filtrar qué entra al `Set` antes de llamar al endpoint existente, y (b) un layout imprimible alterno más compacto (solo QR) además del ya existente (`construirHojaCredenciales`, credencial completa con foto/reverso).

## Goals / Non-Goals

**Goals:**
- Permitir acotar el universo de empleados seleccionables por residente vigente, cuadrilla/frente de trabajo, categoría, y texto libre (nombre/número), antes de tildar checkboxes o usar "seleccionar todos".
- Ofrecer una descarga de hoja de **solo QR** (QR + nombre + número), como alternativa a la hoja de credencial completa, sobre el mismo mecanismo de selección y el mismo endpoint.
- Mantener el mismo comportamiento de exclusión/aviso que ya tiene `imprimir-lote` para empleados no elegibles del proyecto activo.

**Non-Goals:**
- No se agrega selector de proyecto (se usa el proyecto activo global, decisión ya tomada con el usuario).
- No se agrega un formato ZIP de PNGs individuales en esta iteración (se descartó a favor de PDF de solo QR).
- No se crea un endpoint de filtrado en el backend — el filtrado es 100% client-side sobre datos ya cargados por la vista.
- No se modifica el layout ni el contrato de la hoja de credencial completa existente (`construirHojaCredenciales`).

## Decisions

- **Filtrado 100% client-side, con una extensión mínima y aditiva de `GET /api/v1/personal/empleados`**: al implementar se confirmó que `categoria` y `cuadrilla` ya vienen en el listado bulk de empleados, pero `frente_trabajo` (AsignacionFrente) y el residente vigente (AsignacionResidente) solo se cargaban hoy por empleado individual (al abrir su panel de configuración), no en el listado completo. En vez de agregar un endpoint de filtrado nuevo, se extiende el `include` ya existente de `GET /empleados` para traer, por empleado, sus `AsignacionFrente` activas (relación `asignaciones` ya declarada en el modelo `Empleado`) y sus `AsignacionResidente` vigentes (`fecha_fin: null`, relación `asignacionesResidente` ya declarada) — mismo endpoint, mismo contrato para consumidores existentes, solo campos nuevos en la respuesta. El nombre del residente para el selector de filtro se resuelve con el endpoint ya existente `GET /api/v1/personal/residentes-disponibles` (ya usado en otra parte de `PersonalView`), sin llamada nueva a auth. El filtrado en sí (aplicar los criterios sobre la lista ya cargada) sigue siendo 100% client-side. Alternativa descartada: agregar query params de filtro al backend — más trabajo y no resuelve el problema real, que era falta de datos en la respuesta, no falta de filtrado server-side.
- **Reutilizar `POST /credenciales/imprimir-lote` sin cambios de contrato**: el endpoint ya retorna token + datos mínimos por empleado y ya aplica la regla de elegibilidad por proyecto activo. Tanto "Imprimir credenciales" como el nuevo "Descargar QR" llaman al mismo endpoint con el `Set` de ids ya filtrado; solo cambia qué función de layout (`construirHojaCredenciales` vs. la nueva `construirHojaSoloQR`) consume la respuesta en el frontend.
- **Nueva función `construirHojaSoloQR` en `credencialesPrint.ts`**, hermana de `construirHojaCredenciales`, en vez de agregar un flag `soloQR` a la función existente: mantiene cada función simple y evita condicionales de layout dispersos en un HTML ya denso (grid CR80 a doble cara). Alternativa descartada: parametrizar la función existente con un modo — se rechazó por acoplar dos layouts visualmente muy distintos (credencial física vs. hoja de QRs para recortar/pegar) en una sola función.
- **Filtros como controles independientes combinables (AND)**: residente + cuadrilla/frente + categoría + texto libre se aplican todos simultáneamente sobre `empleados`, igual que un patrón de filtro de tabla convencional. No se modela como query builder ni combinaciones OR.

## Risks / Trade-offs

- [Filtrado client-side no escala si un tenant llega a tener miles de empleados activos] → Aceptable: la tabla de empleados de `PersonalView` ya se renderiza completa hoy sin paginación server-side; este cambio no empeora ese límite existente.
- [Confusión entre "Imprimir credenciales" y "Descargar QR" como dos botones similares] → Mitigar con labels explícitos y con texto de ayuda distinto (credencial completa vs. solo QR para pegar/repartir).
- [Un empleado sin credencial activa incluido en el filtro dispara emisión automática de una credencial nueva, igual que hoy en imprimir-lote] → Comportamiento ya existente y ya cubierto por el requirement de `credencial-empleado`; se documenta explícitamente en el nuevo requirement para que no sea sorpresa al reusar el endpoint desde un botón distinto.

## Open Questions

Ninguna — decisiones de formato (PDF), alcance de filtro por proyecto (usar proyecto activo), y origen del QR (mismo token de credencial) ya confirmadas con el usuario antes de este documento.
