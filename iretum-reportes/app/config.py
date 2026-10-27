"""Configuración leída de variables de entorno (definidas en Coolify)."""
import os
from dataclasses import dataclass
from datetime import time
from pathlib import Path
from zoneinfo import ZoneInfo


def _req(nombre: str) -> str:
    valor = os.environ.get(nombre, "").strip()
    if not valor:
        raise RuntimeError(f"Falta la variable de entorno {nombre}")
    return valor


def _lista(nombre: str) -> list[str]:
    return [x.strip() for x in os.environ.get(nombre, "").split(",") if x.strip()]


def _hora(nombre: str, defecto: str, tz: ZoneInfo | None) -> time:
    hh, mm = os.environ.get(nombre, defecto).strip().split(":")
    return time(int(hh), int(mm), tzinfo=tz)


@dataclass(frozen=True)
class Config:
    telegram_token: str
    chat_id: int
    resend_api_key: str
    mail_from: str
    mail_reply_to: str
    nomina_destinatarios: list[str]
    prueba_destinatario: str
    data_dir: Path
    tz: ZoneInfo
    hora_envio: time         # lunes
    turno_inicio: time       # turno de Aldahir
    turno_fin: time
    tolerancia_min: int
    retardo_max_min: int
    hora_solicitud: time     # lunes: pedir la asistencia
    hora_recordatorio_lunes: time
    # Informe a Gerencia Técnica
    informe_destinatarios: list[str]
    github_token: str | None
    anthropic_api_key: str | None
    claude_modelo: str
    repo_principal: str
    repo_junior: str
    hora_informe: time


def cargar() -> Config:
    tz = ZoneInfo(os.environ.get("ZONA_HORARIA", "America/Mexico_City"))
    destinatarios = _lista("NOMINA_DESTINATARIOS")
    if not destinatarios:
        raise RuntimeError("NOMINA_DESTINATARIOS está vacío")
    return Config(
        telegram_token=_req("TELEGRAM_TOKEN"),
        chat_id=int(_req("TELEGRAM_CHAT_ID")),
        resend_api_key=_req("RESEND_API_KEY"),
        mail_from=os.environ.get("MAIL_FROM", "Iretum Reportes <reportes@iretum.com>"),
        mail_reply_to=_req("MAIL_REPLY_TO"),
        nomina_destinatarios=destinatarios,
        prueba_destinatario=os.environ.get("PRUEBA_DESTINATARIO", "").strip() or _req("MAIL_REPLY_TO"),
        data_dir=Path(os.environ.get("DATA_DIR", "/data")),
        tz=tz,
        hora_envio=_hora("HORA_ENVIO_LUNES", "08:00", tz),
        turno_inicio=_hora("TURNO_INICIO", "14:00", None),
        turno_fin=_hora("TURNO_FIN", "18:00", None),
        tolerancia_min=int(os.environ.get("TOLERANCIA_MIN", "10")),
        retardo_max_min=int(os.environ.get("RETARDO_MAX_MIN", "60")),
        hora_solicitud=_hora("HORA_SOLICITUD_LUNES", "08:15", tz),
        hora_recordatorio_lunes=_hora("HORA_RECORDATORIO_LUNES", "12:00", tz),
        informe_destinatarios=_lista("INFORME_DESTINATARIOS"),
        github_token=os.environ.get("GITHUB_TOKEN", "").strip() or None,
        anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY", "").strip() or None,
        claude_modelo=os.environ.get("CLAUDE_MODELO", "claude-sonnet-5-5").strip(),
        repo_principal=os.environ.get("REPO_PRINCIPAL", "GRojas-n8n/ERP-Modular-Bocam").strip(),
        repo_junior=os.environ.get("REPO_JUNIOR", "GRojas-n8n/iretum-jr-dev").strip(),
        hora_informe=_hora("HORA_INFORME_LUNES", "07:00", tz),
    )
