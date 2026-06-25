# Spec: Categorías de Gasto

## Comportamiento esperado

### Catálogo predefinido del sistema

El sistema provee 10 categorías predefinidas mediante seed en la BD de `gerencia-tecnica`. Sirven como punto de partida y mapean directamente al `tipo_insumo` del catálogo GT:

| Categoría del sistema | Mapeo automático desde `tipo_insumo` |
|---|---|
| Materiales | MATERIAL |
| Equipo Mayor | EQUIPO |
| Herramienta y Equipo Menor | EQUIPO (excepción manual) |
| Servicios y Subcontratos | SUBCONTRATO |
| Agua | MATERIAL (excepción manual) |
| Rentas | EQUIPO (excepción manual) |
| EPP (Equipo de Protección Personal) | MATERIAL (excepción manual) |
| Mano de Obra Subcontratada | MANO_DE_OBRA |
| Indirectos y Gastos Generales | INDIRECTO |
| Otros | — (sin mapeo) |

### Quién gestiona las categorías

**Control de Proyectos** (`control_obra`, `superintendent`, `admin`), no GT. GT solo gestiona la ficha técnica del insumo (clave, descripción, costo, tipo_insumo).

### CRUD de categorías (por proyecto)

- `GET /api/v1/gerencia-tecnica/proyectos/:id/categorias-gasto` — lista (todos los roles del tenant)
- `POST /api/v1/gerencia-tecnica/proyectos/:id/categorias-gasto` — crea (roles: control_obra, admin)
- `PUT /api/v1/gerencia-tecnica/categorias-gasto/:id` — renombra; 403 si proyecto ACTIVO (roles: control_obra, admin)
- `DELETE /api/v1/gerencia-tecnica/categorias-gasto/:id` — elimina si sin insumos asignados; 403 si proyecto ACTIVO (roles: admin)

### Clasificación de insumos por Control de Proyectos

**Proceso al iniciar un proyecto:**

1. CP entra a ControlObraView → tab "Configuración" → sección "Clasificación de Insumos"
2. El sistema muestra los insumos del catálogo GT agrupados por `tipo_insumo`
3. Cada grupo tiene una categoría sugerida (auto-mapeo) con botón **"Aplicar a todos"**
4. CP revisa y corrige insumos individuales con excepciones (ej. "Agua potable" de MATERIAL → Agua)
5. Los insumos sin categoría aparecen destacados como **"Sin clasificar"**
6. CP guarda la clasificación → se almacena en `insumos.categoria_gasto_id`

**Alcance global:** la categoría asignada a un insumo aplica a **todos los proyectos** del tenant. Si CP la cambia en un proyecto, cambia globalmente. Si necesita diferencia por proyecto, usa la tabla de overrides `clasificacion_insumo_proyecto` (ver design.md).

### Congelación al activar el proyecto

- Cuando `proyecto.estado` pasa a `ACTIVO`, los endpoints POST/PUT/DELETE de categorías devuelven `403: "PROYECTO_ACTIVO: categorías congeladas"`
- La UI de clasificación muestra los datos en modo lectura con badge "Proyecto Activo"
- El cambio de estado (`CONFIGURACION → ACTIVO`) lo hace el `admin` desde AdminView

### Vista de resumen de clasificación

Antes de activar el proyecto, CP ve:

```
✅ 287 insumos clasificados
⚠️  14 insumos sin categoría  ← botón "Clasificar pendientes"

Por categoría:
  Materiales                  · 124 insumos
  Equipo Mayor                ·  43 insumos
  Servicios y Subcontratos    ·  38 insumos
  Mano de Obra Subcontratada  ·  28 insumos
  ...
  Sin clasificar              ·  14 insumos  ⚠️
```
