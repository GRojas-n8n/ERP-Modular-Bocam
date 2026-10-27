"""Armado del informe semanal en PDF (HTML + WeasyPrint)."""
import re
from datetime import timedelta
from html import escape
from pathlib import Path

from . import semanas

NAVY, INK, MUTED, LINE = "#1F3A5F", "#1F2A37", "#6B7280", "#D5DBE3"
SEM = {"Verde": "#2E8B57", "Amarillo": "#D99A1E", "Rojo": "#C8553D"}
DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

ARQUITECTURA_BASE = [
    ("Frontend", "la parte que el usuario ve y usa en pantalla: un portal único, App Shell, que reúne las pantallas de todos los módulos."),
    ("Backend", "la parte interna que procesa la información y aplica las reglas del negocio: servicios separados por área; si uno falla, los demás siguen funcionando."),
    ("Base de datos", "donde se guarda la información; cada servicio tiene la suya, con una regla de seguridad (RLS) que impide que una empresa o proyecto vea datos de otro."),
    ("Multiempresa y multiproyecto", "varias empresas y obras usan el mismo sistema, cada una aislada con sus propios datos."),
    ("Mensajería entre módulos", "cuando ocurre algo en un área, el sistema envía un aviso automático (evento) a las áreas interesadas; por ejemplo, Compras avisa a Almacén que llegó un material."),
]

GLOSARIO_BASE = [
    ("ERP", "Sistema que integra todas las áreas de la empresa en una sola plataforma.", "La oficina central que coordina todos los frentes de obra."),
    ("SaaS", "Software que se usa por internet, sin instalarlo en cada equipo.", "Rentar maquinaria con mantenimiento incluido."),
    ("Módulo", "Bloque del sistema dedicado a un área (Compras, Almacén, Personal).", "Cada especialidad de la obra: estructura, instalaciones, acabados."),
    ("Frontend", "Lo que el usuario ve y usa en pantalla.", "Fachada y acabados."),
    ("Backend", "La parte interna que procesa información y aplica las reglas.", "Instalaciones ocultas: eléctrica, hidráulica, sanitaria."),
    ("Base de datos", "Donde se guarda toda la información de forma ordenada.", "Archivo de planos y bitácora de obra."),
    ("Multiempresa (multitenant)", "Varias empresas y obras usan el mismo sistema, cada una aislada.", "Edificio de departamentos: estructura compartida, cada quien con su llave."),
    ("RLS", "Regla que impide ver información de otra empresa o proyecto.", "La cerradura de cada departamento."),
    ("Evento / mensajería", "Aviso automático que un módulo envía a otros.", "El oficio o el radio entre frentes de obra."),
    ("Repositorio", "Archivo central con todas las versiones del sistema.", "Archivo maestro de planos con todas sus revisiones."),
    ("Commit", "Registro formal de un cambio, con autor y fecha.", "Firma y fecha de una revisión de plano."),
    ("Push", "Enviar los cambios registrados al repositorio central; también es su respaldo.", "Entregar la revisión firmada al archivo de la oficina."),
    ("Rama", "Copia de trabajo separada donde se hacen cambios sin afectar la versión oficial.", "Plano de trabajo antes de pasar a plano autorizado."),
    ("Pull Request", "Solicitud para que un cambio sea revisado antes de integrarse.", "Orden de cambio que revisa la supervisión antes de autorizar."),
    ("Publicación (despliegue)", "Poner un cambio a disposición de los usuarios.", "Entrega y puesta en servicio."),
    ("Pruebas automáticas", "Verificaciones que el sistema repite solo en cada cambio.", "Pruebas de laboratorio de materiales en cada colado."),
    ("Entorno de pruebas", "Copia del sistema con datos ficticios para experimentar.", "Obra muestra o maqueta."),
    ("Roles y permisos", "Qué puede ver y hacer cada tipo de usuario.", "Control de accesos: cada quien entra a su área."),
    ("PWA", "Aplicación web que se instala en la tablet y funciona sin conexión.", "Bitácora de campo que se llena aunque no haya señal y se entrega al volver a la oficina."),
    ("Línea base", "Referencia fija contra la que se mide el avance.", "Programa de obra autorizado."),
    ("Índice de madurez", "Avance verificable por módulo con 5 criterios de 20 puntos.", "Avance físico medido con estimaciones firmadas, no con apreciación."),
]

CSS = f"""
@page {{ size: letter; margin: 22mm 20mm 20mm 20mm;
  @top-left {{ content: "ERP Iretum | Informe semanal de avance"; font: 8pt 'Liberation Sans', Arial, sans-serif; color: {MUTED}; }}
  @top-right {{ content: string(rango); font: 8pt 'Liberation Sans', Arial, sans-serif; color: {MUTED}; }}
  @bottom-right {{ content: "Página " counter(page) " de " counter(pages); font: 8pt 'Liberation Sans', Arial, sans-serif; color: {MUTED}; }} }}
@page :first {{ @top-left {{ content: none; }} @top-right {{ content: none; }} }}
body {{ font-family: 'Liberation Sans', Arial, sans-serif; font-size: 10pt; color: {INK}; line-height: 1.42; }}
.rango-marca {{ string-set: rango content(); font-size: 0; }}
h1 {{ font-size: 15pt; color: {NAVY}; border-bottom: 1px solid {LINE}; padding-bottom: 4px; margin: 0 0 10px; }}
h2 {{ font-size: 12pt; color: {NAVY}; margin: 16px 0 6px; }}
h3 {{ font-size: 10.5pt; color: {NAVY}; margin: 12px 0 4px; }}
.parte {{ font-size: 9pt; letter-spacing: 1.5px; color: {MUTED}; font-weight: bold; margin: 0 0 2px; }}
p {{ margin: 0 0 7px; }}
ul, ol {{ margin: 0 0 8px 0; padding-left: 18px; }} li {{ margin-bottom: 3px; }}
table {{ width: 100%; border-collapse: collapse; margin: 4px 0 10px; font-size: 9pt; }}
th {{ background: {NAVY}; color: #fff; text-align: left; padding: 5px 7px; }}
td {{ border-bottom: 1px solid {LINE}; padding: 5px 7px; vertical-align: top; }}
tr {{ page-break-inside: avoid; }} tbody tr:nth-child(even) td {{ background: #F7F9FB; }}
.c {{ text-align: center; }} .r {{ text-align: right; }}
.pill {{ display: inline-block; color: #fff; font-weight: bold; font-size: 8pt; padding: 2px 8px; border-radius: 9px; }}
.kpis {{ display: flex; gap: 8px; margin: 6px 0 12px; }}
.kpi {{ flex: 1; background: #F4F6F9; border: 1px solid {LINE}; text-align: center; padding: 10px 6px; }}
.kpi b {{ display: block; font-size: 20pt; color: {NAVY}; }} .kpi span {{ font-size: 8pt; color: {MUTED}; }}
.nota {{ background: #EEF3F8; border-left: 4px solid {NAVY}; padding: 8px 12px; margin: 6px 0 10px; font-size: 9pt; }}
.aviso {{ background: #FBF1EF; border-left: 4px solid {SEM['Rojo']}; padding: 8px 12px; margin: 6px 0 10px; font-size: 9pt; }}
.portada {{ margin-top: 30mm; }}
.portada .tag {{ font-size: 9pt; letter-spacing: 2px; color: {MUTED}; font-weight: bold; }}
.portada .titulo {{ font-size: 30pt; color: {NAVY}; font-weight: bold; margin: 4px 0; }}
.portada .sub {{ font-size: 14pt; border-bottom: 2px solid {NAVY}; padding-bottom: 10px; margin-bottom: 18px; }}
.barra {{ display: flex; align-items: center; margin: 3px 0; font-size: 8.5pt; }}
.barra .n {{ width: 38mm; text-align: right; padding-right: 3mm; }}
.barra .t {{ flex: 1; background: #EEF1F4; height: 11px; position: relative; }}
.barra .f {{ height: 11px; position: absolute; left: 0; top: 0; }} .barra .c2 {{ background: #C9D3DF; }}
.barra .v {{ width: 16mm; padding-left: 2mm; font-weight: bold; }}
.salto {{ page-break-before: always; }}
.leyenda {{ font-size: 8pt; color: {MUTED}; font-style: italic; }}
"""


def _md(t: str) -> str:
    """Texto plano con **negritas** a HTML seguro."""
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", escape(t or ""))


def _pill(estado: str) -> str:
    return f'<span class="pill" style="background:{SEM.get(estado, MUTED)}">{escape(estado.upper())}</span>'


def _tabla(encabezados: list[str], filas: list[list[str]], anchos: list[int] | None = None, clases=None) -> str:
    cols = "".join(f'<col style="width:{a}%">' for a in anchos) if anchos else ""
    th = "".join(f"<th>{escape(h)}</th>" for h in encabezados)
    cuerpo = ""
    for f in filas:
        cuerpo += "<tr>" + "".join(
            f'<td class="{(clases or [""] * len(f))[i]}">{c}</td>' for i, c in enumerate(f)) + "</tr>"
    return f"<table><colgroup>{cols}</colgroup><thead><tr>{th}</tr></thead><tbody>{cuerpo}</tbody></table>"


def _color(p: int) -> str:
    return SEM["Verde"] if p >= 70 else (SEM["Amarillo"] if p >= 40 else SEM["Rojo"])


def html(d: dict) -> str:
    r = d["redaccion"]
    lunes = d["lunes"]
    rango = semanas.rango_texto(lunes)
    a = d["aldahir"]
    partes = []

    # ---------- portada ----------
    partes.append(f"""<div class="rango-marca">{escape(rango)}</div>
<div class="portada"><div class="tag">INFORME SEMANAL DE AVANCE</div>
<div class="titulo">ERP Iretum</div><div class="sub">Semana del {escape(rango)}</div>
{_tabla(["Dato", "Detalle"], [
        ["Dirigido a", "Gerencia Técnica, Constructora e Inmobiliaria BOCAM S.A. de C.V."],
        ["Elaboró", "Germán Rojas Galeana, Lead Software Architect"],
        ["Equipo", "Germán Rojas Galeana (arquitectura y desarrollo); Aldahir Molina Medina (Junior Software Developer, bajo supervisión)"],
        ["Fecha de emisión", escape(d["fecha_emision"])],
        ["Fuentes", "Repositorios de código, registros de decisión, índice de madurez, reportes diarios y notas de supervisión"],
    ], [28, 72])}</div>""")

    # ---------- resumen ejecutivo ----------
    var = d["variacion_texto"]
    con, var_c = d.get("construccion"), d.get("variacion_construccion")
    alcance_html = ""
    if d.get("construccion_original") is not None:
        alcance_html = (f'<p><b>Alcance original ({d["n_original"]} módulos): {d["construccion_original"]}%</b> de construcción. '
                        f'Módulos incorporados al seguimiento ({d["n_incorporado"]}): {d["construccion_incorporado"]}%. '
                        f'ERP completo: {con}%.</p>')
    partes.append(f"""<h1 class="salto">Resumen ejecutivo</h1>
<div class="kpis"><div class="kpi"><b>{con if con is not None else "s/d"}{"%" if con is not None else ""}</b><span>Avance de construcción · {escape(var_c or "sin dato")}</span></div>
<div class="kpi"><b>{d['indice']}%</b><span>Madurez verificable · {escape(var)}</span></div>
<div class="kpi"><b style="color:{SEM[d['semaforo']]}">{d['semaforo'].upper()}</b><span>Semáforo general</span></div>
<div class="kpi"><b>{a['dias_con_respaldo']} de 5</b><span>Días con respaldo de Aldahir</span></div></div>
{alcance_html}<p class="nota"><b>Cómo leer el avance.</b> El avance de construcción indica qué parte del alcance planeado ya está construida. La madurez verificable indica qué parte está comprobada con pruebas, integración con otros módulos y aceptación formal. La diferencia entre ambos es el trabajo de consolidación en curso.</p>
<p>{_md(r['lectura'])}</p><h2>Lo más relevante</h2><ul>{''.join(f'<li>{_md(x)}</li>' for x in r['destacados'])}</ul>
<h2>Semáforo por frente</h2>{_tabla(["Frente", "Estado", "Motivo"],
        [[_md(f['nombre']), _pill(f['estado']), _md(f['motivo'])] for f in r['frentes']], [32, 14, 54], ["", "c", ""])}
<h2>Decisiones que se solicitan a Gerencia Técnica</h2>""" + (
        "<ol>" + "".join(f"<li>{_md(x)}</li>" for x in r["decisiones_solicitadas"]) + "</ol>"
        if r["decisiones_solicitadas"] else "<p>Esta semana no se requieren decisiones.</p>"))

    # ---------- parte I ----------
    arq = "".join(f"<li><b>{escape(n)}</b> ({escape(t)})</li>" for n, t in ARQUITECTURA_BASE)
    partes.append(f"""<div class="salto"></div><div class="parte">PARTE I</div><h1>Avance del ERP Iretum</h1>
<p>Liderazgo técnico de <b>Germán Rojas Galeana</b>, Lead Software Architect: arquitectura, decisiones técnicas, nuevos módulos y publicaciones.</p>
<h2>1. Arquitectura del sistema</h2><p>Iretum es un ERP (sistema que integra las áreas de la empresa) que se usa por internet y se organiza así:</p><ul>{arq}</ul>
<p><b>Cambios de la semana:</b> {_md(r['arquitectura_cambios']) or 'sin cambios de arquitectura esta semana.'}</p>
<h2>2. Decisiones técnicas de la semana</h2>""" + (
        _tabla(["Decisión", "Para qué sirve", "A favor", "En contra / costo"],
               [[_md(x["decision"]), _md(x["proposito"]), _md(x["a_favor"]), _md(x["en_contra"])]
                for x in r["decisiones_tecnicas"]], [28, 26, 23, 23])
        if r["decisiones_tecnicas"] else "<p>No se registraron decisiones técnicas nuevas esta semana.</p>"))

    ini = '<h2>3. Nuevos módulos e iniciativas</h2>'
    if not r["iniciativas"]:
        ini += "<p>Sin iniciativas nuevas esta semana.</p>"
    for x in r["iniciativas"]:
        ini += (f"<h3>{_md(x['nombre'])}</h3><p><b>Objetivo:</b> {_md(x['objetivo'])}</p>"
                f"<p><b>Estado:</b> {_md(x['estado'])}</p>")
        if x["funcionamiento"]:
            ini += "<p><b>Cómo funcionará:</b></p><ul>" + "".join(f"<li>{_md(f)}</li>" for f in x["funcionamiento"]) + "</ul>"
        if x["etapas"]:
            ini += _tabla(["Periodo", "Alcance", "Responsable"],
                          [[_md(e["periodo"]), _md(e["alcance"]), _md(e["responsable"])] for e in x["etapas"]], [22, 53, 25])
    partes.append(ini)

    barras = "".join(
        f'<div class="barra"><div class="n">{escape(m["nombre"])}</div><div class="t">'
        f'<div class="f c2" style="width:{m.get("construido") or 0}%"></div>'
        f'<div class="f c1" style="width:{m["porcentaje"]}%;background:{_color(m["porcentaje"])}"></div></div>'
        f'<div class="v">{m.get("construido") if m.get("construido") is not None else "-"} / {m["porcentaje"]}</div></div>'
        for m in d["modulos"])

    def _cambio(v):
        return "" if v in (None, 0) else (f"+{v}" if v > 0 else str(v))
    filas_mod = []
    for m in d["modulos"]:
        marcas = ["✓" if c == 1 else ("½" if c == 0.5 else "") for c in m["criterios"]]
        cons = m.get("construido")
        nombre = escape(m["nombre"]) + (' <span class="leyenda">(incorporado)</span>' if m.get("alcance") == "Incorporado" else "")
        filas_mod.append([nombre, "" if cons is None else f"{cons}%", *marcas, f"<b>{m['porcentaje']}%</b>",
                          " / ".join(x for x in (_cambio(m.get("cambio_construido")), _cambio(m.get("cambio"))) if x)])
    texto_con = (f"Avance de construcción global: <b>{con}%</b> ({escape(var_c)}). " if con is not None else "")
    partes.append(f"""<h2>4. Avance físico por módulo</h2>
<p>{texto_con}Madurez verificable global: <b>{d['indice']}%</b> ({escape(var)}). La madurez se califica con cinco criterios verificables de 20 puntos: C1 código funcionando, C2 datos y permisos, C3 pruebas propias, C4 integración probada con otros módulos y C5 aceptación formal del negocio. ½ indica cumplimiento parcial.</p>
<p class="leyenda">Barra clara: construido. Barra de color: comprobado (madurez). Cifras: construido / madurez.</p>
{barras}<p class="leyenda">Color de la madurez: verde 70% o más, amarillo 40% a 69%, rojo menos de 40%. Mientras ningún módulo tenga aceptación formal, la madurez máxima posible es 80%.</p>
{_tabla(["Módulo", "Construido", "C1", "C2", "C3", "C4", "C5", "Madurez", "Cambio"], filas_mod, [24, 12, 6, 6, 6, 6, 6, 13, 21], ["", "r", "c", "c", "c", "c", "c", "r", "r"])}""")

    pubs = {p["numero"]: p["descripcion"] for p in r["publicaciones"]}
    filas_pub = [[f"#{p['numero']}", escape(p["fecha"]), _md(pubs.get(p["numero"]) or p["titulo"])]
                 for p in d["prs_fusionados"]]
    partes.append("<h2>5. Publicaciones de la semana</h2>" + (
        f"<p>Cambios revisados e integrados a la versión oficial del sistema: {len(filas_pub)}. "
        f"Solicitudes de cambio abiertas en espera de revisión: {d['prs_abiertos']}.</p>"
        + _tabla(["Cambio", "Fecha", "Qué mejora"], filas_pub, [12, 16, 72])
        if filas_pub else
        f"<p>No se integraron cambios a la versión oficial esta semana. Solicitudes de cambio abiertas en espera de revisión: {d['prs_abiertos']}.</p>"))

    # ---------- parte II ----------
    filas_dia = []
    for i, dia in enumerate(a["dias"]):
        realizado = r["aldahir_realizado"][i] or ("Sin reporte diario en el repositorio." if not dia["reporte"] else "")
        filas_dia.append([f"<b>{DIAS[i]}</b> {dia['fecha']}", _md(dia["plan"]) or '<span class="leyenda">Sin plan registrado</span>',
                          _md(realizado), str(dia["commits"]), "Sí" if dia["reporte"] else "No"])
    hall = (_tabla(["Tema", "Hallazgo", "Estado"],
                   [[_md(h["tema"]), _md(h["hallazgo"]), _md(h["estado"])] for h in r["aldahir_hallazgos"]], [22, 55, 23])
            if r["aldahir_hallazgos"] else "<p>Sin hallazgos registrados en los reportes de la semana.</p>")
    metricas = _tabla(["Indicador", "Resultado"], [
        ["Días con respaldo (push) en el repositorio", f"{a['dias_con_respaldo']} de 5"],
        ["Reportes diarios entregados en el repositorio", f"{a['reportes']} de 5"],
        ["Registros de cambio (commits) en la semana", str(a["commits"])],
        ["Solicitudes de revisión (Pull Request) abiertas en la semana", str(a["prs_creados"])],
        ["Solicitudes de revisión integradas en la semana", str(a["prs_fusionados"])],
    ], [70, 30], ["", "r"])
    aviso = ""
    if a["dias_con_respaldo"] == 0:
        aviso = ('<div class="aviso"><b>Sin respaldo en el repositorio esta semana.</b> El trabajo no tiene copia '
                 'en el servidor ni puede revisarse formalmente hasta que se registre y se envíe.</div>')
    partes.append(f"""<div class="salto"></div><div class="parte">PARTE II</div><h1>Avance de desarrollo de Aldahir Molina Medina</h1>
<p>Junior Software Developer, bajo supervisión de Germán Rojas Galeana. Tareas y plan de la semana tomados del repositorio de desarrollo junior.</p>
<h2>6. Plan contra realizado</h2>{_tabla(["Día", "Planeado", "Realizado", "Commits", "Reporte"], filas_dia, [14, 31, 37, 9, 9], ["", "", "", "c", "c"])}
<h2>7. Hallazgos y correcciones</h2>{hall}
<h2>8. Disciplina de entrega</h2>{aviso}{metricas}
<h2>9. Observaciones de supervisión</h2><p>{_md(r['aldahir_observaciones']) or 'Sin observaciones adicionales.'}</p>""")

    # ---------- parte III ----------
    bloq = (_tabla(["Bloqueo", "Impacto", "Quién lo destraba"],
                   [[_md(b["bloqueo"]), _md(b["impacto"]), _md(b["responsable"])] for b in r["bloqueos"]], [36, 40, 24])
            if r["bloqueos"] else "<p>Sin bloqueos activos.</p>")
    plan = (_tabla(["Acción", "Responsable"], [[_md(p["accion"]), _md(p["responsable"])] for p in r["plan_siguiente"]], [72, 28])
            if r["plan_siguiente"] else "")
    sig = semanas.rango_texto(lunes + timedelta(days=7))
    partes.append(f"""<div class="parte" style="margin-top:22px">PARTE III</div><h1>Cierre</h1>
<h2>10. Bloqueos</h2>{bloq}
<h2>11. Plan de la semana del {escape(sig)}</h2>{plan}
<h2>12. Conclusión</h2>{''.join(f'<p>{_md(x)}</p>' for x in r['conclusion'])}""")

    # ---------- glosario ----------
    base = {t.lower() for t, _, _ in GLOSARIO_BASE}
    extra = [(g["termino"], g["definicion"], g["analogia"]) for g in r["glosario_extra"] if g["termino"].lower() not in base]
    gl = sorted(GLOSARIO_BASE + extra, key=lambda x: x[0].lower())
    partes.append(f"""<div class="salto"></div><div class="parte">ANEXO</div><h1>Glosario de términos técnicos</h1>
<p>Términos usados en este informe, con su equivalente en una obra de construcción.</p>
{_tabla(["Término", "Qué es", "En obra equivale a"], [[f'<b>{escape(t)}</b>', escape(q), escape(o)] for t, q, o in gl], [22, 42, 36])}""")

    if d.get("fuentes_faltantes"):
        partes.append('<p class="leyenda">Fuentes no disponibles al generar este informe: '
                      + escape("; ".join(d["fuentes_faltantes"])) + ".</p>")
    return f"<!doctype html><html lang='es'><head><meta charset='utf-8'><style>{CSS}</style></head><body>{''.join(partes)}</body></html>"


def generar(d: dict, destino: Path) -> Path:
    from weasyprint import HTML  # importación diferida: carga pesada
    destino.parent.mkdir(parents=True, exist_ok=True)
    HTML(string=html(d)).write_pdf(destino)
    return destino
