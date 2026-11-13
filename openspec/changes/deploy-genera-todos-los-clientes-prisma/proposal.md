## Why

El despliegue de #200 (M7 pólizas, 13 nov 2026) falló al construir la imagen de Contabilidad:

```
../finanzas/src/cuentas-por-cobrar.ts(55,32): error TS2339: Property 'cuentaPorCobrar' does not exist on type 'PrismaClient'
```

- `apps/contabilidad/tsconfig.json` incluye `test/**/*`, y esas pruebas importan código de Finanzas.
- `docker/Dockerfile.backend` solo genera el cliente Prisma de `APP_PATH`. Para Finanzas se usa el cliente versionado
  en el repo, que es anterior a `cuentas_por_cobrar` (#197).
- Resultado: desde que #197 está en `main`, cualquier cambio en Contabilidad deja de desplegarse. Almacén tiene la
  misma configuración y quedaría expuesto igual.

## What Changes

- `docker/Dockerfile.backend` genera los clientes Prisma de todos los servicios (`apps/*/prisma/schema.prisma`) antes
  de `npm run build`. Si uno falla, el build se detiene.
- El runtime no cambia: solo se copia el cliente de `APP_PATH`.

## Impact

- Solo el builder de las imágenes backend. Sin cambios de código, de base ni de contratos.
- El build tarda unos segundos más por imagen.

## Verificación

- Reproducción local: generando solo el cliente de Contabilidad, `tsc` de Contabilidad da los mismos 7 errores del
  despliegue; generando todos, 0 errores.
- En producción: el despliegue posterior al merge reconstruye Contabilidad y queda `healthy`.
