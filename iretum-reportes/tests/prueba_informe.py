"""Prueba de extremo a extremo del informe con GitHub y la API de Claude simulados.

Uso: python -m tests.prueba_informe  (genera el PDF en $DATA_DIR/informes)
"""
import asyncio
import json
from datetime import date, datetime, timedelta
from pathlib import Path
from types import SimpleNamespace as NS

from app import config, correo, informe, main, redaccion
from app.github import GitHub
from tests.simulacion_github import pr, transporte

BASE = Path(__file__).resolve().parent.parent
REP = BASE / "para_repositorios"
J = "junior/aldahir-01-disponibilidad"

def reporte(dia, hecho, prob):
    return f"# Reporte diario · {dia} · Aldahir Molina Medina\nTarea: JR-01\n\n## Hecho hoy\n{hecho}\n\n## Problemas y bloqueos\n{prob}\n"

def _con_construido(md):
    """Valores de prueba para la columna Construido (promedio 80)."""
    import re
    vals = iter([100, 100, 95, 100, 90, 80, 80, 75, 70, 85, 85, 55, 70, 50, 65])
    return re.sub(r"^(\| (?!Módulo|---)[^|]+? \|)  \|", lambda m: f"{m.group(1)} {next(vals)} |", md, flags=re.M)


REPOS = {
    "GRojas-n8n/ERP-Modular-Bocam": {
        "default": "main", "branches": ["main"],
        "commits": {"main": [
            ("a1b2c3d", "2026-10-27T18:10:00Z", "GRojas-n8n", "docs: ADR-002 módulo de Asistencia y Prenómina"),
            ("b2c3d4e", "2026-10-27T19:00:00Z", "GRojas-n8n", "docs: MADUREZ.md con línea base del índice"),
            ("c3d4e5f", "2026-10-29T17:30:00Z", "GRojas-n8n", "Merge pull request #190 from GRojas-n8n/test/idempotencia-consumidores"),
        ]},
        "pulls": [pr(190, "test: idempotencia de consumidores del bus de eventos", "GRojas-n8n", "closed",
                     "2026-10-01T10:00:00Z", "2026-10-29T17:30:00Z", cuerpo="Pruebas que garantizan que un evento repetido no se procese dos veces.")]
                 + [pr(n, f"PR abierto {n}", "GRojas-n8n", "open", "2026-09-20T10:00:00Z") for n in (102, 103, 104, 105, 113, 114, 115, 182, 191)],
        "files": {("MADUREZ.md", "main"): _con_construido((REP / "ERP-Modular-Bocam/MADUREZ.md").read_text()),
                  ("docs/decisiones/ADR-002-modulo-asistencia-prenomina.md", "main"):
                      (REP / "ERP-Modular-Bocam/docs/decisiones/ADR-002-modulo-asistencia-prenomina.md").read_text()},
        "dirs": {("docs/decisiones", "main"): ["ADR-001-vps-hostinger-y-docker.md", "ADR-002-modulo-asistencia-prenomina.md"]},
        "path_commits": {"docs/decisiones/ADR-002-modulo-asistencia-prenomina.md": True},
    },
    "GRojas-n8n/iretum-jr-dev": {
        "default": "main", "branches": ["main", J],
        "commits": {"main": [], J: [
            ("d1", "2026-10-27T15:20:00Z", "aldahir-mm", "JR-01: línea base hasta el 26 de octubre"),
            ("d2", "2026-10-28T00:05:00Z", "aldahir-mm", "JR-01: correcciones de interfaz filas 5, 6, 8, 10 a 13"),
            ("d3", "2026-10-28T23:55:00Z", "aldahir-mm", "JR-01: pruebas y corrección de la fila 35"),
            ("d4", "2026-10-29T23:50:00Z", "aldahir-mm", "JR-02: estados de carga y vacío en Mi Equipo"),
            ("d5", "2026-10-30T23:58:00Z", "aldahir-mm", "JR-02: estado de error y pruebas"),
        ]},
        "pulls": [pr(1, "JR-01: funciones no disponibles en Residente y Compras", "aldahir-mm", "open", "2026-10-28T23:59:00Z", rama=J)],
        "files": {("planes/2026-10-26.md", "main"): (REP / "iretum-jr-dev/planes/2026-10-26.md").read_text(),
                  **{(f"reports/2026-10-{d}.md", J): reporte(f"2026-10-{d}", h, b) for d, h, b in [
                      ("26", "- Diagnóstico JR-01: 35 acciones, 28 hallazgos clasificados", "- ENVIADA contra PENDIENTE bloquea filas 10, 11, 12 y 25"),
                      ("27", "- 13 correcciones de interfaz implementadas\n- Fila 35: el servicio real usa ENVIADA; se corrigió la condición de la pantalla", "- Ninguno"),
                      ("28", "- Pruebas 41 de 41, build sin errores\n- PR #1 abierto", "- Ninguno"),
                      ("29", "- JR-02: estados de carga y vacío en Mi Equipo", "- Falta definir el texto del estado vacío"),
                  ]}},
        "dirs": {("reports", J): ["2026-10-26.md", "2026-10-27.md", "2026-10-28.md", "2026-10-29.md", "PLANTILLA.md"],
                 ("reports", "main"): []},
    },
}

REDACCION = {
 "lectura": "Semana de consolidación con avance verificable en los dos frentes. Se formalizó el diseño del módulo de Asistencia y Prenómina y Aldahir cerró JR-01 con respaldo diario y su primera solicitud de revisión.",
 "destacados": ["Se aprobó el diseño del nuevo módulo de Asistencia y Prenómina (registro de decisión ADR-002); el desarrollo inicia el 2 de noviembre.",
                "Aldahir cerró JR-01: 13 correcciones de interfaz, pruebas 41 de 41 y su primera solicitud de revisión (Pull Request #1).",
                "Riesgo: 9 solicitudes de cambio siguen abiertas en el repositorio principal y retrasan mejoras ya terminadas."],
 "frentes": [{"nombre": "Sistema publicado", "estado": "Verde", "motivo": "Se integró el PR #190 sin incidencias."},
             {"nombre": "Diseño del módulo de Asistencia y Prenómina", "estado": "Verde", "motivo": "Decisión de arquitectura registrada y etapas definidas."},
             {"nombre": "Desarrollo junior (JR-01 y JR-02)", "estado": "Amarillo", "motivo": "JR-01 en revisión; JR-02 sin solicitud de revisión al cierre."},
             {"nombre": "Revisión de cambios pendientes", "estado": "Rojo", "motivo": "9 solicitudes de cambio abiertas desde septiembre."}],
 "decisiones_solicitadas": ["Confirmar que la asistencia actual de Residencia se reemplaza por el nuevo módulo y no se corrige.",
                            "Designar al residente de obra que validará la primera versión de la toma de lista en tablet."],
 "arquitectura_cambios": "Se agrega un servicio nuevo, Asistencia y Prenómina, con su propia base de datos. Se comunicará con Finanzas mediante un evento (aviso automático) cuando el residente autorice la prenómina.",
 "decisiones_tecnicas": [{"decision": "Asistencia y Prenómina como servicio propio", "proposito": "Aislar los datos biométricos y soportar 500 registros a las 8:00", "a_favor": "Reglas propias de privacidad; integración por eventos ya probada", "en_contra": "Un servicio más que desplegar y vigilar"},
                         {"decision": "Medir el avance con MADUREZ.md en el repositorio", "proposito": "Que el porcentaje semanal sea verificable", "a_favor": "Cada cambio de criterio exige evidencia", "en_contra": "Requiere actualizarlo al cerrar cada sesión"}],
 "iniciativas": [{"nombre": "Módulo de Asistencia y Prenómina", "objetivo": "Que el residente tome lista desde la tablet y la prenómina semanal llegue autorizada a Finanzas.",
                  "estado": "Diseño aprobado; desarrollo a partir del 2 de noviembre.",
                  "funcionamiento": ["Registro por QR o reconocimiento facial, según el proyecto.", "Funciona sin señal y sincroniza al recuperarla.", "Cierre diario y autorización semanal del residente.", "Finanzas recibe la prenómina ya autorizada."],
                  "etapas": [{"periodo": "2 al 6 de noviembre", "alcance": "Modelo de datos, servicio base y registro por QR", "responsable": "Aldahir, con revisión de Germán"},
                             {"periodo": "9 al 13 de noviembre", "alcance": "Modo sin conexión, geocercas y tablets", "responsable": "Aldahir, con guía de Germán"},
                             {"periodo": "16 al 20 de noviembre", "alcance": "Cierres, incidencias y prenómina básica", "responsable": "Aldahir y Germán"}]}],
 "publicaciones": [{"numero": 190, "descripcion": "Garantiza que un aviso repetido entre módulos no se registre dos veces."}, {"numero": 999, "descripcion": "inventado"}],
 "aldahir_realizado": ["Diagnóstico completo de JR-01: 35 acciones y 28 hallazgos clasificados.", "13 correcciones de interfaz y corrección de la fila 35.", "Pruebas 41 de 41 y Pull Request #1.", "Estados de carga y vacío en «Mi Equipo».", ""],
 "aldahir_hallazgos": [{"tema": "Solicitud de cotización", "hallazgo": "La pantalla esperaba el estado PENDIENTE y el servicio real usa ENVIADA; los usuarios reales no podían registrar respuestas.", "estado": "Corregido, en revisión"},
                       {"tema": "Mensajes de error", "hallazgo": "Varios avisos leían el campo equivocado y mostraban texto genérico.", "estado": "Corregido, en revisión"}],
 "aldahir_observaciones": "Cumplió el respaldo diario desde el martes. El hallazgo de la fila 35 resultó ser un error real del producto, lo que confirma el valor de la revisión funcional.",
 "bloqueos": [{"bloqueo": "9 solicitudes de cambio abiertas", "impacto": "Mejoras terminadas que no llegan a los usuarios", "responsable": "Germán"}],
 "plan_siguiente": [{"accion": "Revisar e integrar el PR #1 de JR-01", "responsable": "Germán"}, {"accion": "Iniciar el módulo de Asistencia: modelo de datos y registro por QR", "responsable": "Aldahir"}],
 "conclusion": ["La semana dejó definido el siguiente módulo de mayor impacto para la obra y un proceso de entrega del desarrollo junior ya verificable.", "La prioridad inmediata es reducir las solicitudes de cambio abiertas antes de sumar trabajo nuevo."],
 "glosario_extra": [{"termino": "Geocerca", "definicion": "Zona en el mapa donde se permite registrar asistencia.", "analogia": "El perímetro de la obra marcado en el plano."},
                    {"termino": "Commit", "definicion": "dup", "analogia": "dup"}],
}

async def correr():
    cfg = config.cargar()
    tr = transporte(REPOS)
    informe.GitHub = lambda token, tz: GitHub(token, tz, tr)
    llamadas = []
    async def falso_llamar(api_key, modelo, mensajes, max_tokens=16000):
        llamadas.append(json.loads(mensajes[0]["content"].split("(JSON):\n", 1)[1].split("\n\nVERSIÓN")[0]))
        return json.loads(json.dumps(REDACCION))
    redaccion._llamar = falso_llamar
    enviados = []
    async def falso_correo(*a, **k): enviados.append((a, k)); return "id"
    correo.enviar = falso_correo
    msgs = []
    class Bot:
        async def send_message(self, chat, text, **k): msgs.append(text)
        async def send_document(self, chat, document, filename, caption, reply_markup):
            msgs.append(caption); msgs.append([b.callback_data for b in reply_markup.inline_keyboard[0]])
    svc = main.Servicio(cfg)
    svc.ahora = lambda: datetime(2026, 11, 2, 7, 0, tzinfo=cfg.tz)
    svc.estado.actualizar(date(2026, 10, 26), notas=[{"fecha": "29/10 18:00", "texto": "Gerencia autorizó las correcciones de interfaz de JR-01"}])
    await svc.generar_informe(Bot(), date(2026, 10, 26))
    inf = svc.estado.semana(date(2026, 10, 26))["informe"]
    d = informe.desde_json(inf["datos"])
    print("\n".join(str(m) for m in msgs))
    print("PDF:", inf["pdf"])
    print("publicaciones validadas:", d["redaccion"]["publicaciones"])
    print("aldahir:", d["aldahir"]["dias_con_respaldo"], d["aldahir"]["reportes"], [x["commits"] for x in d["aldahir"]["dias"]])
    datos_llm = llamadas[0]
    print("claves al modelo:", list(datos_llm), "| notas:", datos_llm["notas_de_german"], "| semana_anterior:", datos_llm["semana_anterior"].get("semana"))
    await svc.enviar_informe(Bot(), date(2026, 10, 26), prueba=True)
    await svc.enviar_informe(Bot(), date(2026, 10, 26))
    print(msgs[-2:], enviados[-1][0][2], enviados[-1][0][3])
    print("estado:", svc.estado.semana(date(2026, 10, 26))["informe"]["estado"],
          "| continuidad semana sig.:", svc.informe_anterior(date(2026, 11, 2))["indice"])

asyncio.run(correr())
