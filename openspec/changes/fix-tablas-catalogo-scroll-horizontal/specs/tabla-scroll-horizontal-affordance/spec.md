## ADDED Requirements

### Requirement: Toda tabla de catálogo con overflow horizontal SHALL permitir scroll
Ninguna tabla de catálogo o listado del app-shell SHALL usar un contenedor con
`overflow-hidden` cuando la tabla interna fuerza un ancho mínimo mayor al del
contenedor visible. Todo contenedor de tabla cuyo contenido pueda exceder el ancho
disponible SHALL habilitar scroll horizontal.

#### Scenario: Tabla con más columnas de las que caben en pantalla
- **WHEN** una tabla de catálogo (ej. Control de Costos WBS, Trazabilidad,
  proveedores, nómina, movimientos contables) tiene un ancho mínimo mayor al
  ancho visible del contenedor
- **THEN** el usuario puede desplazar la tabla horizontalmente hasta ver todas
  las columnas, sin que ninguna columna quede recortada de forma inaccesible

### Requirement: Toda tabla con scroll horizontal disponible SHALL mostrar una señal visual de contenido oculto
Cuando una tabla de catálogo tiene columnas ocultas fuera del área visible (a la
izquierda y/o a la derecha), el contenedor SHALL mostrar una indicación visual
distinta del scrollbar nativo (por ejemplo, una sombra o gradiente en el borde
correspondiente) que comunique al usuario que hay más contenido desplazable.

#### Scenario: Carga inicial de una tabla con columnas ocultas a la derecha
- **WHEN** el usuario abre una vista con una tabla de catálogo cuyo contenido
  excede el ancho visible y el scroll está en la posición inicial (extremo
  izquierdo)
- **THEN** se muestra una señal visual en el borde derecho de la tabla indicando
  que hay columnas adicionales hacia la derecha

#### Scenario: Usuario desplaza la tabla hasta el final
- **WHEN** el usuario desplaza la tabla horizontalmente hasta el extremo derecho
  (no queda contenido oculto a la derecha)
- **THEN** la señal visual del borde derecho desaparece

#### Scenario: Usuario desplaza la tabla desde el extremo izquierdo
- **WHEN** el usuario desplaza la tabla horizontalmente de modo que queda
  contenido oculto a la izquierda
- **THEN** se muestra una señal visual en el borde izquierdo de la tabla

#### Scenario: Tabla que cabe completa en el ancho visible
- **WHEN** una tabla de catálogo no excede el ancho visible del contenedor (no
  hay overflow horizontal)
- **THEN** no se muestra ninguna señal visual de scroll en ningún borde
