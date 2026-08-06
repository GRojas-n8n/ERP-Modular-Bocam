## 1. Backend — control-proyectos: alerta VOLUMEN_EXCEDIDO (TDD: test primero)

- [x] 1.1 Test que reproduce el gap: un concepto con `cantidad_acumulada > cantidad_presupuestada` no genera ninguna `AlertaProyecto` hoy tras correr `calcularAlertas`. Rojo confirmado.
- [x] 1.2 Implementar en `calcularAlertas` (`apps/control-proyectos/src/main.ts:393-436`) la consulta del `AvanceFisico` más reciente por `concepto_id` de cada partida del proyecto, y la comparación `cantidad_acumulada > cantidad_presupuestada`.
- [x] 1.3 Crear alerta `VOLUMEN_EXCEDIDO` (severidad `WARN`) vía `upsertAlerta` cuando se cumple la condición; resolverla vía `resolverAlertaSiExiste` cuando deja de cumplirse.
- [x] 1.4 Test 1.1 en verde.
- [x] 1.5 Test: alerta se resuelve automáticamente si `cantidad_presupuestada` se amplía por encima de `cantidad_acumulada`.
- [x] 1.6 Test: partidas sin ningún `AvanceFisico` no generan ni resuelven la alerta.

## 2. Backend — control-proyectos: advertencia en POST /avances (TDD: test primero)

- [x] 2.1 Test que reproduce el gap: un avance que deja `cantidad_acumulada > cantidad_presupuestada` responde `201` sin ninguna advertencia en el body hoy. Rojo confirmado.
- [x] 2.2 Agregar `advertencia_volumen_excedido` a la respuesta de `POST /avances` cuando corresponda, con `cantidad_excedente` y `pct_excedido`.
- [x] 2.3 Test 2.1 en verde.
- [x] 2.4 Test: un avance que NO excede el volumen contratado responde sin el campo `advertencia_volumen_excedido`.
- [x] 2.5 Test: el avance se crea exitosamente con `201` tanto si excede como si no excede — no hay bloqueo.

## 3. Verificación

- [x] 3.1 Suite completa relevante de `apps/control-proyectos` corrida en verde (7/7 tests nuevos + `tsc --noEmit` limpio).
- [ ] 3.2 Entorno local: registrar avances sucesivos hasta superar `cantidad_presupuestada` en un navegador real — pendiente, se hace junto con la verificación final de los 7 changes.
- [x] 3.3 Confirmado por los tests automatizados: el avance se registra sin error (`201`) en ambos casos — sin excedente y con excedente.

### Hallazgo colateral corregido de paso

Los tests e2e de este change (que arrancan `apps/control-proyectos/src/main.ts` como script plano, igual que otros e2e del repo) se quedaban colgados indefinidamente después de terminar — nunca salían del proceso. Causa: el rate limiter agregado en `rate-limiting-microservicios-negocio` abre una conexión Redis real (hay `REDIS_URL` configurado en local) y nunca se le hacía `unref()`, así que el handle vivo del socket impedía que Node saliera solo aunque todo el trabajo ya hubiera terminado. Esto afecta a **cualquier** e2e de los 11 microservicios de negocio que arranque el servicio como script directo con `REDIS_URL` configurado localmente, no solo a este change — se corrigió en el paquete compartido (`packages/rate-limiter/src/rate-limiter.ts`, `redisClient.unref()`), con test nuevo que lo confirma.

## 4. Deploy y cierre

- [ ] 4.1 Desplegado vía CI (push a `main`). Confirmar en producción real que la alerta aparece para un concepto con excedente real (o simulado con datos de prueba, según lo que el usuario permita verificar). (pendiente — deploy final)
- [ ] 4.2 Actualizar memoria del proyecto con el resultado — incluir la nota de que la frase de venta "bloqueando la fuga de capital" no corresponde a este diseño (alerta, no bloqueo) y debería ajustarse en el material comercial. (pendiente)
- [ ] 4.3 `openspec archive alertas-volumen-ejecutado-contratado` tras verificación en producción. (pendiente)
