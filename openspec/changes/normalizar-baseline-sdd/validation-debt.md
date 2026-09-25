# Deuda de validación OpenSpec — 2026-09-24

Comando de línea base:

```text
openspec validate --all --strict --json
```

## Línea base inicial

| Tipo | Total | Válidos | Inválidos |
|---|---:|---:|---:|
| Changes activos | 22 | 21 | 1 |
| Specs canónicas | 155 | 28 | 127 |
| Total | 177 | 49 | 128 |

## Estado actual

| Tipo | Total | Válidos | Inválidos |
|---|---:|---:|---:|
| Changes activos versionados | 11 | 11 | 0 |
| Specs canónicas | 163 | 77 | 86 |
| Total | 174 | 88 | 86 |

Cifras al 2026-09-25 tras el lote de archivo 3.1, la normalización `SHALL`/`MUST` y los lotes 1 y 2 de migración (medidas sobre el árbol versionado;
los borradores locales sin seguimiento no se cuentan). Ese lote agregó siete
specs canónicas válidas y normalizó la estructura mínima de cuatro históricas.
La deuda restante son las 86 specs sin `Purpose`/`Requirements` canónicos.

Se corrigió el delta de Centro de Costos conservando los dos escenarios
canónicos omitidos, se reemplazó el propósito placeholder de
`centro-costos-alta` y se agregó el change válido
`migrar-catalogo-openspec-vigente`. El smoke autenticado agregó el change válido
`bloquear-datos-sin-proyecto-activo`. La conciliación y archivo del primer lote
actualizó además las especificaciones canónicas correspondientes. Finalmente se
reparó el último delta activo inválido,
`eliminacion-admin-archivos-importaciones-gt`, sin cambiar su contrato.

## Clasificación

| Categoría | Elementos | Tratamiento |
|---|---:|---|
| Spec sin `Purpose`/`Requirements` canónicos | 86 | migración estructural conservando literalmente requisitos y escenarios |
| Spec con requisitos sin `SHALL`/`MUST` | 0 pendientes (7 specs / 10 requisitos corregidos) | unión de líneas partidas por el ajuste de texto; palabras idénticas, verificado contra `HEAD` |
| Delta activo inválido | 0 pendientes | correcciones mínimas completadas sin eliminar escenarios ni cambiar contratos |

Todos los changes activos validan en modo estricto. La deuda restante está
concentrada en specs canónicas históricas.

## Reglas de migración

1. La migración SHALL ser documental; no cambia código ni comportamiento.
2. Los 96 archivos de formato antiguo se migran mecánicamente solo cuando el
   diff demuestra que los textos de requisitos y escenarios son idénticos.
3. Los propósitos no se autogeneran y aceptan sin revisión: se redactan por
   dominio y se aprueban en PRs pequeños.
4. El delta de Centro de Costos se corrige antes de intentar archivarlo.
5. Cada lote ejecuta validación estricta del dominio y después la validación
   integral.
6. El gate `openspec validate --all --strict` solo se vuelve obligatorio en CI
   cuando la línea base completa llegue a cero fallas.

## Lotes recomendados

1. Autenticación, sesión, usuarios, roles y tenant.
2. Proyectos, navegación, dashboard y administración.
3. Gerencia técnica y control presupuestal.
4. Control de obra, residencia y avances.
5. Compras, proveedores y órdenes de compra.
6. Almacén e inventarios.
7. Finanzas y contabilidad.
8. Personal, nómina y asistencia.
9. Seguridad, calidad, ventas y asistente.
10. CI, despliegue, archivos e infraestructura transversal.
