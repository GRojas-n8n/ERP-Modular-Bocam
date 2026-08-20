## Context

`packages/auth-middleware/src/middleware.ts` es el único lugar donde se verifica la
firma de un JWT en todo el ERP (los 13 microservicios lo consumen igual). El
`JWT_SECRET` se firma y verifica siempre en `apps/auth` con `jwt.sign`/`jwt.verify`
de la librería `jsonwebtoken`, usando un secreto de tipo `string` — lo que hoy hace
que la librería infiera únicamente algoritmos HMAC (`HS256`/`HS384`/`HS512`) y nunca
acepte `alg: none`. No hay evidencia de explotación; esto es hardening preventivo.

## Goals / Non-Goals

**Goals:**
- Declarar explícitamente `algorithms: ['HS256']` en la única llamada `jwt.verify`
  del repositorio, para que la política de firma no dependa de un default
  implícito de la librería.
- Eliminar el timing side-channel teórico en la comparación de `MASTER_SECRET`.

**Non-Goals:**
- No se cambia el algoritmo de firma en sí (sigue siendo HS256, simétrico) ni se
  migra a RS256/claves asimétricas — eso sería un cambio de mayor alcance sin
  justificación de riesgo actual.
- No se toca la lógica de expiración, refresh tokens, ni `JWT_MAX_SESSION_HOURS`.

## Decisions

**1. `algorithms: ['HS256']` explícito en `jwt.verify`.** Alternativa: dejarlo como
está confiando en el default de `jsonwebtoken`. Se descarta porque un default
implícito puede cambiar de comportamiento entre versiones de la librería sin que
ningún test lo capture — declarar la política explícitamente hace el contrato de
seguridad visible y estable en el código, no en la documentación de un paquete
externo.

**2. `crypto.timingSafeEqual` para `MASTER_SECRET`, con padding previo.**
`timingSafeEqual` lanza si los buffers tienen longitud distinta, así que se compara
primero la longitud con una operación de tiempo no crítico (comparar longitudes no
filtra información útil sobre el contenido del secreto) y solo si coinciden se pasa
a `timingSafeEqual`; si no coinciden, se trata directamente como no autorizado sin
necesidad de comparar contenido.

## Risks / Trade-offs

- [Riesgo] Un error tipográfico al escribir `algorithms: ['HS256']` podría rechazar
  tokens legítimos → Mitigación: cubierto por el test existente de
  `middleware.test.ts` (login real + verificación), que ya corre en CI.
- [Riesgo] Bajo — este cambio no tiene trade-offs de rendimiento ni de compatibilidad
  apreciables; es una corrección de una línea en cada uno de los dos puntos.
