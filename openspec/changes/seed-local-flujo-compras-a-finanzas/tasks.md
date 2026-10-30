## 1. Correo local con Mailpit

- [x] 1.1 Agregar servicio `mailpit` a `docker-compose.local.yml` (UI en `127.0.0.1:8025`, SMTP solo en la red interna) y apuntar `SMTP_*` de compras a él
- [x] 1.2 Ajustar `verificar-env-local.mjs`: `mailpit` como host permitido y `SMTP_HOST` solo puede ser `mailpit`
- [x] 1.3 Verificar que el verificador bloquea un `SMTP_HOST` distinto de `mailpit`

## 2. Script de seed

- [x] 2.1 Guardas: host de API local, contenedor `iretum-local-postgres` con etiqueta de proyecto `iretum-local`, `verificar-env-local.mjs`
- [x] 2.2 Limpieza genérica por `tenant_id` con reintentos en las 11 bases + restaurar admin local; abortar si queda alguna fila del tenant
- [x] 2.3 Base por API: cliente (ventas), centro de costos (auth), usuarios por rol con acceso al proyecto, logins con `proyecto_id`
- [x] 2.4 Gerencia Técnica por API: insumos, catálogo de 12 conceptos, composición APU, aprobación del presupuesto
- [x] 2.5 Compras por API: 4 proveedores con RFC de prueba y crédito
- [x] 2.6 Caso a): requisición creada por Residencia
- [x] 2.7 Caso b): requisición aprobada, invitación a cotizar, cuadro con cotizaciones en BORRADOR
- [x] 2.8 Caso c): evaluación técnica, selección, firma, envío a GT, evaluación GT con compra dividida, `revisar-gt`
- [x] 2.9 Caso d): flujo completo + espera del espejo en Finanzas + `convertir-oc` + `enviar-correo`
- [x] 2.10 Resumen final: usuarios, folios y estado de cada requisición; conteo de lo que llegó a Finanzas

## 3. Integración y verificación

- [x] 3.1 Comando `seed-compras` en `iretum-local.ps1`
- [x] 3.2 Ejecutar dos veces y comprobar mismo resultado; comprobar que Alfa/Beta no cambian
- [x] 3.3 Revisar qué llegó a Finanzas para el caso d) (tablas y logs de eventos) y el correo en Mailpit
- [x] 3.4 Documentar en `LOCAL.md`: comando, usuarios, folios, estados, guía de prueba en Finanzas y hallazgos
