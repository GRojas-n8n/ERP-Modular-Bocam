"""Cálculo de la semana reportada y sus nombres."""
from datetime import date, datetime, timedelta

MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
MES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]


def semana_reportada(ahora: datetime) -> date:
    """Lunes de la semana que se reporta.

    Viernes, sábado y domingo: la semana en curso.
    Lunes a jueves: la semana anterior (la que se envía el lunes).
    """
    hoy = ahora.date()
    lunes_actual = hoy - timedelta(days=hoy.weekday())
    return lunes_actual if hoy.weekday() >= 4 else lunes_actual - timedelta(days=7)


def viernes(lunes: date) -> date:
    return lunes + timedelta(days=4)


def nombre_hoja(lunes: date) -> str:
    v = viernes(lunes)
    if lunes.month == v.month:
        return f"SEM {lunes.day} al {v.day}{MES_CORTO[v.month - 1]}"
    return f"SEM {lunes.day}{MES_CORTO[lunes.month - 1]} al {v.day}{MES_CORTO[v.month - 1]}"


def nombre_archivo(lunes: date) -> str:
    return f"{viernes(lunes):%Y%m%d} NOMINA IRETUM.xlsx"


def rango_texto(lunes: date) -> str:
    v = viernes(lunes)
    if lunes.month == v.month:
        return f"{lunes.day} al {v.day} de {MESES[v.month - 1]} de {v.year}"
    if lunes.year == v.year:
        return f"{lunes.day} de {MESES[lunes.month - 1]} al {v.day} de {MESES[v.month - 1]} de {v.year}"
    return (f"{lunes.day} de {MESES[lunes.month - 1]} de {lunes.year} "
            f"al {v.day} de {MESES[v.month - 1]} de {v.year}")
