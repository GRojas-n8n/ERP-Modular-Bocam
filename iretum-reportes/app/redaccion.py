"""Redacción del informe con la API de Claude (salida JSON validada por esquema).

El código calcula todas las cifras; el modelo solo redacta texto a partir de los datos
que recibe y no puede agregar números propios.
"""
import json
import logging
import re

import httpx

log = logging.getLogger("iretum.redaccion")
URL = "https://api.anthropic.com/v1/messages"

_s = {"type": "string"}


def _obj(props: dict) -> dict:
    return {"type": "object", "properties": props, "required": list(props), "additionalProperties": False}


def _arr(item: dict) -> dict:
    return {"type": "array", "items": item}


ESQUEMA = _obj({
    "lectura": {**_s, "description": "Dos o tres oraciones que interpretan la semana para Gerencia Técnica."},
    "destacados": _arr({**_s, "description": "Máximo 3 puntos: avances, hallazgos y el principal riesgo."}),
    "frentes": _arr(_obj({"nombre": _s, "estado": {"type": "string", "enum": ["Verde", "Amarillo", "Rojo"]},
                          "motivo": {**_s, "description": "Una línea."}})),
    "decisiones_solicitadas": _arr({**_s, "description": "Solo decisiones de negocio que debe tomar Gerencia Técnica."}),
    "arquitectura_cambios": {**_s, "description": "Qué cambió en la arquitectura esta semana, en lenguaje claro. Vacío si nada."},
    "decisiones_tecnicas": _arr(_obj({"decision": _s, "proposito": _s, "a_favor": _s, "en_contra": _s})),
    "iniciativas": _arr(_obj({
        "nombre": _s, "objetivo": _s, "estado": _s,
        "funcionamiento": _arr(_s),
        "etapas": _arr(_obj({"periodo": _s, "alcance": _s, "responsable": _s})),
    })),
    "publicaciones": _arr(_obj({"numero": {"type": "integer"}, "descripcion": _s})),
    "aldahir_realizado": {**_arr(_s), "description": "Exactamente 5 elementos, lunes a viernes. Vacío si no hay reporte."},
    "aldahir_hallazgos": _arr(_obj({"tema": _s, "hallazgo": _s, "estado": _s})),
    "aldahir_observaciones": {**_s, "description": "Observaciones de supervisión de Germán, redactadas formalmente."},
    "bloqueos": _arr(_obj({"bloqueo": _s, "impacto": _s, "responsable": _s})),
    "plan_siguiente": _arr(_obj({"accion": _s, "responsable": _s})),
    "conclusion": _arr({**_s, "description": "Dos o tres párrafos cortos."}),
    "glosario_extra": _arr(_obj({"termino": _s, "definicion": _s, "analogia": _s})),
})

SISTEMA = """Eres el redactor del informe semanal de avance del ERP Iretum que Germán Rojas Galeana, Lead Software Architect, envía a Gerencia Técnica de Constructora e Inmobiliaria BOCAM. El lector es un ingeniero de construcción que no programa.

REGLAS
1. Español de México, formal, claro y directo. Oraciones de menos de 25 palabras.
2. Usa los términos técnicos (frontend, backend, base de datos, Pull Request, commit, etc.), pero explica cada uno entre paréntesis la primera vez que aparece en todo el informe, con palabras de obra cuando ayude.
3. NO inventes datos. Cada cifra, fecha, nombre, número de PR o hecho que escribas debe estar en DATOS. Si un dato no está, no lo menciones. No calcules porcentajes: los que existen ya vienen en DATOS.
4. Si una fuente viene vacía (sin commits, sin reporte diario, sin PR), dilo de forma objetiva; no lo compenses con suposiciones.
5. Nunca uses guiones largos (— ni –). Usa comas, dos puntos o punto y seguido.
6. Parte I describe el liderazgo técnico de Germán: arquitectura, decisiones, iniciativas y publicaciones. Parte II describe el trabajo de Aldahir Molina Medina, Junior Software Developer, bajo supervisión de Germán.
7. «decisiones_solicitadas» contiene solo decisiones que requieren a Gerencia Técnica (reglas de negocio, prioridades, aprobaciones). Las decisiones técnicas son de Germán y van en «decisiones_tecnicas».
8. «frentes»: de 3 a 5 frentes de trabajo de la semana con semáforo justificado en los datos.
9. «aldahir_realizado»: exactamente 5 textos (lunes a viernes), uno por día, resumiendo en una línea el reporte diario de ese día; cadena vacía si no hay reporte de ese día.
10. «publicaciones»: solo números de PR que aparezcan en DATOS.prs_fusionados_principal, cada uno explicado en una línea para un no programador.
11. «iniciativas»: módulos o proyectos nuevos en diseño (por ejemplo, el módulo de Asistencia y Prenómina), tomados de los registros de decisión y de las notas de Germán.
12. «glosario_extra»: solo términos técnicos que usaste y que no están en DATOS.glosario_base.
13. El avance tiene dos indicadores que siempre van juntos: «avance de construcción» (lo construido del alcance planeado) y «madurez verificable» (lo comprobado). Nunca presentes la madurez como el avance general ni como un retroceso respecto a la construcción; explica la diferencia como el trabajo de consolidación pendiente.
14. Si DATOS.semana_anterior incluye «aclaracion_avance», intégrala en «lectura» con el porcentaje actual de construcción.
15. Responde únicamente con el JSON del esquema."""


def _limpiar(v):
    if isinstance(v, str):
        v = v.replace(" — ", ", ").replace(" – ", ", ").replace("—", ", ").replace("–", "-")
        return re.sub(r"\s+,", ",", v).strip()
    if isinstance(v, list):
        return [_limpiar(x) for x in v]
    if isinstance(v, dict):
        return {k: _limpiar(x) for k, x in v.items()}
    return v


def validar(r: dict, prs_validos: set[int]) -> dict:
    r = _limpiar(r)
    r["destacados"] = r["destacados"][:3]
    for f in r["frentes"]:
        f["estado"] = f["estado"].capitalize()
        if f["estado"] not in ("Verde", "Amarillo", "Rojo"):
            f["estado"] = "Amarillo"
    r["frentes"] = r["frentes"][:5]
    r["publicaciones"] = [p for p in r["publicaciones"] if p["numero"] in prs_validos]
    dias = (r["aldahir_realizado"] + [""] * 5)[:5]
    r["aldahir_realizado"] = dias
    return r


async def _llamar(api_key: str, modelo: str, mensajes: list[dict], max_tokens: int = 16000) -> dict:
    cuerpo = {
        "model": modelo,
        "max_tokens": max_tokens,
        "system": SISTEMA,
        "messages": mensajes,
        "output_config": {"format": {"type": "json_schema", "schema": ESQUEMA}},
    }
    async with httpx.AsyncClient(timeout=httpx.Timeout(600, connect=30)) as c:
        r = await c.post(URL, json=cuerpo, headers={"x-api-key": api_key, "anthropic-version": "2023-06-01"})
    if r.status_code >= 300:
        raise RuntimeError(f"API de Claude respondió {r.status_code}: {r.text[:500]}")
    data = r.json()
    if data.get("stop_reason") in ("max_tokens", "refusal"):
        raise RuntimeError(f"La redacción se detuvo ({data['stop_reason']}). Intenta de nuevo.")
    texto = "".join(b.get("text", "") for b in data["content"] if b.get("type") == "text")
    uso = data.get("usage", {})
    log.info("Claude: %s tokens de entrada, %s de salida", uso.get("input_tokens"), uso.get("output_tokens"))
    return json.loads(texto)


async def redactar(api_key: str, modelo: str, datos: dict, prs_validos: set[int]) -> dict:
    contenido = "DATOS DE LA SEMANA (JSON):\n" + json.dumps(datos, ensure_ascii=False, indent=1)
    r = await _llamar(api_key, modelo, [{"role": "user", "content": contenido}])
    return validar(r, prs_validos)


async def corregir(api_key: str, modelo: str, datos: dict, actual: dict, instruccion: str,
                   prs_validos: set[int]) -> dict:
    contenido = (
        "DATOS DE LA SEMANA (JSON):\n" + json.dumps(datos, ensure_ascii=False, indent=1)
        + "\n\nVERSIÓN ACTUAL DEL INFORME (JSON):\n" + json.dumps(actual, ensure_ascii=False, indent=1)
        + "\n\nCORRECCIÓN QUE PIDE GERMÁN:\n" + instruccion
        + "\n\nAplica solo esa corrección. Todo lo demás queda igual, palabra por palabra. "
          "Devuelve el informe completo en el mismo esquema.")
    r = await _llamar(api_key, modelo, [{"role": "user", "content": contenido}])
    return validar(r, prs_validos)
