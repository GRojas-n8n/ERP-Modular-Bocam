"""Redacción del correo del informe de avance semanal a Gerencia Técnica."""
from html import escape

from . import semanas

FIRMA = ("Germán Rojas Galeana", "Lead Software Architect · Iretum", "iretum.com")
COLOR_SEMAFORO = {"Verde": "#2E8B57", "Amarillo": "#D99A1E", "Rojo": "#C8553D"}


def _variacion(actual: int, anterior: int | None) -> str:
    if anterior is None:
        return "primera medición"
    d = actual - anterior
    if d == 0:
        return "sin cambio respecto a la semana anterior"
    return f"{'+' if d > 0 else '−'}{abs(d)} puntos respecto a la semana anterior"


def construir(datos: dict) -> tuple[str, str, str]:
    """datos: lunes, indice, indice_anterior, semaforo, lectura, destacados[], frentes[], decisiones[], archivo.

    Devuelve (asunto, html, texto).
    """
    rango = semanas.rango_texto(datos["lunes"])
    asunto = f"Informe de avance | ERP Iretum | Semana del {rango}"
    indice, sem = datos["indice"], datos["semaforo"]
    variacion = _variacion(indice, datos.get("indice_anterior"))
    con = datos.get("construccion")
    var_con = _variacion(con, datos.get("construccion_anterior")) if con is not None else ""
    decisiones = datos.get("decisiones") or []

    # ---------- texto plano ----------
    t = [
        "Buen día:", "",
        f"Comparto el informe de avance del ERP Iretum correspondiente a la semana del {rango}.", "",
        "RESUMEN",
        *([f"- Avance de construcción: {con}% del ERP completo ({var_con})"] if con is not None else []),
        *([f"- Alcance original: {datos['construccion_original']}% de construcción; módulos incorporados al seguimiento: "
           f"{datos['construccion_incorporado']}%"] if datos.get("construccion_original") is not None else []),
        f"- Madurez verificable: {indice}% ({variacion})",
        f"- Semáforo general: {sem.upper()}",
        f"- {datos['lectura']}", "",
        "LO MÁS RELEVANTE",
        *[f"- {d}" for d in datos["destacados"]], "",
        "ESTADO POR FRENTE",
        *[f"- {f['nombre']}: {f['estado'].upper()}. {f['motivo']}" for f in datos["frentes"]], "",
        "DECISIONES QUE REQUIEREN SU APROBACIÓN",
        *([f"{i}. {d}" for i, d in enumerate(decisiones, 1)] or ["Esta semana no se requieren decisiones."]), "",
        f"El informe completo se encuentra en el archivo adjunto ({datos['archivo']}). Incluye el detalle "
        "del trabajo técnico explicado en lenguaje claro, la gráfica de avance por módulo y un glosario.", "",
        "Quedo atento a sus comentarios.", "",
        "Saludos cordiales,", *FIRMA,
    ]
    texto = "\n".join(t)

    # ---------- HTML (tablas y estilos en línea, compatibles con Outlook) ----------
    f_ = "font-family:Arial,Helvetica,sans-serif;"
    p = f"style='{f_}font-size:14px;line-height:1.5;color:#1F2A37;margin:0 0 14px;'"
    p_sep = f"style='{f_}font-size:14px;line-height:1.5;color:#1F2A37;margin:22px 0 14px;'"
    h = (f"style='{f_}font-size:13px;font-weight:bold;color:#1F3A5F;margin:24px 0 8px;"
         "text-transform:uppercase;letter-spacing:.5px;'")
    li = f"style='{f_}font-size:14px;line-height:1.5;color:#1F2A37;margin-bottom:6px;'"

    def pastilla(estado: str) -> str:
        return (f"<span style='{f_}display:inline-block;background:{COLOR_SEMAFORO[estado]};color:#FFFFFF;"
                f"font-size:11px;font-weight:bold;padding:3px 9px;border-radius:10px;'>{estado.upper()}</span>")

    def _kpi(valor: str, etiqueta: str, color: str = "#1F3A5F") -> str:
        return (f'<td style="{f_}background:#F4F6F9;border:1px solid #E5E9EF;padding:14px;text-align:center;">'
                f'<div style="font-size:28px;font-weight:bold;color:{color};">{valor}</div>'
                f'<div style="font-size:12px;color:#6B7280;margin-top:2px;">{escape(etiqueta)}</div></td>')
    celdas_kpi = ((_kpi(f"{con}%", f"Avance de construcción · {var_con}") if con is not None else "")
                  + _kpi(f"{indice}%", f"Madurez verificable · {variacion}")
                  + _kpi(sem.upper(), "Semáforo general", COLOR_SEMAFORO[sem]))
    kpi = ('<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>'
           + celdas_kpi + "</tr></table>"
           + (f"<p style='{f_}font-size:14px;color:#1F2A37;margin:10px 0 0;'><strong>Alcance original: "
              f"{datos['construccion_original']}%</strong> de construcción. Módulos incorporados al seguimiento: "
              f"{datos['construccion_incorporado']}%.</p>" if datos.get("construccion_original") is not None else "")
           + f"<p style='{f_}font-size:12px;color:#6B7280;margin:8px 0 0;'>Construcción: parte del alcance planeado "
             "ya construida. Madurez: parte comprobada con pruebas, integración y aceptación.</p>")

    celda = f"{f_}font-size:14px;color:#1F2A37;padding:9px 12px;border-bottom:1px solid #E5E9EF;vertical-align:top;"
    frentes = "".join(
        f"<tr><td style='{celda}'><strong>{escape(fr['nombre'])}</strong><br>"
        f"<span style='font-size:13px;color:#4B5563;'>{escape(fr['motivo'])}</span></td>"
        f"<td style='{celda}text-align:right;white-space:nowrap;'>{pastilla(fr['estado'])}</td></tr>"
        for fr in datos["frentes"])

    destacados = "<ul style='margin:0 0 0 18px;padding:0;'>" + "".join(
        f"<li {li}>{escape(d)}</li>" for d in datos["destacados"]) + "</ul>"
    if decisiones:
        dec = "<ol style='margin:0 0 0 20px;padding:0;'>" + "".join(
            f"<li {li}>{escape(d)}</li>" for d in decisiones) + "</ol>"
    else:
        dec = f"<p {p}>Esta semana no se requieren decisiones.</p>"

    html = f"""<div style="max-width:620px;">
<p {p}>Buen día:</p>
<p {p}>Comparto el informe de avance del ERP Iretum correspondiente a la
<strong>semana del {escape(rango)}</strong>.</p>
<p {h}>Resumen</p>
{kpi}
<p {p_sep}>{escape(datos['lectura'])}</p>
<p {h}>Lo más relevante</p>
{destacados}
<p {h}>Estado por frente</p>
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">{frentes}</table>
<p {h}>Decisiones que requieren su aprobación</p>
{dec}
<p {p_sep}>El informe completo se encuentra en el archivo adjunto (<em>{escape(datos['archivo'])}</em>).
Incluye el detalle del trabajo técnico explicado en lenguaje claro, la gráfica de avance por módulo y un glosario.</p>
<p {p}>Quedo atento a sus comentarios.</p>
<p {p}>Saludos cordiales,</p>
<p style="{f_}font-size:14px;line-height:1.4;color:#1F2A37;margin:0;"><strong>{FIRMA[0]}</strong><br>
<span style="color:#6B7280;">{FIRMA[1]}</span><br>
<a href="https://{FIRMA[2]}" style="color:#1F3A5F;">{FIRMA[2]}</a></p>
</div>"""
    return asunto, html, texto
