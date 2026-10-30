## Context

El entorno local (`docker-compose.local.yml`, proyecto `iretum-local`) replica el VPS: una base por servicio, apps conectadas como `bocam_app` con RLS forzado y RabbitMQ real. El frontend siempre inicia sesión con el tenant `8e07a7ac-8157-4e5d-8499-e985a9fcdbfc` (`VITE_DEFAULT_TENANT_ID`), que localmente es "Constructora Local (pruebas)". Por eso el tenant de pruebas es ese y no Alfa: sus usuarios no podrían entrar desde el navegador.

Recorrido real del flujo (leído del código, no supuesto):

| Paso | Endpoint | Rol | Efecto lateral |
|---|---|---|---|
| Cliente | `POST /ventas/clientes` | admin | — |
| Centro de costos | `POST /auth/admin/proyectos` | admin/gerencia_tecnica | evento `auth.centro_costos_creado` → Finanzas `ProyectoFinanzas` |
| Usuarios | `POST /auth/admin/users` (con `proyecto_ids`) | admin | — |
| Insumos | `POST /gerencia-tecnica/insumos/importar-lote` | gerencia_tecnica | — |
| Catálogo | `POST /gerencia-tecnica/presupuestos` | gerencia_tecnica | — |
| APU / explosión | `POST /gerencia-tecnica/composicion-apu` | gerencia_tecnica | — |
| Aprobar presupuesto | `PATCH /gerencia-tecnica/presupuestos/:id/aprobar` | gerencia_tecnica | `SaldoPartida` + evento `saldo_partida_creado` → Finanzas `PresupuestoAsignado` |
| Proveedores | `POST /compras/proveedores` | procurement | — |
| Requisición | `POST /compras/requisiciones` | residencia | — |
| Aprobar req | `PATCH /compras/requisiciones/:id/aprobar` | procurement | consulta saldo de partida en GT |
| Invitar a cotizar | `POST /compras/requisiciones/:id/solicitud-cotizacion` | procurement | correo RFQ |
| Cuadro | `POST /compras/comparativas` + `PUT …/cotizaciones` | procurement | — |
| Evaluación técnica | `PATCH …/enviar-evaluacion`, `PATCH …/evaluar`, `PUT …/seleccion`, `POST …/firmar` | procurement → residencia | — |
| GT | `PATCH …/enviar-gt`, `PATCH …/evaluar-gt`, `PATCH …/revisar-gt` | residencia → gerencia_tecnica | ganador por renglón + evento `comparativa_aprobada_gt` |
| OC | `POST …/convertir-oc` | procurement | consulta Finanzas (`por-concepto`, `suficiencia`), OC por proveedor, `POST GT /partidas/:id/comprometer` → evento `partida_comprometida` → Finanzas; evento `compras.oc_creada` |
| Enviar OC | `POST /compras/ordenes-compra/enviar-correo` | procurement | PDF por `reportes`, correo; marca `enviada_proveedor_at` solo si el correo se entregó |

## Goals / Non-Goals

**Goals:**
- Reproducir con un comando los 4 estados de requisición (a–d) usando las APIs reales, con los usuarios del rol que corresponde en cada paso.
- Que Finanzas reciba solo lo que el flujo real le manda.
- Que se pueda correr N veces con el mismo resultado observable.
- Imposible ejecutarlo contra algo que no sea el entorno local.

**Non-Goals:**
- Corregir los hallazgos (tiempo de entrega en proveedor, `presupuesto_id` en `compras.oc_creada`, factura en Finanzas).
- Facturas o pagos: el seed se detiene en la OC enviada; lo siguiente se prueba a mano en Finanzas.
- Sembrar otros tenants o módulos fuera del flujo.

## Decisions

1. **Todo por API, salvo bootstrap y limpieza.** Solo dos cosas tocan SQL directo, como `bocam_admin`: (a) la limpieza del tenant y (b) restaurar el admin local (`docker/local/sql/seed-usuario-local.sql`), que no tiene API sin un admin previo. Alternativa descartada: insertar con Prisma, porque saltaría eventos (`centro_costos_creado`, `saldo_partida_creado`, `partida_comprometida`) y lo que llega a Finanzas no sería real.

2. **Limpieza genérica por `tenant_id` con reintentos.** En cada una de las 11 bases, un bloque `DO` recorre las tablas de `public` con columna `tenant_id` y borra las filas del tenant. Cada borrado va en un subbloque que captura `foreign_key_violation` y se reintenta en pasadas sucesivas hasta no avanzar; las tablas hijas sin `tenant_id` (`user_project_access`, `refresh_tokens`, `detalles_pago_oc`…) caen por sus `ON DELETE CASCADE`. En auth se conserva la fila de `tenants`. Alternativa descartada: `session_replication_role = replica`, porque deja huérfanas las hijas sin `tenant_id` y desactiva triggers de inmutabilidad.

3. **Guardas de entorno local, en dos capas.** (a) La URL base de la API debe tener host `localhost`/`127.0.0.1`; (b) la base solo se toca con `docker compose -f docker-compose.local.yml exec postgres`, y antes se verifica que el contenedor se llame `iretum-local-postgres` y tenga la etiqueta `com.docker.compose.project=iretum-local`. Además se corre `verificar-env-local.mjs`. El script no acepta URLs de base de datos por argumento ni por variable de entorno.

4. **Mailpit para los correos.** `enviar-correo` solo marca la OC como enviada si el SMTP entrega; con SMTP apagado el caso d) nunca quedaría "enviada". Mailpit atrapa los correos en la red local (UI en `127.0.0.1:8025`). `verificar-env-local.mjs` pasa de "SMTP debe ir vacío" a "SMTP solo puede apuntar a `mailpit`". Alternativa descartada: marcar `enviada_proveedor_at` por SQL (no es el flujo real).

5. **Compra dividida por partida = selección real de GT.** `revisar-gt` elige el ganador de cada renglón: primera opción aprobada → segunda → menor precio aprobado. En el caso c) GT marca `C` al proveedor A en los renglones 1–2 y `NC` (con comentario) en el 3, y `C` al proveedor B en el renglón 3. Resultado: dos ganadores, como lo haría un GT en la pantalla.

6. **Folios deterministas donde la API lo permite.** Las requisiciones usan `codigo` explícito (`REQ-LOCAL-A`…`D`). Cuadros (`CC-<timestamp>`) y OC (`OC-AUTO-<timestamp>-n`) los genera el servicio; el script los imprime al final.

7. **Script en Node sin dependencias** (`fetch` nativo, `child_process` para `docker compose exec psql`), invocado desde `iretum-local.ps1 seed-compras`. Mismo estilo que `verificar-env-local.mjs`.

## Risks / Trade-offs

- [Los eventos son asíncronos: Finanzas puede no haber procesado `saldo_partida_creado` cuando se llama `convertir-oc`] → antes del caso d) el script consulta `GET /finanzas/presupuestos/por-concepto/:id` como Finanzas y reintenta hasta 30 s.
- [El contenido de los correos de RFQ/OC queda en Mailpit, en memoria] → se pierde al reiniciar el contenedor; es lo deseado en local.
- [Limpieza por `tenant_id` depende de que las tablas lo tengan] → el script reporta tablas del tenant que quedaron con filas tras la limpieza y aborta si alguna no quedó vacía.
- [El seed de auth de Alfa/Beta y el admin local comparten bases] → la limpieza filtra estrictamente por el tenant local; Alfa/Beta no se tocan.
