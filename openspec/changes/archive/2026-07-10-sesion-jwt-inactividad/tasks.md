## 1. Backend `apps/auth` — límite absoluto de sesión

- [x] 1.1 Test: función pura `sesionExcedeLimite(sesionIniciadaEn: Date, ahora: Date, maxHoras: number): boolean`
- [x] 1.2 Test: login crea el `RefreshToken` con `sesion_iniciada_en = ahora`
- [x] 1.3 Test de integración: refresh dentro del límite rota el token y
      **conserva** el `sesion_iniciada_en` original (no lo recalcula)
- [x] 1.4 Test de integración: refresh fuera del límite (`sesion_iniciada_en`
      hace más de `JWT_MAX_SESSION_HOURS`) responde 401 `AUTH_REFRESH_INVALID`
- [x] 1.5 Agregar `sesion_iniciada_en DateTime?` a `RefreshToken` en
      `apps/auth/prisma/schema.prisma`, migración aditiva
- [x] 1.6 Crear `apps/auth/src/sesion-policy.ts` con `sesionExcedeLimite` (función pura)
- [x] 1.7 Poblar `sesion_iniciada_en` en el `create()` de login
      (`apps/auth/src/main.ts` ~línea 252)
- [x] 1.8 Propagar `sesion_iniciada_en` (no recalcular) en el `create()` de
      rotación de `/auth/refresh` (~línea 515), y rechazar con 401 antes de
      rotar si `sesionExcedeLimite(...)` es `true`
- [x] 1.9 Agregar `JWT_MAX_SESSION_HOURS` (default `16`) a
      `apps/auth/.env` y `.env.prod.example`/`.env.vps.example`
- [x] 1.10 Verificar que los tests 1.1-1.4 pasan

## 2. Frontend `apps/app-shell` — logout por inactividad

- [x] 2.1 Test: hook/utilidad de inactividad dispara el callback tras el
      timeout configurado sin eventos de actividad (usar fake timers)
- [x] 2.2 Test: cualquier evento de actividad (mousemove/keydown/click/scroll)
      reinicia el temporizador antes de que se cumpla el timeout
- [x] 2.3 Crear hook `useInactivityLogout(timeoutMinutes, onTimeout)` en
      `apps/app-shell/src/hooks/useInactivityLogout.ts` con listeners nativos
      (`{ passive: true }` en los que aplique), sin librerías nuevas
- [x] 2.4 Integrar el hook en `TenantContext.tsx` (solo activo cuando
      `isAuthenticated`), disparando `clearTokens()` + limpieza de estado +
      un mensaje distinguible de "sesión expirada por TTL"
- [x] 2.5 Agregar `VITE_INACTIVITY_TIMEOUT_MIN` (default `15`) a
      `apps/app-shell/.env` y `.env.production`
- [x] 2.6 `LoginView.tsx` (u donde se muestre el mensaje de sesión): mostrar
      el mensaje específico de inactividad cuando el logout provino de este
      flujo (vs. el mensaje genérico de sesión expirada)
- [x] 2.7 Verificar que los tests 2.1-2.2 pasan

## 3. Verificación end-to-end

- [x] 3.1 Manual: login, esperar el timeout de inactividad configurado (usar
      un valor bajo temporalmente, ej. 1 min, para la prueba) sin tocar
      mouse/teclado → confirmar redirect a login con el mensaje correcto
- [x] 3.2 Manual: login, generar actividad justo antes del timeout →
      confirmar que la sesión NO se cierra
- [x] 3.3 Integración: simular refresh continuo más allá de
      `JWT_MAX_SESSION_HOURS` (manipulando `sesion_iniciada_en` directamente
      en BD para no esperar horas reales) → confirmar 401 y que el frontend
      redirige a login igual que con cualquier refresh inválido
- [x] 3.4 Confirmar que sesiones dentro de los límites normales (uso diario
      habitual, con actividad regular) no se ven afectadas — sin regresión
      en el flujo de login/refresh existente
- [x] 3.5 Ejecutar la suite completa de `apps/auth` para descartar regresiones
