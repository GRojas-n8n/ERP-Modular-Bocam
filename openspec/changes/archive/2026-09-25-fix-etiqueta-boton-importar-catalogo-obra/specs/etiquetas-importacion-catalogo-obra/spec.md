## ADDED Requirements

### Requirement: Etiqueta de los botones de importación en Catálogo de Obra
El sistema SHALL etiquetar como "Importar Catálogo de Conceptos" todo botón que dispare la importación del presupuesto exportado (desde OPUS u otro origen) en la pestaña "Catálogo de Obra" de Gerencia Técnica, sin nombrar el software externo de origen en la etiqueta del botón.

#### Scenario: Botón en la barra de acciones con presupuesto ya cargado
- **WHEN** el usuario abre la pestaña "Catálogo de Obra" y ya existe un presupuesto cargado
- **THEN** el botón de la barra de acciones que abre el selector de archivo dice "Importar Catálogo de Conceptos"

#### Scenario: Botón en el estado vacío sin catálogo cargado
- **WHEN** el usuario abre la pestaña "Catálogo de Obra" y no existe presupuesto cargado (estado "Sin catálogo cargado")
- **THEN** el botón que abre el selector de archivo dice "Importar Catálogo de Conceptos", igual que en la barra de acciones

#### Scenario: El texto explicativo del origen del archivo no cambia
- **WHEN** se muestra la guía o el texto de ayuda que indica desde dónde exportar el archivo
- **THEN** ese texto puede seguir nombrando OPUS como el software de origen, ya que no es la etiqueta de un botón de acción
