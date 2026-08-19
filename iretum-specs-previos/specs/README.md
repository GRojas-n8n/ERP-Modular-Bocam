# specs/ — iRetum SDD

## ¿Cómo funciona SDD en un proyecto que ya tiene código?

SDD puro (spec → código) es para proyectos verdes. iRetum tiene ~60% hecho.
No aplicas SDD al pasado — aplicas SDD **hacia adelante**.

### Tres formas de aplicar SDD en iRetum

| Situación | SDD se aplica | Cómo |
|---|---|---|
| Módulo nuevo | ✅ SDD puro | Spec en `specs/modules/` → Claude Code implementa |
| Bug existente | ✅ Bug-fix cycle | Spec corto del bug → test que falla → Claude Code fix |
| Feature nuevo sobre código legacy | ✅ Feature spec | Spec del feature → Claude Code implementa SIN tocar el resto |
| Refactor de legacy | ⚠️ Solo con spec | Spec de refactor → QA gate → pruebas manuales → ejecución |

### Lo que NO funciona en iRetum

- Querer spec de todo el 60% existente antes de tocar nada (parálisis)
- Que Claude Code refactorice microservicios sin supervisión
- Tests E2E ciegos sin entender la arquitectura de eventos

### Flujo de trabajo para cada caso

#### 1. Módulo nuevo (ej. Ventas, puerto 3012)

```
specs/modules/ventas/spec.md (brief + data model + casos borde)
  → Claude Code implementa (TDD: test → código)
  → QA gate manual
  → PR contra main
  → Docker build + deploy
```

#### 2. Bug existente

```
spec del bug (specs/bugs/bug-XX-descripcion.md)
  → test que reproduce el bug
  → Claude Code arregla
  → PR contra main
```

#### 3. Feature nuevo en módulo legacy

```
spec del feature (specs/features/YY-descripcion.md)
  → Claude Code implementa (solo archivos del feature)
  → pruebas de regresión (los tests legacy deben seguir pasando)
  → PR
```

## Archivos en este directorio

| Archivo | Propósito |
|---|---|
| `README.md` | Esta guía — cómo usar SDD en iRetum |
| `qa-strategy.md` | Estrategia completa de QA/testing |
| `modules/` | Subsistema de specs de módulos |
| `modules/pendientes.md` | Módulos faltantes y orden de prioridad |
| `bugs/` | Bug reports con spec (se crean según aparecen) |
| `features/` | Specs de features nuevos sobre legacy |

## Regla cardinal

Si el archivo que vas a tocar NO está en un spec → **NO LO TOQUES**.
Si el bug/feature afecta un archivo legacy → el spec debe describir EXACTAMENTE qué archivos se modifican y por qué.