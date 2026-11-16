"""Bot de reportes semanales Iretum: parte de nómina con aprobación por Telegram."""
import logging
from datetime import date, datetime, timedelta
from pathlib import Path

from telegram import BotCommand, InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (Application, CallbackQueryHandler, CommandHandler, ContextTypes,
                          Defaults, MessageHandler, filters)

from . import config as configuracion
from . import asistencia_pdf, correo, correo_informe, correo_nomina, informe, nomina, redaccion, semanas
from .estado import Estado

logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s: %(message)s", level=logging.INFO)
for _ruidoso in ("httpx", "fontTools", "weasyprint"):
    logging.getLogger(_ruidoso).setLevel(logging.WARNING)


class _SinRuido(logging.Filter):
    """fontTools reconfigura su nivel al generar PDF; se descarta su detalle en el log."""
    def filter(self, record: logging.LogRecord) -> bool:
        return record.levelno >= logging.WARNING or not record.name.startswith(("fontTools", "weasyprint"))


for _h in logging.getLogger().handlers:
    _h.addFilter(_SinRuido())
log = logging.getLogger("iretum")

MAX_INTENTOS = 3

AYUDA = (
    "Asistencia de Aldahir:\n"
    "  Envía el PDF del «Reporte de Asistencias» del checador, o\n"
    "  /asistencia  para capturarla con botones (toca cada día: 1 → ½ → 0)\n"
    "  /asistencia 4 4 4 2 4  atajo con horas de lunes a viernes\n\n"
    "Comandos:\n"
    "/german 1 1 1 1 1  Tu asistencia (solo 1, 0.5 o 0)\n"
    "/vista  Volver a mostrar el parte para aprobar\n"
    "/estado  Estado de la semana\n"
    "/prueba  Enviar el parte solo a tu correo\n\n"
    "Informe a Gerencia Técnica:\n"
    "/nota texto  Bloqueos, autorizaciones u observaciones para el informe\n"
    "/notas  Ver las notas de la semana\n"
    "/informe  Generar el informe ahora (opcional: /informe 2026-10-26)\n"
    "/informe_prueba  Enviar el informe solo a tu correo\n\n"
    "La semana reportada es la actual de viernes a domingo, y la anterior de lunes a jueves."
)


def parsear(args: list[str], maximo: float, ejemplo: str = "/asistencia 4 4 4 2 4") -> list[float] | str:
    if len(args) != 5:
        return f"Necesito 5 valores, de lunes a viernes. Ejemplo: {ejemplo}"
    try:
        valores = [float(a.replace(",", ".")) for a in args]
    except ValueError:
        return f"Solo números, separados por espacio. Ejemplo: {ejemplo}"
    if any(v < 0 or v > maximo for v in valores):
        return f"Cada valor debe estar entre 0 y {maximo:g}."
    return valores


def _simbolo(v: float) -> str:
    return {1.0: "1", 0.5: "½", 0.0: "0"}[float(v)]


CICLO = {1.0: 0.5, 0.5: 0.0, 0.0: 1.0}


class Servicio:
    def __init__(self, cfg: configuracion.Config):
        self.cfg = cfg
        self.estado = Estado(cfg.data_dir)

    def ahora(self) -> datetime:
        return datetime.now(self.cfg.tz)

    def momento_envio(self, lunes: date) -> datetime:
        return datetime.combine(lunes + timedelta(days=7), self.cfg.hora_envio)

    def asistencia(self, s: dict) -> dict[str, list[float]]:
        return {"german": s.get("german", [1.0] * 5), "aldahir": s["aldahir"]}

    # ---------- revisión de asistencia con botones ----------

    async def mostrar_revision(self, bot, lunes: date, rev: dict, mensaje=None) -> None:
        dias = ["Lun", "Mar", "Mié", "Jue", "Vie"]
        lineas = [f"Asistencia de Aldahir · {semanas.rango_texto(lunes)}",
                  f"Origen: {'reporte del checador' if rev.get('origen') == 'pdf' else 'captura manual'}", ""]
        for i, (d, v) in enumerate(zip(dias, rev["valores"])):
            fecha = lunes + timedelta(days=i)
            nota = rev["notas"][i]
            lineas.append(f"{d} {fecha.day:02d}: {_simbolo(v)}" + (f"  ⚠ {nota}" if nota else ""))
        lineas += ["", "Toca un día para cambiarlo (1 → ½ → 0) y luego Confirmar."]
        iso = lunes.isoformat()
        teclado = InlineKeyboardMarkup([
            [InlineKeyboardButton(f"{d} {_simbolo(v)}", callback_data=f"dia|{iso}|{i}")
             for i, (d, v) in enumerate(zip(dias, rev["valores"]))],
            [InlineKeyboardButton("Confirmar", callback_data=f"confirmar|{iso}")],
        ])
        texto = "\n".join(lineas)
        if mensaje is not None:
            await mensaje.edit_text(texto, reply_markup=teclado)
        else:
            await bot.send_message(self.cfg.chat_id, texto, reply_markup=teclado)

    # ---------- preparación y vista previa ----------

    async def preparar(self, bot, lunes: date) -> None:
        s = self.estado.semana(lunes)
        rango = semanas.rango_texto(lunes)
        if "aldahir" not in s:
            await bot.send_message(self.cfg.chat_id,
                                   f"Falta la asistencia de Aldahir ({rango}).\n"
                                   "Envía el PDF del checador o usa /asistencia")
            return
        ya_enviado = s.get("estado") == "enviado"
        asistencia = self.asistencia(s)
        archivo = nomina.generar_semana(lunes, asistencia, self.cfg.data_dir)
        self.estado.actualizar(lunes, estado="preparado", archivo=str(archivo), intentos=0)
        texto, total = nomina.resumen(asistencia)
        envio = self.momento_envio(lunes)
        cuando = ("de inmediato" if self.ahora() >= envio
                  else f"el lunes {envio:%d/%m} a las {envio:%H:%M}")
        retardos = [f"   {['L', 'M', 'Mi', 'J', 'V'][i]}: {n}" for i, n in enumerate(s.get("aldahir_notas") or [])
                    if n]
        caption = (
            f"Parte de nómina · {rango}\n\n{texto}\n\nTotal: ${total:,.2f}\n"
            + ("\nIncidencias de Aldahir:\n" + "\n".join(retardos) + "\n" if retardos else "")
            + f"\nAl aprobar se envía {cuando} a {', '.join(self.cfg.nomina_destinatarios)}."
        )
        if ya_enviado:
            caption += "\n\nAtención: esta semana ya se había enviado. Si apruebas, se reenvía."
        botones = InlineKeyboardMarkup([[
            InlineKeyboardButton("Aprobar", callback_data=f"aprobar|{lunes.isoformat()}"),
            InlineKeyboardButton("Cambiar", callback_data=f"cambiar|{lunes.isoformat()}"),
            InlineKeyboardButton("Cancelar", callback_data=f"cancelar|{lunes.isoformat()}"),
        ]])
        with archivo.open("rb") as f:
            await bot.send_document(self.cfg.chat_id, document=f, filename=archivo.name,
                                    caption=caption, reply_markup=botones)

    # ---------- informe a Gerencia Técnica ----------

    def lunes_notas(self) -> date:
        hoy = self.ahora().date()
        lunes = hoy - timedelta(days=hoy.weekday())
        anterior = lunes - timedelta(days=7)
        inf = self.estado.semana(anterior).get("informe") or {}
        if hoy.weekday() == 0 and inf.get("estado") != "enviado":
            return anterior
        return lunes

    def informe_anterior(self, lunes: date) -> dict | None:
        return (self.estado.semana(lunes - timedelta(days=7)).get("informe") or {}).get("continuidad")

    async def generar_informe(self, bot, lunes: date, instruccion: str | None = None) -> None:
        cfg = self.cfg
        if not cfg.anthropic_api_key:
            await bot.send_message(cfg.chat_id, "Falta ANTHROPIC_API_KEY en Coolify; no puedo redactar el informe.")
            return
        s = self.estado.semana(lunes)
        inf = s.get("informe") or {}
        rango = semanas.rango_texto(lunes)
        if instruccion:
            await bot.send_message(cfg.chat_id, "Aplicando la corrección al informe…")
            d = informe.desde_json(inf["datos"])
            d["redaccion"] = await redaccion.corregir(
                cfg.anthropic_api_key, cfg.claude_modelo, d["para_redaccion"], d["redaccion"], instruccion,
                informe.prs_validos(d))
        else:
            await bot.send_message(cfg.chat_id, f"Generando el informe de la semana del {rango}. Tarda de 1 a 3 minutos…")
            d = await informe.recolectar(cfg, lunes, [n["texto"] for n in s.get("notas", [])],
                                         self.informe_anterior(lunes))
            d["redaccion"] = await redaccion.redactar(
                cfg.anthropic_api_key, cfg.claude_modelo, d["para_redaccion"], informe.prs_validos(d))
        pdf = informe.armar_pdf(d, cfg.data_dir)
        self.estado.actualizar(lunes, informe={
            "estado": "preparado", "datos": informe.serializable(d), "pdf": str(pdf),
            "esperando_cambio": False, "continuidad": informe.resumen_para_siguiente(d),
            "historial": inf.get("historial", []) + ([instruccion] if instruccion else [])})
        a = d["aldahir"]
        caption = (
            f"Informe de avance · {rango}\n\n"
            + (f"Construcción alcance original: {d['construccion_original']}%\n" if d.get("construccion_original") is not None else "")
            + (f"Construcción ERP completo: {d['construccion']}% ({d['variacion_construccion']})\n" if d.get("construccion") is not None
               else "Construcción: falta la columna Construido en MADUREZ.md\n")
            + f"Madurez verificable: {d['indice']}% ({d['variacion_texto']})\n"
            f"Semáforo: {d['semaforo'].upper()}\n"
            f"Publicaciones: {len(d['prs_fusionados'])} · PR abiertos: {d['prs_abiertos']}\n"
            f"Aldahir: {a['dias_con_respaldo']}/5 días con respaldo, {a['reportes']}/5 reportes\n"
            f"Decisiones solicitadas: {len(d['redaccion']['decisiones_solicitadas'])}\n"
            + (f"\n⚠ Fuentes no disponibles: {'; '.join(d['fuentes_faltantes'])[:300]}\n" if d["fuentes_faltantes"] else "")
            + f"\nAl aprobar se envía de inmediato a {', '.join(cfg.informe_destinatarios) or '(sin destinatario)'}.")
        botones = InlineKeyboardMarkup([[
            InlineKeyboardButton("Aprobar", callback_data=f"inf_aprobar|{lunes.isoformat()}"),
            InlineKeyboardButton("Cambiar", callback_data=f"inf_cambiar|{lunes.isoformat()}"),
            InlineKeyboardButton("Cancelar", callback_data=f"inf_cancelar|{lunes.isoformat()}"),
        ]])
        with pdf.open("rb") as f:
            await bot.send_document(cfg.chat_id, document=f, filename=pdf.name, caption=caption[:1024],
                                    reply_markup=botones)

    async def enviar_informe(self, bot, lunes: date, prueba: bool = False) -> None:
        cfg = self.cfg
        inf = self.estado.semana(lunes).get("informe") or {}
        if not inf.get("pdf"):
            await bot.send_message(cfg.chat_id, "No hay informe generado para esa semana. Usa /informe")
            return
        d = informe.desde_json(inf["datos"])
        asunto, html, texto = correo_informe.construir(informe.datos_correo(d))
        destinatarios = [cfg.prueba_destinatario] if prueba else cfg.informe_destinatarios
        if not destinatarios:
            await bot.send_message(cfg.chat_id, "Falta INFORME_DESTINATARIOS en Coolify.")
            return
        envio_id = await correo.enviar(cfg.resend_api_key, cfg.mail_from, destinatarios,
                                       ("[PRUEBA] " if prueba else "") + asunto, html, [Path(inf["pdf"])],
                                       cfg.mail_reply_to, texto=texto)
        if prueba:
            await bot.send_message(cfg.chat_id, f"Informe de prueba enviado a {destinatarios[0]}.")
            return
        inf.update(estado="enviado", enviado_en=self.ahora().isoformat(), resend_id=envio_id)
        self.estado.actualizar(lunes, informe=inf)
        await bot.send_message(cfg.chat_id, f"Informe enviado a {', '.join(destinatarios)}.")

    # ---------- envío ----------

    async def enviar(self, bot, lunes: date, prueba: bool = False) -> None:
        s = self.estado.semana(lunes)
        archivo = nomina.generar_semana(lunes, self.asistencia(s), self.cfg.data_dir)
        rango = semanas.rango_texto(lunes)
        asunto, html, texto = correo_nomina.construir(lunes, s, archivo.name)
        destinatarios = [self.cfg.prueba_destinatario] if prueba else self.cfg.nomina_destinatarios
        envio_id = await correo.enviar(
            self.cfg.resend_api_key, self.cfg.mail_from, destinatarios,
            ("[PRUEBA] " if prueba else "") + asunto, html, [archivo], self.cfg.mail_reply_to,
            texto=texto,
        )
        if prueba:
            await bot.send_message(self.cfg.chat_id, f"Prueba enviada a {destinatarios[0]}.")
            return
        self.estado.actualizar(lunes, estado="enviado", enviado_en=self.ahora().isoformat(),
                               resend_id=envio_id)
        await bot.send_message(self.cfg.chat_id,
                               f"Nómina enviada ({rango}) a {', '.join(destinatarios)}.")


def construir(cfg: configuracion.Config) -> Application:
    svc = Servicio(cfg)
    app = (Application.builder().token(cfg.telegram_token)
           .defaults(Defaults(tzinfo=cfg.tz)).post_init(_post_init).build())
    solo_yo = filters.Chat(chat_id=cfg.chat_id)

    async def cmd_ayuda(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await update.effective_message.reply_text(AYUDA)

    async def cmd_asistencia(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        if not ctx.args:
            lunes = semanas.semana_reportada(svc.ahora())
            s = svc.estado.semana(lunes)
            rev = {"origen": "manual", "valores": list(s.get("aldahir", [1.0] * 5)),
                   "horas": [None] * 5, "notas": [None] * 5}
            svc.estado.actualizar(lunes, revision=rev)
            await svc.mostrar_revision(ctx.bot, lunes, rev)
            return
        horas = parsear(ctx.args, 24)
        if isinstance(horas, str):
            await update.effective_message.reply_text(horas)
            return
        lunes = semanas.semana_reportada(svc.ahora())
        jornada = nomina.PERSONAL["aldahir"]["jornada_horas"]
        valores = nomina.horas_a_asistencia(horas, jornada)
        ajustes = [f"{d}: {h:g} h → {v:g}" for d, h, v in zip(["L", "M", "Mi", "J", "V"], horas, valores)
                   if h != v * jornada]
        if ajustes:
            await update.effective_message.reply_text(
                "El formato solo acepta 1, 0.5 o 0. Ajusté hacia abajo:\n" + "\n".join(ajustes))
        svc.estado.actualizar(lunes, aldahir_horas=horas, aldahir=valores, aldahir_notas=None)
        await svc.preparar(ctx.bot, lunes)

    async def cmd_german(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        valores = parsear(ctx.args, 1, "/german 1 1 1 1 1")
        if isinstance(valores, str):
            await update.effective_message.reply_text(valores)
            return
        if any(v not in nomina.VALORES_PERMITIDOS for v in valores):
            await update.effective_message.reply_text("El formato solo acepta 1, 0.5 o 0 por día.")
            return
        lunes = semanas.semana_reportada(svc.ahora())
        s = svc.estado.actualizar(lunes, german=valores)
        if "aldahir" in s:
            await svc.preparar(ctx.bot, lunes)
        else:
            await update.effective_message.reply_text("Registrado. Falta la asistencia de Aldahir: envía el PDF o /asistencia")

    async def recibir_pdf(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        lunes = semanas.semana_reportada(svc.ahora())
        archivo = await update.effective_message.document.get_file()
        contenido = bytes(await archivo.download_as_bytearray())
        try:
            rep = asistencia_pdf.leer(contenido)
        except Exception as e:  # noqa: BLE001
            log.exception("PDF de asistencia ilegible")
            await update.effective_message.reply_text(f"No pude leer el PDF: {e}")
            return
        if not asistencia_pdf.nombre_coincide(rep, nomina.PERSONAL["aldahir"]["nombre_completo"]):
            await update.effective_message.reply_text(
                f"El reporte es de «{rep.nombre}», no de Aldahir Molina Medina. No se usó.")
            return
        semana = [lunes + timedelta(days=i) for i in range(5)]
        if not any(d in rep.dias for d in semana):
            await update.effective_message.reply_text(
                f"El reporte no incluye la semana del {semanas.rango_texto(lunes)}. "
                "Genera el reporte con un periodo que cubra de lunes a viernes.")
            return
        dias = asistencia_pdf.evaluar(rep, lunes, cfg.turno_inicio, cfg.turno_fin, cfg.tolerancia_min,
                                      cfg.retardo_max_min)
        rev = {"origen": "pdf", "valores": [d.valor for d in dias], "horas": [d.horas for d in dias],
               "notas": ["; ".join(d.notas) or None for d in dias],
               "incidencias": [d.incidencia for d in dias]}
        svc.estado.actualizar(lunes, revision=rev)
        await svc.mostrar_revision(ctx.bot, lunes, rev)

    async def cmd_nota(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        texto = " ".join(ctx.args).strip()
        if not texto:
            await update.effective_message.reply_text("Escribe la nota después del comando. Ejemplo:\n"
                                                      "/nota Gerencia autorizó las correcciones de interfaz de JR-01")
            return
        lunes = svc.lunes_notas()
        s = svc.estado.semana(lunes)
        notas = s.get("notas", []) + [{"fecha": svc.ahora().strftime("%d/%m %H:%M"), "texto": texto}]
        svc.estado.actualizar(lunes, notas=notas)
        await update.effective_message.reply_text(
            f"Nota {len(notas)} guardada para el informe de la semana del {semanas.rango_texto(lunes)}.")

    async def cmd_notas(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        lunes = svc.lunes_notas()
        notas = svc.estado.semana(lunes).get("notas", [])
        if not notas:
            await update.effective_message.reply_text(f"Sin notas para la semana del {semanas.rango_texto(lunes)}.")
            return
        await update.effective_message.reply_text(
            f"Notas · {semanas.rango_texto(lunes)}\n\n" + "\n".join(
                f"{i}. [{n['fecha']}] {n['texto']}" for i, n in enumerate(notas, 1)))

    async def cmd_informe(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        try:
            lunes = date.fromisoformat(ctx.args[0]) if ctx.args else semanas.semana_reportada(svc.ahora())
        except ValueError:
            await update.effective_message.reply_text("Fecha inválida. Usa AAAA-MM-DD del lunes, ej. /informe 2026-10-26")
            return
        lunes -= timedelta(days=lunes.weekday())
        await svc.generar_informe(ctx.bot, lunes)

    async def cmd_informe_prueba(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await svc.enviar_informe(ctx.bot, semanas.semana_reportada(svc.ahora()), prueba=True)

    async def texto_libre(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        for iso, sem in list(svc.estado._datos.items()):
            inf = sem.get("informe") or {}
            if inf.get("esperando_cambio"):
                lunes = date.fromisoformat(iso)
                inf["esperando_cambio"] = False
                svc.estado.actualizar(lunes, informe=inf)
                await svc.generar_informe(ctx.bot, lunes, instruccion=update.effective_message.text)
                return
        await update.effective_message.reply_text("No entendí. /ayuda muestra los comandos.")

    async def cmd_vista(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        await svc.preparar(ctx.bot, semanas.semana_reportada(svc.ahora()))

    async def cmd_estado(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        lunes = semanas.semana_reportada(svc.ahora())
        s = svc.estado.semana(lunes)
        lineas = [f"Semana {semanas.rango_texto(lunes)}", f"Estado: {s.get('estado')}"]
        if "aldahir_horas" in s:
            lineas.append("Horas Aldahir: " + " ".join("–" if h is None else f"{h:g}" for h in s["aldahir_horas"]))
        if s.get("enviado_en"):
            lineas.append(f"Enviado: {s['enviado_en'][:16].replace('T', ' ')}")
        await update.effective_message.reply_text("\n".join(lineas))

    async def cmd_prueba(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        lunes = semanas.semana_reportada(svc.ahora())
        if "aldahir" not in svc.estado.semana(lunes):
            await update.effective_message.reply_text("Primero captura la asistencia: envía el PDF o /asistencia")
            return
        await svc.enviar(ctx.bot, lunes, prueba=True)

    async def botones(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
        q = update.callback_query
        if update.effective_chat.id != cfg.chat_id:
            await q.answer()
            return
        accion, iso, *extra = q.data.split("|")
        lunes = date.fromisoformat(iso)
        rango = semanas.rango_texto(lunes)
        await q.answer()
        if accion == "dia":
            rev = svc.estado.semana(lunes).get("revision")
            if not rev:
                await q.edit_message_reply_markup(None)
                return
            i = int(extra[0])
            rev["valores"][i] = CICLO[float(rev["valores"][i])]
            rev["horas"][i] = None
            rev["notas"][i] = "ajustado manualmente"
            rev.setdefault("incidencias", [None] * 5)[i] = None
            svc.estado.actualizar(lunes, revision=rev)
            await svc.mostrar_revision(ctx.bot, lunes, rev, mensaje=q.message)
            return
        await q.edit_message_reply_markup(None)
        if accion.startswith("inf_"):
            inf = svc.estado.semana(lunes).get("informe") or {}
            if accion == "inf_aprobar":
                await svc.enviar_informe(ctx.bot, lunes)
            elif accion == "inf_cambiar":
                inf["esperando_cambio"] = True
                svc.estado.actualizar(lunes, informe=inf)
                await q.message.reply_text(
                    "Escribe en un mensaje qué cambiar. Ejemplos:\n"
                    "• Quita el párrafo de Nexo IA\n• Agrega como bloqueo que falta el visto bueno del contador\n"
                    "• Suaviza el tono del semáforo rojo\nSe corrige solo eso y te llega el PDF nuevo.")
            elif accion == "inf_cancelar":
                inf["estado"] = "cancelado"
                svc.estado.actualizar(lunes, informe=inf)
                await q.message.reply_text(f"Informe de {rango} cancelado. /informe para generarlo de nuevo.")
            return
        if accion == "confirmar":
            rev = svc.estado.semana(lunes).get("revision")
            if not rev:
                return
            svc.estado.actualizar(lunes, aldahir=rev["valores"], aldahir_horas=rev["horas"],
                                  aldahir_notas=rev.get("incidencias") or [None] * 5, revision=None)
            await svc.preparar(ctx.bot, lunes)
            return
        if accion == "aprobar":
            svc.estado.actualizar(lunes, estado="aprobado", intentos=0)
            envio = svc.momento_envio(lunes)
            if svc.ahora() >= envio:
                await svc.enviar(ctx.bot, lunes)
            else:
                await q.message.reply_text(f"Aprobado. Se enviará el lunes {envio:%d/%m} a las {envio:%H:%M}.")
        elif accion == "cambiar":
            svc.estado.actualizar(lunes, estado="pendiente")
            await q.message.reply_text(
                f"Corrige y se genera de nuevo ({rango}):\n"
                "/asistencia  (días de Aldahir con botones)\n/german 1 1 1 1 1  (tu asistencia)")
        elif accion == "cancelar":
            svc.estado.actualizar(lunes, estado="cancelado")
            await q.message.reply_text(f"Cancelado. No se enviará la nómina de {rango}. Usa /vista para retomarla.")

    # ---------- tareas programadas ----------

    async def job_solicitud(ctx: ContextTypes.DEFAULT_TYPE):
        lunes = semanas.semana_reportada(svc.ahora())
        if svc.estado.semana(lunes).get("estado") in ("aprobado", "enviado"):
            return
        await ctx.bot.send_message(
            cfg.chat_id,
            f"Nómina de la semana del {semanas.rango_texto(lunes)}.\n\n"
            "Cuando tengas el «Reporte de Asistencias» de Aldahir, envíalo aquí en PDF.\n"
            "Sin reporte: /asistencia y captura con botones.\n\n"
            "Tu asistencia queda en 1 cada día; si faltaste algún día: /german 1 1 1 1 0")

    async def job_recordatorio(ctx: ContextTypes.DEFAULT_TYPE):
        lunes = semanas.semana_reportada(svc.ahora())
        s = svc.estado.semana(lunes)
        if "aldahir" not in s:
            await ctx.bot.send_message(cfg.chat_id, "Recordatorio: la nómina de hoy espera el reporte de "
                                                    "asistencias de Aldahir. Envía el PDF o usa /asistencia")
        elif s.get("estado") in ("preparado", "pendiente"):
            await ctx.bot.send_message(cfg.chat_id, "Recordatorio: la nómina espera tu aprobación. /vista para verla.")

    async def job_informe(ctx: ContextTypes.DEFAULT_TYPE):
        lunes = semanas.semana_reportada(svc.ahora())
        if (svc.estado.semana(lunes).get("informe") or {}).get("estado") == "enviado":
            return
        await svc.generar_informe(ctx.bot, lunes)

    async def job_verificar(ctx: ContextTypes.DEFAULT_TYPE):
        for iso, s in list(svc.estado._datos.items()):
            if s.get("estado") != "aprobado":
                continue
            lunes = date.fromisoformat(iso)
            if svc.ahora() < svc.momento_envio(lunes):
                continue
            try:
                await svc.enviar(ctx.bot, lunes)
            except Exception as e:  # noqa: BLE001
                intentos = s.get("intentos", 0) + 1
                nuevo = "error" if intentos >= MAX_INTENTOS else "aprobado"
                svc.estado.actualizar(lunes, intentos=intentos, estado=nuevo)
                log.exception("Fallo de envío")
                await ctx.bot.send_message(
                    cfg.chat_id,
                    f"Falló el envío de la nómina ({intentos}/{MAX_INTENTOS}): {e}"
                    + ("\nSe detuvieron los reintentos. Usa /vista y aprueba de nuevo." if nuevo == "error" else
                       "\nSe reintenta en 10 minutos."))

    async def on_error(update: object, ctx: ContextTypes.DEFAULT_TYPE):
        log.error("Error no controlado", exc_info=ctx.error)
        try:
            await ctx.bot.send_message(cfg.chat_id, f"Error: {ctx.error}")
        except Exception:  # noqa: BLE001
            pass

    for nombre, fn in [("start", cmd_ayuda), ("ayuda", cmd_ayuda), ("asistencia", cmd_asistencia),
                       ("german", cmd_german), ("vista", cmd_vista), ("estado", cmd_estado),
                       ("prueba", cmd_prueba), ("nota", cmd_nota), ("notas", cmd_notas),
                       ("informe", cmd_informe), ("informe_prueba", cmd_informe_prueba)]:
        app.add_handler(CommandHandler(nombre, fn, filters=solo_yo))
    app.add_handler(MessageHandler(solo_yo & filters.Document.PDF, recibir_pdf))
    app.add_handler(MessageHandler(solo_yo & filters.TEXT & ~filters.COMMAND, texto_libre))
    app.add_handler(CallbackQueryHandler(botones))
    app.add_error_handler(on_error)

    jq = app.job_queue
    jq.run_daily(job_solicitud, time=cfg.hora_solicitud, days=(1,), name="solicitud_lunes")
    jq.run_daily(job_recordatorio, time=cfg.hora_recordatorio_lunes, days=(1,), name="recordatorio_lunes")
    jq.run_daily(job_informe, time=cfg.hora_informe, days=(1,), name="informe_lunes")
    jq.run_repeating(job_verificar, interval=600, first=30, name="verificar_envios")
    return app


async def _post_init(app: Application) -> None:
    await app.bot.set_my_commands([
        BotCommand("asistencia", "Asistencia de Aldahir con botones"),
        BotCommand("german", "Tu asistencia L a V"),
        BotCommand("vista", "Ver el parte para aprobar"),
        BotCommand("estado", "Estado de la semana"),
        BotCommand("prueba", "Enviar solo a mi correo"),
        BotCommand("nota", "Nota para el informe semanal"),
        BotCommand("notas", "Ver notas de la semana"),
        BotCommand("informe", "Generar el informe ahora"),
        BotCommand("informe_prueba", "Enviar el informe solo a mi correo"),
        BotCommand("ayuda", "Comandos"),
    ])


def main() -> None:
    cfg = configuracion.cargar()
    log.info("Iniciando bot. Destinatarios nómina: %s", cfg.nomina_destinatarios)
    construir(cfg).run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
