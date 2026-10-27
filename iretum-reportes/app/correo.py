"""Envío de correo por la API de Resend."""
import base64
from pathlib import Path

import httpx


async def enviar(api_key: str, remitente: str, destinatarios: list[str], asunto: str,
                 html: str, adjuntos: list[Path], responder_a: str | None = None,
                 texto: str | None = None) -> str:
    cuerpo = {
        "from": remitente,
        "to": destinatarios,
        "subject": asunto,
        "html": html,
        **({"text": texto} if texto else {}),
        "attachments": [
            {"filename": a.name, "content": base64.b64encode(a.read_bytes()).decode()}
            for a in adjuntos
        ],
    }
    if responder_a:
        cuerpo["reply_to"] = responder_a
    async with httpx.AsyncClient(timeout=30) as cliente:
        r = await cliente.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {api_key}"},
            json=cuerpo,
        )
    if r.status_code >= 300:
        raise RuntimeError(f"Resend respondió {r.status_code}: {r.text}")
    return r.json().get("id", "")
