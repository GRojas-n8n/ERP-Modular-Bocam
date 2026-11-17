"""Lectura de solo lectura de los repositorios de Iretum en GitHub (API REST)."""
import base64
import logging
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

import httpx

log = logging.getLogger("iretum.github")
API = "https://api.github.com"
MAX_RAMAS = 25


@dataclass
class Commit:
    sha: str
    fecha: datetime  # hora local
    autor: str
    mensaje: str
    rama: str


@dataclass
class PR:
    numero: int
    titulo: str
    autor: str
    estado: str  # abierto | fusionado | cerrado
    creado: datetime
    fusionado: datetime | None
    rama: str
    cuerpo: str


@dataclass
class DatosRepo:
    nombre: str
    commits: list[Commit] = field(default_factory=list)
    prs_fusionados: list[PR] = field(default_factory=list)
    prs_abiertos: list[PR] = field(default_factory=list)
    prs_creados_semana: list[PR] = field(default_factory=list)
    archivos: dict[str, str] = field(default_factory=dict)  # ruta -> contenido
    errores: list[str] = field(default_factory=list)


class GitHub:
    def __init__(self, token: str | None, tz: ZoneInfo, transport: httpx.AsyncBaseTransport | None = None):
        self.tz = tz
        h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28",
             "User-Agent": "iretum-reportes"}
        if token:
            h["Authorization"] = f"Bearer {token}"
        self.cliente = httpx.AsyncClient(base_url=API, headers=h, timeout=30, transport=transport)

    async def cerrar(self):
        await self.cliente.aclose()

    async def _get(self, ruta: str, **params):
        r = await self.cliente.get(ruta, params=params)
        if r.status_code == 404:
            return None
        r.raise_for_status()
        return r.json()

    async def _paginar(self, ruta: str, limite: int = 300, **params) -> list:
        salida, pagina = [], 1
        while len(salida) < limite:
            datos = await self._get(ruta, per_page=100, page=pagina, **params)
            if not datos:
                break
            salida.extend(datos)
            if len(datos) < 100:
                break
            pagina += 1
        return salida[:limite]

    def _local(self, iso: str | None) -> datetime | None:
        if not iso:
            return None
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(self.tz)

    async def leer_archivo(self, repo: str, ruta: str, ref: str | None = None) -> str | None:
        d = await self._get(f"/repos/{repo}/contents/{ruta}", **({"ref": ref} if ref else {}))
        if not d or isinstance(d, list) or d.get("encoding") != "base64":
            return None
        return base64.b64decode(d["content"]).decode("utf-8", errors="replace")

    async def listar(self, repo: str, ruta: str, ref: str | None = None) -> list[dict]:
        d = await self._get(f"/repos/{repo}/contents/{ruta}", **({"ref": ref} if ref else {}))
        return d if isinstance(d, list) else []

    async def recolectar(self, repo: str, lunes: date, todas_las_ramas: bool,
                         carpetas_por_fecha: tuple[str, ...] = (),
                         archivos_fijos: tuple[str, ...] = (),
                         carpetas_modificadas: tuple[str, ...] = ()) -> DatosRepo:
        """Commits, PR y archivos de la semana de `lunes` (lunes 00:00 a lunes siguiente 00:00, hora local)."""
        datos = DatosRepo(repo)
        desde = datetime.combine(lunes, time(0), self.tz)
        hasta = desde + timedelta(days=7)
        params = {"since": desde.isoformat(), "until": hasta.isoformat()}
        try:
            info = await self._get(f"/repos/{repo}")
            if info is None:
                datos.errores.append(f"{repo}: no existe o el token no tiene acceso")
                return datos
            principal = info["default_branch"]
            ramas = [principal]
            if todas_las_ramas:
                ramas += [b["name"] for b in await self._paginar(f"/repos/{repo}/branches", MAX_RAMAS)
                          if b["name"] != principal]
            vistos = set()
            for rama in ramas:
                for c in await self._paginar(f"/repos/{repo}/commits", sha=rama, **params):
                    if c["sha"] in vistos:
                        continue
                    vistos.add(c["sha"])
                    cm = c["commit"]
                    datos.commits.append(Commit(
                        c["sha"][:7], self._local(cm["author"]["date"]),
                        (c.get("author") or {}).get("login") or cm["author"]["name"],
                        cm["message"].strip(), rama))
            datos.commits.sort(key=lambda c: c.fecha)

            for p in await self._paginar(f"/repos/{repo}/pulls", 200, state="all", sort="updated",
                                         direction="desc"):
                pr = PR(p["number"], p["title"], p["user"]["login"],
                        "fusionado" if p.get("merged_at") else ("abierto" if p["state"] == "open" else "cerrado"),
                        self._local(p["created_at"]), self._local(p.get("merged_at")),
                        p["head"]["ref"], (p.get("body") or "")[:1500])
                if pr.estado == "abierto":
                    datos.prs_abiertos.append(pr)
                if pr.fusionado and desde <= pr.fusionado < hasta:
                    datos.prs_fusionados.append(pr)
                if desde <= pr.creado < hasta:
                    datos.prs_creados_semana.append(pr)

            for ruta in archivos_fijos:
                contenido = await self.leer_archivo(repo, ruta)
                if contenido is not None:
                    datos.archivos[ruta] = contenido

            # Archivos con fecha en el nombre (reportes/2026-10-27.md), en cualquier rama.
            fechas = {(lunes + timedelta(days=i)).isoformat() for i in range(7)}
            for carpeta in carpetas_por_fecha:
                for rama in ramas:
                    for f in await self.listar(repo, carpeta, rama):
                        ruta = f"{carpeta}/{f['name']}"
                        if f["type"] == "file" and f["name"][:10] in fechas and ruta not in datos.archivos:
                            contenido = await self.leer_archivo(repo, ruta, rama)
                            if contenido is not None:
                                datos.archivos[ruta] = contenido

            # Archivos creados o modificados en la semana dentro de una carpeta (registros de decisión).
            for carpeta in carpetas_modificadas:
                for f in await self.listar(repo, carpeta):
                    if f["type"] != "file":
                        continue
                    ruta = f"{carpeta}/{f['name']}"
                    cambios = await self._get(f"/repos/{repo}/commits", path=ruta, per_page=1, **params)
                    if cambios:
                        contenido = await self.leer_archivo(repo, ruta)
                        if contenido is not None:
                            datos.archivos[ruta] = contenido
        except httpx.HTTPError as e:
            log.exception("Error leyendo %s", repo)
            datos.errores.append(f"{repo}: {e}")
        return datos
