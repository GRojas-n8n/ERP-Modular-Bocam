## ADDED Requirements

### Requirement: La carga de ficha técnica por insumo SHALL ocurrir únicamente desde el formulario de Nueva Requisición
El sistema SHALL exponer el control de carga de ficha técnica
(`POST /api/v1/gerencia-tecnica/insumos/:insumoId/fichas`) solo desde el
formulario de Nueva Requisición en la vista de Residencia. Ninguna otra
pantalla del flujo Requisición→OC SHALL ofrecer un control para subir o
reemplazar una ficha técnica.

#### Scenario: Residente sube ficha técnica al crear la requisición
- **WHEN** el Residente adjunta una ficha técnica a un ítem del catálogo
  mientras arma la Nueva Requisición
- **THEN** el sistema la asocia al insumo del catálogo mediante el endpoint
  existente, sin cambios de comportamiento respecto a hoy

#### Scenario: Cuadro Comparativo no ofrece control de carga
- **WHEN** Compras abre el Cuadro Comparativo de una requisición
- **THEN** la interfaz no muestra ningún botón para subir o reemplazar una
  ficha técnica de insumo

### Requirement: El Cuadro Comparativo SHALL mostrar las fichas técnicas asociadas en modo solo lectura
El sistema SHALL permitir consultar y descargar, desde el Cuadro
Comparativo, las fichas técnicas ya asociadas a los insumos de la
requisición, sin ofrecer ninguna acción de escritura sobre ellas desde esa
pantalla.

#### Scenario: Consultar ficha técnica desde el Cuadro Comparativo
- **WHEN** Compras abre un renglón cuyo insumo tiene una ficha técnica
  asociada
- **THEN** el sistema muestra un enlace de descarga/consulta de esa ficha,
  sin ningún control para modificarla o reemplazarla desde ahí
