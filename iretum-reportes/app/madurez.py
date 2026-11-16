"""Índice de madurez verificable por módulo, leído de MADUREZ.md.

Cada módulo se califica con 5 criterios de 20 puntos: C1 código construido y funcionando,
C2 datos y permisos bien estructurados, C3 pruebas automáticas propias, C4 integración
probada con otros módulos y C5 aceptación formal del negocio. Cada criterio vale
✓ (completo), ½ (parcial) o vacío.
"""
import re
from dataclasses import dataclass

VALOR = {"✓": 1.0, "✔": 1.0, "x": 1.0, "1": 1.0, "si": 1.0, "sí": 1.0,
         "½": 0.5, "1/2": 0.5, "0.5": 0.5, "p": 0.5, "parcial": 0.5}
CRITERIOS = ["Código funcionando", "Datos y permisos", "Pruebas propias", "Integración probada",
             "Aceptación formal"]


@dataclass
class Modulo:
    nombre: str
    criterios: list[float]
    nota: str
    construido: int | None = None  # % del alcance planeado ya construido (lo define Germán)
    alcance: str = "Original"      # Original | Incorporado

    @property
    def porcentaje(self) -> int:
        return round(sum(self.criterios) * 20)


def _num(txt: str) -> int | None:
    m = re.search(r"\d{1,3}", txt or "")
    return min(int(m.group()), 100) if m else None


def leer(md: str) -> list[Modulo]:
    """Lee la tabla por nombre de columna: Módulo, Construido, C1 a C5 y Evidencia."""
    modulos, cols = [], None
    for linea in md.splitlines():
        linea = linea.strip()
        if not linea.startswith("|"):
            continue
        celdas = [c.strip() for c in linea.strip("|").split("|")]
        if cols is None:
            claves = [c.lower().strip("*% ") for c in celdas]
            if claves and claves[0] in ("módulo", "modulo"):
                cols = {k: n for n, k in enumerate(claves)}
            continue
        if set("".join(celdas)) <= set("-: "):
            continue
        celda = lambda k: celdas[cols[k]] if k in cols and cols[k] < len(celdas) else ""
        crit = [VALOR.get(celda(f"c{n}").lower(), 0.0) for n in range(1, 6)]
        construido = _num(celda("construido")) if "construido" in cols else None
        alcance = "Incorporado" if celda("alcance").lower().startswith("inc") else "Original"
        modulos.append(Modulo(celdas[0].strip("*"), crit, celda("evidencia"), construido, alcance))
    if not modulos:
        raise ValueError("MADUREZ.md no tiene la tabla de módulos")
    return modulos


def construccion_global(modulos: list[Modulo], alcance: str | None = None) -> int | None:
    modulos = [m for m in modulos if alcance is None or m.alcance == alcance]
    if not modulos:
        return None
    valores = [m.construido for m in modulos if m.construido is not None]
    if len(valores) != len(modulos):
        return None
    return round(sum(valores) / len(valores))


def indice_global(modulos: list[Modulo]) -> int:
    return round(sum(m.porcentaje for m in modulos) / len(modulos))


def semaforo(indice: int) -> str:
    return "Verde" if indice >= 70 else ("Amarillo" if indice >= 40 else "Rojo")
