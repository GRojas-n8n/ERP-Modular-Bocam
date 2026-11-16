"""Transporte simulado de la API de GitHub con la forma real de sus respuestas, para pruebas."""
import base64
import json
import httpx

def _b64(t): return base64.b64encode(t.encode()).decode()

def transporte(repos: dict):
    """repos: {"o/r": {"default":"main","branches":[...],"commits":{rama:[(sha,iso,login,msg)]},
    "pulls":[dict],"files":{(ruta,rama):contenido},"dirs":{(ruta,rama):[nombres]},"path_commits":{ruta:bool}}}"""
    def h(req: httpx.Request):
        partes = req.url.path.strip("/").split("/")
        q = dict(req.url.params)
        if partes[0] != "repos":
            return httpx.Response(404, json={})
        nombre = "/".join(partes[1:3]); r = repos.get(nombre)
        if r is None:
            return httpx.Response(404, json={"message": "Not Found"})
        resto = partes[3:]
        pagina = int(q.get("page", 1))
        if not resto:
            return httpx.Response(200, json={"default_branch": r["default"]})
        if resto == ["branches"]:
            return httpx.Response(200, json=[{"name": b} for b in r["branches"]] if pagina == 1 else [])
        if resto == ["commits"]:
            if "path" in q:
                return httpx.Response(200, json=[{"sha": "x"}] if r.get("path_commits", {}).get(q["path"]) else [])
            if pagina > 1: return httpx.Response(200, json=[])
            out = [{"sha": sha + "0" * 33, "author": {"login": login},
                    "commit": {"author": {"date": iso, "name": login}, "message": msg}}
                   for sha, iso, login, msg in r["commits"].get(q.get("sha"), [])
                   if q["since"] <= iso.replace("Z", "+00:00") or True]
            return httpx.Response(200, json=out)
        if resto == ["pulls"]:
            return httpx.Response(200, json=r["pulls"] if pagina == 1 else [])
        if resto[0] == "contents":
            ruta = "/".join(resto[1:]); rama = q.get("ref", r["default"])
            if (ruta, rama) in r.get("dirs", {}):
                return httpx.Response(200, json=[{"name": n, "type": "file"} for n in r["dirs"][(ruta, rama)]])
            if (ruta, rama) in r.get("files", {}):
                return httpx.Response(200, json={"encoding": "base64", "content": _b64(r["files"][(ruta, rama)])})
            return httpx.Response(404, json={"message": "Not Found"})
        return httpx.Response(404, json={})
    return httpx.MockTransport(h)

def pr(n, titulo, login, estado, creado, fusionado=None, rama="feat", cuerpo=""):
    return {"number": n, "title": titulo, "user": {"login": login}, "state": "open" if estado == "open" else "closed",
            "merged_at": fusionado, "created_at": creado, "head": {"ref": rama}, "body": cuerpo}
