# Hito 11: E2E de seguridad, RBAC y limites de autoridad

Fecha: 2026-03-18

## Objetivo

Extender la validacion del SaaS hacia la capa de autorizacion y autoridad financiera con pruebas negativas ejecutables.

## Cobertura implementada

### Compras

Archivo:

- `apps/compras/test/e2e/seguridad.e2e.test.ts`

Escenarios cubiertos:

- bloqueo por rol no autorizado al convertir comparativa en OC
- bloqueo por acceso a `proyecto_id` no autorizado

Codigos validados:

- `AUTH_FORBIDDEN`
- `AUTH_PROJECT_FORBIDDEN`

### Control de Obra

Archivo:

- `apps/control-obra/test/e2e/seguridad.e2e.test.ts`

Escenarios cubiertos:

- bloqueo por rol no autorizado al aprobar estimaciones
- bloqueo por acceso a `proyecto_id` no autorizado

Codigos validados:

- `CO_FORBIDDEN`
- `AUTH_PROJECT_FORBIDDEN`

### Finanzas

Archivo:

- `apps/finanzas/test/e2e/seguridad.e2e.test.ts`

Escenarios cubiertos:

- bloqueo por rol no autorizado al crear presupuestos
- bloqueo por exceder `limiteAprobacion`

Codigos validados:

- `FIN_FORBIDDEN`
- `FIN_LIMIT_EXCEEDED`

## Ajustes tecnicos realizados

- `apps/finanzas/src/main.ts`
  - exporta `app` y `startServer()` para pruebas sin side effects al importar
- `test-support/e2e.ts`
  - ahora permite firmar JWT de prueba con `limiteAprobacion`
- `package.json`
  - nuevo comando raiz: `test:e2e:seguridad`
- `apps/compras/package.json`
  - nuevo comando: `test:e2e:seguridad`
- `apps/control-obra/package.json`
  - nuevo comando: `test:e2e:seguridad`
- `apps/finanzas/package.json`
  - nuevo comando: `test:e2e:seguridad`

## Validacion ejecutada

Compilacion:

- `npx tsc --noEmit -p apps/compras/tsconfig.json`
- `npx tsc --noEmit -p apps/control-obra/tsconfig.json`
- `npx tsc --noEmit -p apps/finanzas/tsconfig.json`

Pruebas:

```bash
npm run test:e2e:seguridad
```

Resultado:

- todas las negativas de seguridad pasaron desde el comando raiz

## Estado resultante

El sistema ya no solo tiene flujos felices y reconciliacion validados; ahora tambien tiene cobertura ejecutable sobre:

- rechazo por rol insuficiente
- rechazo por proyecto no autorizado
- rechazo por exceso de autoridad financiera

Esto sube la madurez real del backend SaaS en el frente de hardening.

## Siguiente paso recomendado

El siguiente paso natural es el punto 2 propuesto antes:

1. pruebas de idempotencia repetida sobre endpoints financieros
2. verificar doble envio sobre:
   - `POST /api/v1/finanzas/comprometer-fondos`
   - `POST /api/v1/finanzas/liberar-fondos`
   - `POST /api/v1/finanzas/pagos`
3. validar que no se dupliquen movimientos ni pagos al repetir requests
