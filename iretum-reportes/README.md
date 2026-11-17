# iretum-reportes

Servicio que prepara y envía cada semana, con aprobación por Telegram:

1. El parte de nómina (Excel oficial) a Recursos Humanos y Finanzas.
2. El informe de avance del ERP Iretum (PDF) a Gerencia Técnica.

## Flujo (cada lunes)

| Momento | Qué pasa |
| --- | --- |
| Lunes 08:15 | El bot pide el «Reporte de Asistencias» de Aldahir (PDF del checador). |
| Al enviar el PDF | Lee Entrada y Salida de lunes a viernes, propone 1, ½ o 0 por día y muestra botones para corregir. |
| Confirmar | Genera el Excel sobre el formato oficial y manda la vista previa con Aprobar / Cambiar / Cancelar. |
| Aprobar | Envía de inmediato a Recursos Humanos y Finanzas. |
| Lunes 12:00 | Recordatorio si falta el reporte o la aprobación. |

Reglas: turno 14:00 a 18:00; tolerancia 10 min. Entrada de 11 a 60 min tarde = día completo (1) con leyenda de retardo y hora de entrada. Entrada más tarde, o salida antes de tiempo, se valora por horas reales (½ desde 2 h, 0 con menos). Sin checada de salida = 1, marcado para revisión.

## Informe a Gerencia Técnica (cada lunes 07:00)

| Paso | Fuente | Quién |
| --- | --- | --- |
| Avance físico por módulo | `MADUREZ.md` en `ERP-Modular-Bocam` | Código |
| Publicaciones y PR abiertos | Pull Requests de `ERP-Modular-Bocam` | Código |
| Decisiones e iniciativas | `docs/decisiones/` modificados en la semana | Redacción (API de Claude) |
| Plan contra realizado de Aldahir | `planes/<lunes>.md`, `reports/<fecha>.md` y commits de `iretum-jr-dev` (todas las ramas) | Código + redacción |
| Bloqueos, autorizaciones, observaciones | `/nota` durante la semana | Redacción |
| Continuidad | Resumen del informe anterior guardado en `/data` | Código |

Las cifras las calcula el código; el modelo solo redacta y no puede agregar números. Llega a Telegram con Aprobar / Cambiar / Cancelar; Cambiar acepta una instrucción en texto libre y corrige solo eso.

## Comandos del bot

- Enviar el PDF del checador, o `/asistencia` para capturar con botones (`/asistencia 4 4 4 2 4` como atajo con horas).
- `/german 1 1 1 1 1`: asistencia de Germán (1, 0 o fracción). Por defecto, 1 diario.
- `/vista`, `/estado`, `/prueba` (envía solo a `PRUEBA_DESTINATARIO`).
- `/nota texto`, `/notas`, `/informe [AAAA-MM-DD]`, `/informe_prueba`.

## Variables de entorno

| Variable | Obligatoria | Ejemplo |
| --- | --- | --- |
| `TELEGRAM_TOKEN` | Sí | token de BotFather |
| `TELEGRAM_CHAT_ID` | Sí | `5728889701` |
| `RESEND_API_KEY` | Sí | `re_...` |
| `NOMINA_DESTINATARIOS` | Sí | `a@empresa.com,b@empresa.com` |
| `MAIL_REPLY_TO` | Sí | `german.rg@outlook.com` |
| `PRUEBA_DESTINATARIO` | No | por defecto, `MAIL_REPLY_TO` |
| `MAIL_FROM` | No | `Iretum Reportes <reportes@iretum.com>` |
| `HORA_SOLICITUD_LUNES` / `HORA_RECORDATORIO_LUNES` / `HORA_ENVIO_LUNES` | No | `08:15` / `12:00` / `08:00` |
| `TURNO_INICIO` / `TURNO_FIN` / `TOLERANCIA_MIN` / `RETARDO_MAX_MIN` | No | `14:00` / `18:00` / `10` / `60` |
| `INFORME_DESTINATARIOS` | Para el informe | `constructora_bocam@yahoo.com.mx` |
| `GITHUB_TOKEN` | Para el informe | token fine-grained de solo lectura (Contents y Pull requests) |
| `ANTHROPIC_API_KEY` | Para el informe | `sk-ant-...` |
| `CLAUDE_MODELO` / `HORA_INFORME_LUNES` | No | `claude-sonnet-5-5` / `07:00` |
| `REPO_PRINCIPAL` / `REPO_JUNIOR` | No | `GRojas-n8n/ERP-Modular-Bocam` / `GRojas-n8n/iretum-jr-dev` |

## Datos persistentes (`/data`)

- `estado.json`: estado por semana.
- `nomina_maestro.xlsx`: una pestaña por semana, más la plantilla oculta.
- `semanas/AAAAMMDD NOMINA IRETUM.xlsx`: archivo enviado de cada semana.
- `informes/AAAAMMDD Informe de Avance ERP Iretum.pdf`: informe de cada semana.

## Despliegue

Coolify, build pack **Docker Compose** (`docker-compose.yml`). Sin puertos expuestos: el bot usa long polling.
