"""Redacción del correo del parte de nómina (asunto, HTML y texto plano)."""
from datetime import date, timedelta
from html import escape

from . import nomina, semanas

DIAS = ["lunes", "martes", "miércoles", "jueves", "viernes"]
FIRMA = ("Germán Rojas Galeana", "Lead Software Architect · Iretum", "iretum.com")


def _dinero(v: float) -> str:
    return f"${v:,.2f}"


def _dias(v: float) -> str:
    return f"{v:g}"


def _incidencias(lunes: date, s: dict) -> list[str]:
    asistencia = {"german": s.get("german", [1.0] * 5), "aldahir": s["aldahir"]}
    horas_reales = {"aldahir": s.get("aldahir_horas")}
    notas_dia = {"aldahir": s.get("aldahir_notas")}
    salida = []
    for clave, valores in asistencia.items():
        p = nomina.PERSONAL[clave]
        jornada = p["jornada_horas"]
        horas_lista = horas_reales.get(clave)
        for i, v in enumerate(valores):
            dia = lunes + timedelta(days=i)
            fecha = f"{DIAS[i]} {dia.day} de {semanas.MESES[dia.month - 1]}"
            nota = (notas_dia.get(clave) or [None] * 5)[i]
            if v >= 1:
                if nota:  # día completo con retardo
                    salida.append(f"{p['nombre_completo']}: {fecha}, día completo con {nota}.")
                continue
            horas = horas_lista[i] if horas_lista else None
            if nota:
                tipo = "falta" if v == 0 else "media jornada"
                salida.append(f"{p['nombre_completo']}: {tipo} el {fecha} ({nota}).")
            elif v == 0 and not horas:
                salida.append(f"{p['nombre_completo']}: falta el {fecha}.")
            elif v == 0:
                salida.append(f"{p['nombre_completo']}: {horas:g} de {jornada} horas el {fecha}, "
                              "registrada como falta.")
            elif horas is None or horas == v * jornada:
                salida.append(f"{p['nombre_completo']}: media jornada el {fecha}.")
            else:
                salida.append(f"{p['nombre_completo']}: {horas:g} de {jornada} horas el {fecha}, "
                              "registrada como media jornada.")
    return salida


def construir(lunes: date, s: dict, archivo_nombre: str) -> tuple[str, str, str]:
    """Devuelve (asunto, html, texto)."""
    rango = semanas.rango_texto(lunes)
    asunto = f"Parte de nómina | Iretum | Semana del {rango}"

    filas, total = [], 0.0
    for clave, valores in {"german": s.get("german", [1.0] * 5), "aldahir": s["aldahir"]}.items():
        p = nomina.PERSONAL[clave]
        dias = round(sum(valores), 2)
        importe = round(nomina.salario_semanal(clave) / 5 * dias, 2)
        total += importe
        filas.append((p["nombre_completo"], p["puesto"], dias, importe))
    total = round(total, 2)
    incidencias = _incidencias(lunes, s)

    # ---------- texto plano ----------
    t = [
        "Buen día:",
        "",
        f"Les comparto el parte de nómina del equipo de desarrollo de Iretum "
        f"correspondiente a la semana del {rango}.",
        "",
        "RESUMEN",
    ]
    for nombre, puesto, dias, importe in filas:
        t.append(f"- {nombre} ({puesto}): {_dias(dias)} días, {_dinero(importe)}")
    t += [f"Total de la semana: {_dinero(total)}", "", "INCIDENCIAS"]
    t += [f"- {i}" for i in incidencias] or ["- Sin incidencias: asistencia completa de lunes a viernes."]
    t += [
        "",
        f"El detalle por día se encuentra en el archivo adjunto ({archivo_nombre}).",
        "",
        "Quedo atento a cualquier comentario.",
        "",
        "Saludos cordiales,",
        *FIRMA,
    ]
    texto = "\n".join(t)

    # ---------- HTML (tablas e estilos en línea, compatibles con Outlook) ----------
    fuente = "font-family:Arial,Helvetica,sans-serif;"
    celda = f"{fuente}font-size:14px;color:#1F2A37;padding:8px 12px;border-bottom:1px solid #E5E9EF;"
    encabezado = (f"{fuente}font-size:12px;color:#FFFFFF;background:#1F3A5F;padding:8px 12px;"
                  "text-align:left;font-weight:bold;")
    filas_html = "".join(
        f"<tr><td style='{celda}'><strong>{escape(n)}</strong><br>"
        f"<span style='font-size:12px;color:#6B7280;'>{escape(pu)}</span></td>"
        f"<td style='{celda}text-align:center;'>{_dias(d)}</td>"
        f"<td style='{celda}text-align:right;'>{_dinero(i)}</td></tr>"
        for n, pu, d, i in filas
    )
    if incidencias:
        inc_html = "<ul style='margin:6px 0 0 18px;padding:0;'>" + "".join(
            f"<li style='{fuente}font-size:14px;color:#1F2A37;margin-bottom:4px;'>{escape(i)}</li>"
            for i in incidencias) + "</ul>"
    else:
        inc_html = (f"<p style='{fuente}font-size:14px;color:#1F2A37;margin:6px 0 0;'>"
                    "Sin incidencias: asistencia completa de lunes a viernes.</p>")
    p = f"style='{fuente}font-size:14px;line-height:1.5;color:#1F2A37;margin:0 0 14px;'"
    p2 = p.replace("margin:0 0 14px", "margin:22px 0 14px")
    h = f"style='{fuente}font-size:13px;font-weight:bold;color:#1F3A5F;margin:22px 0 4px;text-transform:uppercase;letter-spacing:.5px;'"
    html = f"""<div style="max-width:620px;">
<p {p}>Buen día:</p>
<p {p}>Les comparto el parte de nómina del equipo de desarrollo de Iretum correspondiente a la
<strong>semana del {escape(rango)}</strong>.</p>
<p {h}>Resumen</p>
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
<tr><th style="{encabezado}">Colaborador</th><th style="{encabezado}text-align:center;">Días</th>
<th style="{encabezado}text-align:right;">Importe</th></tr>
{filas_html}
<tr><td style="{celda}font-weight:bold;" colspan="2">Total de la semana</td>
<td style="{celda}text-align:right;font-weight:bold;">{_dinero(total)}</td></tr>
</table>
<p {h}>Incidencias</p>
{inc_html}
<p {p2}>El detalle por día se encuentra en el archivo adjunto
(<em>{escape(archivo_nombre)}</em>).</p>
<p {p}>Quedo atento a cualquier comentario.</p>
<p {p}>Saludos cordiales,</p>
<p style="{fuente}font-size:14px;line-height:1.4;color:#1F2A37;margin:0;"><strong>{FIRMA[0]}</strong><br>
<span style="color:#6B7280;">{FIRMA[1]}</span><br>
<a href="https://{FIRMA[2]}" style="color:#1F3A5F;">{FIRMA[2]}</a></p>
</div>"""
    return asunto, html, texto
