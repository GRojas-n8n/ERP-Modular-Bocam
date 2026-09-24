# Deuda de validación OpenSpec — 2026-09-24

Comando de línea base:

```text
openspec validate --all --strict --json
```

## Resultado

| Tipo | Total | Válidos | Inválidos |
|---|---:|---:|---:|
| Changes activos | 22 | 21 | 1 |
| Specs canónicas | 155 | 28 | 127 |
| Total | 177 | 49 | 128 |

## Clasificación

| Categoría | Elementos | Tratamiento |
|---|---:|---|
| Spec sin `Purpose`/`Requirements` canónicos | 96 | migración estructural conservando literalmente requisitos y escenarios |
| Spec con `Purpose` placeholder | 31 | redactar propósito desde requisitos existentes y someterlo a revisión humana |
| Delta que omite escenarios existentes | 1 | incorporar los escenarios omitidos antes de archivar; no sobrescribir la spec canónica |

El único change activo inválido es
`centro-costos-confirmar-y-editar-consecutivo`: sus dos bloques `MODIFIED`
omiten escenarios que siguen presentes en `centro-costos-alta`.

## Reglas de migración

1. La migración SHALL ser documental; no cambia código ni comportamiento.
2. Los 96 archivos de formato antiguo se migran mecánicamente solo cuando el
   diff demuestra que los textos de requisitos y escenarios son idénticos.
3. Los 31 propósitos no se autogeneran y aceptan sin revisión: se redactan por
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
