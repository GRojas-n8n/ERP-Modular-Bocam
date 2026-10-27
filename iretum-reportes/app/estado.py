"""Estado persistente por semana (JSON en el volumen /data)."""
import json
import os
import tempfile
from datetime import date
from pathlib import Path

# Estados: pendiente -> preparado -> aprobado -> enviado | cancelado


class Estado:
    def __init__(self, data_dir: Path):
        self.ruta = data_dir / "estado.json"
        data_dir.mkdir(parents=True, exist_ok=True)
        self._datos: dict = json.loads(self.ruta.read_text("utf-8")) if self.ruta.exists() else {}

    def semana(self, lunes: date) -> dict:
        return self._datos.setdefault(lunes.isoformat(), {"estado": "pendiente"})

    def actualizar(self, lunes: date, **campos) -> dict:
        s = self.semana(lunes)
        s.update(campos)
        self._guardar()
        return s

    def _guardar(self) -> None:
        fd, tmp = tempfile.mkstemp(dir=self.ruta.parent, suffix=".tmp")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(self._datos, f, ensure_ascii=False, indent=2)
        os.replace(tmp, self.ruta)
