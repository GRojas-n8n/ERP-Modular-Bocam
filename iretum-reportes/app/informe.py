"""Orquestación del informe semanal: recolectar, calcular, redactar y armar el PDF."""
import json
import logging
import unicodedata
from datetime import date, datetime, timedelta
from pathlib import Path

from . import informe_pdf, madurez, redaccion, semanas
from .github import GitHub

log = logging.getLogger("iretum.informe")
DIAS_PLAN = ["lun", "mar", "mie", "jue", "vie"]
CONTEXTO_INICIAL = Path(__file__).resolve().parent.parent / "contexto" / "semana_anterior_inicial.json"


def nombre_archivo(lunes: date) -> str:
    return f"{semanas.viernes(lunes):%Y%m%d} Informe de Avance ERP Iretum.pdf"


def variacion_texto(actual: int, anterior: int | None) -> str:
    if anterior is None:
        return "primera medición"
    d = actual - anterior
    if d == 0:
        return "sin cambio respecto a la semana anterior"
    return f"{'+' if d > 0 else '-'}{abs(d)} puntos respecto a la semana anterior"


def _plan_por_dia(md: str | None) -> list[str]:
    """Lee la tabla «Día | Tarea | Actividad | Entregable» del plan semanal."""
    plan = [""] * 5
    for linea in (md or "").splitlines():
        if not linea.strip().startswith("|"):
            continue
        celdas = [c.strip() for c in linea.strip().strip("|").split("|")]
        clave = unicodedata.normalize("NFKD", celdas[0]).encode("ascii", "ignore").decode().lower()
        for i, pref in enumerate(DIAS_PLAN):
            if clave.startswith(pref):
                tarea = celdas[1] if len(celdas) > 2 else ""
                actividad = celdas[2] if len(celdas) > 2 else (celdas[1] if len(celdas) > 1 else "")
                plan[i] = f"{tarea}: {actividad}" if tarea else actividad
                break
    return plan


async def recolectar(cfg, lunes: date, notas: list[str], anterior: dict | None) -> dict:
    gh = GitHub(cfg.github_token, cfg.tz)
    try:
        principal = await gh.recolectar(cfg.repo_principal, lunes, False,
                                        archivos_fijos=("MADUREZ.md",),
                                        carpetas_modificadas=("docs/decisiones",))
        junior = await gh.recolectar(cfg.repo_junior, lunes, True,
                                     carpetas_por_fecha=("reports", "reportes"),
                                     archivos_fijos=(f"planes/{lunes.isoformat()}.md",))
    finally:
        await gh.cerrar()

    faltantes = principal.errores + junior.errores
    if "MADUREZ.md" not in principal.archivos:
        raise RuntimeError(f"No encontré MADUREZ.md en {cfg.repo_principal}. Súbelo a la raíz del repositorio.")
    modulos = madurez.leer(principal.archivos["MADUREZ.md"])
    indice = madurez.indice_global(modulos)
    construccion = madurez.construccion_global(modulos)
    hay_incorporados = any(m.alcance == "Incorporado" for m in modulos)
    construccion_original = madurez.construccion_global(modulos, "Original") if hay_incorporados else None
    construccion_incorporado = madurez.construccion_global(modulos, "Incorporado") if hay_incorporados else None
    if construccion is None:
        faltantes = faltantes + ["MADUREZ.md: falta la columna Construido en uno o más módulos"]
    incongruentes = [m.nombre for m in modulos if m.construido is not None and m.porcentaje > m.construido]
    if incongruentes:
        faltantes = faltantes + ["MADUREZ.md: madurez mayor que lo construido en " + ", ".join(incongruentes)]
    previos = {m["nombre"]: m["porcentaje"] for m in (anterior or {}).get("modulos", [])}
    previos_c = {m["nombre"]: m.get("construido") for m in (anterior or {}).get("modulos", [])}
    inicial = _contexto_inicial() if anterior is None else {}
    indice_anterior = (anterior or {}).get("indice", inicial.get("indice"))
    construccion_anterior = (anterior or {}).get("construccion", inicial.get("construccion"))

    # Aldahir: plan, reportes y commits por día (lunes a viernes).
    plan = _plan_por_dia(junior.archivos.get(f"planes/{lunes.isoformat()}.md"))
    dias = []
    for i in range(5):
        f = lunes + timedelta(days=i)
        commits = [c for c in junior.commits if c.fecha.date() == f]
        reporte = next((v for k, v in junior.archivos.items() if k.split("/", 1)[-1].startswith(f.isoformat())
                        and k.split("/", 1)[0] in ("reports", "reportes")), None)
        dias.append({"fecha": f"{f.day:02d}/{f.month:02d}", "plan": plan[i], "commits": len(commits),
                     "reporte": reporte is not None, "reporte_texto": reporte or "",
                     "mensajes_commit": [c.mensaje.splitlines()[0] for c in commits][:15]})
    fechas_con_push = {c.fecha.date() for c in junior.commits if c.fecha.date() < lunes + timedelta(days=5)}

    d = {
        "lunes": lunes,
        "fecha_emision": f"{datetime.now(cfg.tz):%d/%m/%Y}",
        "indice": indice,
        "indice_anterior": indice_anterior,
        "variacion_texto": variacion_texto(indice, indice_anterior),
        "construccion": construccion,
        "construccion_original": construccion_original,
        "construccion_incorporado": construccion_incorporado,
        "n_original": sum(1 for m in modulos if m.alcance == "Original"),
        "n_incorporado": sum(1 for m in modulos if m.alcance == "Incorporado"),
        "construccion_anterior": construccion_anterior,
        "variacion_construccion": None if construccion is None else variacion_texto(construccion, construccion_anterior),
        "semaforo": madurez.semaforo(indice),
        "modulos": [{"nombre": m.nombre, "porcentaje": m.porcentaje, "criterios": m.criterios,
                     "evidencia": m.nota, "construido": m.construido, "alcance": m.alcance,
                     "cambio_construido": (m.construido - previos_c[m.nombre])
                     if m.construido is not None and previos_c.get(m.nombre) is not None else None,
                     "cambio": (m.porcentaje - previos[m.nombre]) if m.nombre in previos else None}
                    for m in modulos],
        "prs_fusionados": [{"numero": p.numero, "titulo": p.titulo, "fecha": f"{p.fusionado:%d/%m}",
                            "cuerpo": p.cuerpo} for p in principal.prs_fusionados],
        "prs_abiertos": len(principal.prs_abiertos),
        "aldahir": {
            "dias": dias,
            "dias_con_respaldo": len(fechas_con_push),
            "reportes": sum(1 for x in dias if x["reporte"]),
            "commits": len(junior.commits),
            "prs_creados": len(junior.prs_creados_semana),
            "prs_fusionados": len(junior.prs_fusionados),
        },
        "fuentes_faltantes": faltantes,
    }

    # Lo que recibe el modelo: solo datos verificables ya calculados y textos fuente.
    d["para_redaccion"] = {
        "semana": semanas.rango_texto(lunes),
        "siguiente_semana": semanas.rango_texto(lunes + timedelta(days=7)),
        "avance": {
            "explicacion": "Avance de construcción = parte del alcance planeado ya construida (lo reporta Germán por módulo). "
                           "Madurez verificable = parte comprobada con pruebas, integración y aceptación formal. "
                           "La diferencia entre ambos es el trabajo de consolidación pendiente.",
            "construccion_global": construccion, "variacion_construccion": d["variacion_construccion"],
            "construccion_alcance_original": construccion_original,
            "construccion_modulos_incorporados": construccion_incorporado,
            "madurez_global": indice, "variacion_madurez": d["variacion_texto"], "semaforo_general": d["semaforo"],
            "modulos": [{"nombre": m["nombre"], "alcance": m["alcance"], "construido": m["construido"], "madurez": m["porcentaje"],
                         "cambio_madurez": m["cambio"], "cambio_construido": m["cambio_construido"],
                         "evidencia": m["evidencia"]} for m in d["modulos"]]},
        "commits_principal": [{"fecha": f"{c.fecha:%d/%m}", "mensaje": c.mensaje.splitlines()[0]}
                              for c in principal.commits][:80],
        "prs_fusionados_principal": [{k: p[k] for k in ("numero", "titulo", "fecha", "cuerpo")} for p in d["prs_fusionados"]],
        "prs_abiertos_principal": [{"numero": p.numero, "titulo": p.titulo, "desde": f"{p.creado:%d/%m/%Y}"}
                                   for p in principal.prs_abiertos][:30],
        "registros_de_decision_de_la_semana": {k: v[:12000] for k, v in principal.archivos.items()
                                               if k.startswith("docs/decisiones/")},
        "notas_de_german": notas,
        "aldahir": {
            "plan_semanal": junior.archivos.get(f"planes/{lunes.isoformat()}.md", ""),
            "dias": [{"dia": informe_pdf.DIAS[i], "fecha": x["fecha"], "plan": x["plan"], "commits": x["commits"],
                      "mensajes_commit": x["mensajes_commit"], "reporte_diario": x["reporte_texto"][:12000]}
                     for i, x in enumerate(dias)],
            "indicadores": {k: d["aldahir"][k] for k in ("dias_con_respaldo", "reportes", "commits",
                                                         "prs_creados", "prs_fusionados")},
            "prs_semana": [{"numero": p.numero, "titulo": p.titulo, "estado": p.estado}
                           for p in junior.prs_creados_semana],
        },
        "semana_anterior": (anterior or {}).get("resumen") or _contexto_inicial(),
        "fuentes_no_disponibles": faltantes,
        "glosario_base": [t for t, _, _ in informe_pdf.GLOSARIO_BASE],
    }
    return d


def _contexto_inicial() -> dict:
    try:
        return json.loads(CONTEXTO_INICIAL.read_text("utf-8"))
    except FileNotFoundError:
        return {}


def prs_validos(d: dict) -> set[int]:
    return {p["numero"] for p in d["prs_fusionados"]}


def resumen_para_siguiente(d: dict) -> dict:
    """Lo que se guarda para dar continuidad al informe de la semana siguiente."""
    r = d["redaccion"]
    return {"indice": d["indice"], "construccion": d.get("construccion"),
            "modulos": [{"nombre": m["nombre"], "porcentaje": m["porcentaje"], "construido": m.get("construido")}
                        for m in d["modulos"]],
            "resumen": {"semana": semanas.rango_texto(d["lunes"]), "lectura": r["lectura"],
                        "bloqueos": r["bloqueos"], "plan_siguiente": r["plan_siguiente"],
                        "decisiones_solicitadas": r["decisiones_solicitadas"]}}


def serializable(d: dict) -> dict:
    x = dict(d)
    x["lunes"] = d["lunes"].isoformat()
    return x


def desde_json(x: dict) -> dict:
    d = dict(x)
    d["lunes"] = date.fromisoformat(x["lunes"])
    return d


def datos_correo(d: dict) -> dict:
    r = d["redaccion"]
    return {"lunes": d["lunes"], "indice": d["indice"], "indice_anterior": d["indice_anterior"],
            "construccion": d.get("construccion"), "construccion_anterior": d.get("construccion_anterior"),
            "construccion_original": d.get("construccion_original"),
            "construccion_incorporado": d.get("construccion_incorporado"),
            "semaforo": d["semaforo"], "lectura": r["lectura"], "destacados": r["destacados"],
            "frentes": r["frentes"], "decisiones": r["decisiones_solicitadas"],
            "archivo": nombre_archivo(d["lunes"])}


def armar_pdf(d: dict, data_dir: Path) -> Path:
    return informe_pdf.generar(d, data_dir / "informes" / nombre_archivo(d["lunes"]))

