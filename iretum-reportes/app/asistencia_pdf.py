"""Lectura del «Reporte de Asistencias» (PDF) del checador de la oficina.

Columnas usadas: Fecha, Entrada, Salida y Cód. Asist. Las horas se miden solo dentro
del turno (llegar antes no suma, salir después no suma) y se convierten a 1, 0.5 o 0,
los únicos valores que acepta el formato oficial de nómina.
"""
import io
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta

import pdfplumber

RE_FILA = re.compile(r"^(\d{2})/(\d{2})/(\d{4})\s+(.*)$")
RE_CAMPO = re.compile(r"-:-|\d{1,2}:\d{2}\s*[ap]\.?\s*m\.?", re.I)
RE_HORA = re.compile(r"(\d{1,2}):(\d{2})\s*([ap])", re.I)


@dataclass
class Dia:
    fecha: date
    entrada: time | None
    salida: time | None
    codigo: str
    horas: float | None = None
    valor: float = 0.0
    notas: list[str] = field(default_factory=list)   # para tu revisión en Telegram
    incidencia: str | None = None                    # leyenda para el correo de nómina


@dataclass
class Reporte:
    nombre: str
    dias: dict[date, Dia]


def _hora(txt: str) -> time | None:
    m = RE_HORA.search(txt)
    if not m:
        return None
    h, mi, ap = int(m.group(1)), int(m.group(2)), m.group(3).lower()
    if ap == "p" and h != 12:
        h += 12
    if ap == "a" and h == 12:
        h = 0
    return time(h, mi)


def _normalizar(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return " ".join(s.upper().split())


def leer(pdf: bytes) -> Reporte:
    with pdfplumber.open(io.BytesIO(pdf)) as doc:
        texto = "\n".join((p.extract_text() or "") for p in doc.pages)
    lineas = [l.strip() for l in texto.splitlines() if l.strip()]
    if not any("REPORTE DE ASISTENCIAS" in _normalizar(l) for l in lineas):
        raise ValueError("El PDF no parece un «Reporte de Asistencias» del checador.")
    nombre = re.sub(r"\s+\d{1,2} de \w+ de \d{4}$", "", lineas[0]).strip()
    dias: dict[date, Dia] = {}
    for l in lineas:
        m = RE_FILA.match(l)
        if not m:
            continue
        fecha = date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
        resto = m.group(4)
        campos = RE_CAMPO.findall(resto)[:4]
        if len(campos) < 4:
            continue
        # Tras los 4 campos de hora quedan Cód. Rec. y Cód. Asist.
        cola = resto
        for c in campos:
            cola = cola[cola.find(c) + len(c):]
        codigos = cola.split()
        entrada, salida = _hora(campos[0]), _hora(campos[3])
        dias[fecha] = Dia(fecha, entrada, salida, codigos[-1] if codigos else "")
    if not dias:
        raise ValueError("No encontré filas de asistencia en el PDF.")
    return Reporte(nombre, dias)


def evaluar(rep: Reporte, lunes: date, inicio: time, fin: time, tolerancia_min: int,
            retardo_max_min: int = 60) -> list[Dia]:
    """Calcula horas y valor (1, 0.5 o 0) de lunes a viernes de la semana indicada.

    Retardo: entrada después de la tolerancia y hasta `retardo_max_min` minutos. El día
    cuenta 1 y se marca como retardo con la hora de entrada. Una entrada posterior se
    trata como jornada parcial y se valora por las horas reales.
    """
    jornada = (datetime.combine(lunes, fin) - datetime.combine(lunes, inicio)).seconds / 3600
    salida_dia = []
    for i in range(5):
        f = lunes + timedelta(days=i)
        d = rep.dias.get(f) or Dia(f, None, None, "")
        if f not in rep.dias:
            d.notas.append("el reporte no incluye este día")
        if d.entrada is None:
            d.horas, d.valor = 0.0, 0.0
            motivo = "sin registro de entrada" + (f", código {d.codigo}" if d.codigo not in ("", "-:-") else "")
            d.notas.append(motivo)
            d.incidencia = motivo
            salida_dia.append(d)
            continue

        ini, fi = datetime.combine(f, inicio), datetime.combine(f, fin)
        e = datetime.combine(f, d.entrada)
        retardo = (e - ini).total_seconds() / 60
        es_retardo = tolerancia_min < retardo <= retardo_max_min
        entrada_tardia = retardo > retardo_max_min
        sin_salida = d.salida is None or d.salida == d.entrada  # el checador repite la entrada

        if sin_salida:
            d.horas = None
            if entrada_tardia:
                d.horas = round(max((fi - e).total_seconds(), 0) / 3600, 2)
                d.valor = 0.5 if d.horas >= jornada / 2 else 0.0
                d.notas.append(f"sin checada de salida; entrada {d.entrada:%H:%M}, {retardo:.0f} min tarde")
                d.incidencia = f"entrada a las {d.entrada:%H:%M}, sin checada de salida"
            else:
                d.valor = 1.0
                d.notas.append(f"sin checada de salida; entrada {d.entrada:%H:%M}")
        else:
            s_ = datetime.combine(f, d.salida)
            if s_ < e:
                s_ += timedelta(days=1)
            desde = ini if (retardo <= retardo_max_min) else e   # un retardo no descuenta tiempo
            dentro = max((min(s_, fi) - max(desde, ini)).total_seconds(), 0) / 3600
            if dentro == 0:
                dentro = (s_ - e).total_seconds() / 3600
                d.notas.append(f"horario fuera de turno ({d.entrada:%H:%M} a {d.salida:%H:%M}), revisar")
            d.horas = round(min(dentro, jornada), 2)
            faltante_min = (jornada - d.horas) * 60
            d.valor = 1.0 if faltante_min <= tolerancia_min else (0.5 if d.horas >= jornada / 2 else 0.0)
            if d.valor < 1:
                d.notas.append(f"{d.horas:g} de {jornada:g} h ({d.entrada:%H:%M} a {d.salida:%H:%M})")
                d.incidencia = f"{d.horas:g} de {jornada:g} horas, de {d.entrada:%H:%M} a {d.salida:%H:%M}"

        if es_retardo:
            d.notas.append(f"retardo: entrada {d.entrada:%H:%M} ({retardo:.0f} min), cuenta {d.valor:g}")
            leyenda = f"retardo, entrada a las {d.entrada:%H:%M}"
            d.incidencia = leyenda if d.incidencia is None else f"{leyenda}; {d.incidencia}"
        salida_dia.append(d)
    return salida_dia


def nombre_coincide(rep: Reporte, esperado: str) -> bool:
    return set(_normalizar(esperado).split()) <= set(_normalizar(rep.nombre).split())
