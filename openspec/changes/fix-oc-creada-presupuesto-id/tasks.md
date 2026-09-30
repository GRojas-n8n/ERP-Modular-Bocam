## 1. Pruebas en rojo

- [x] 1.1 Prueba unitaria de los constructores de payload (`src/oc-eventos.test.ts`); verificada en rojo (`Cannot find module './oc-eventos'`) antes de implementar.
- [x] 1.2 Prueba de integración con Contabilidad y Finanzas usando el payload del publicador real, con reenvío idempotente (`test/integration/oc-creada-contrato-consumidores.integration.test.ts`). Requiere PostgreSQL: no se pudo ejecutar en rojo en local, verificada solo por typecheck; su ejecución es la de CI.

## 2. Implementación

- [x] 2.1 Crear `apps/compras/src/oc-eventos.ts` con `buildOcCreadaPayload` (incluye `presupuesto_id`) y `buildOcCanceladaPayload` (idéntico al actual).
- [x] 2.2 Usar los constructores en `convertir-oc` y en las dos publicaciones de `oc_cancelada`.
- [x] 2.3 Cablear las pruebas: scripts de `apps/compras` y del raíz, y el workflow `backend-e2e`.

## 3. Verificación

- [x] 3.1 Prueba unitaria en verde (5/5); typecheck de Compras limpio.
- [ ] 3.2 CI: `backend-e2e` en verde con la prueba de integración (requiere PostgreSQL; no se pudo ejecutar en local).
- [x] 3.3 `openspec validate fix-oc-creada-presupuesto-id --strict`.

## 4. Despliegue (fuera de este change, requiere autorización expresa)

- [ ] 4.1 Antes de desplegar, confirmar que Finanzas no duplica el compromiso de la OC (idempotencia por movimiento `COMPROMISO`).
- [ ] 4.2 Tras desplegar, verificar en solo lectura que aparecen asientos `PASIVO_PROYECTADO` nuevos y ningún `invalid_payload` de `oc_creada`.
