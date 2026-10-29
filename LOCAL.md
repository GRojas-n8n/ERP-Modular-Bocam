# LOCAL.md — Trabajo en el entorno local

Las pruebas locales se hacen en la rama **`entorno-local`**. A `main` nunca se le hace commit ni push directo: los cambios llegan solo por Pull Request.

## Aviso de rama al arrancar

`npm run dev` y `npm run dev:ventas` ejecutan primero `scripts/local/verificar-rama.mjs`:

- Siempre muestra la rama activa: `[rama] Rama activa: entorno-local`.
- Si la rama **no** es `entorno-local`, avisa y pregunta `¿Arrancar de todos modos? (s/N)`. Cualquier respuesta distinta de `s` cancela el arranque.
- Si la terminal no es interactiva (sin teclado), el arranque se detiene. Para forzarlo:
  - PowerShell: `$env:PERMITIR_OTRA_RAMA='1'; npm run dev`
  - Git Bash: `PERMITIR_OTRA_RAMA=1 npm run dev`

## 1. ¿En qué rama estoy?

```bash
git branch --show-current
```

`git status` también lo dice en la primera línea (`On branch ...`) y además lista los archivos con cambios.

## 2. Cambiarme de rama

Antes de cambiar, guarda o descarta lo que estés editando (`git status` debe salir limpio, salvo archivos nuevos que no quieras subir).

```bash
git switch entorno-local      # ir a la rama de pruebas
git switch main               # ir a main (solo para leer o actualizar)
```

Traer a `entorno-local` lo último de `main`:

```bash
git switch main
git pull
git switch entorno-local
git merge main
git push
```

## 3. Unir a `main` cambios ya probados

1. En `entorno-local`, guarda y sube tus cambios:
   ```bash
   git add <archivos>
   git commit -m "feat: descripción corta"
   git push
   ```
2. Abre un Pull Request de `entorno-local` hacia `main`:
   ```bash
   gh pr create --base main --head entorno-local
   ```
   (o en GitHub: *Compare & pull request*).
3. Espera a que pasen los checks de CI y la revisión (gate de QA en `CLAUDE.md`).
4. Haz merge del PR en GitHub. **No** hagas `git push origin main`.
5. Actualiza tu copia local:
   ```bash
   git switch main
   git pull
   git switch entorno-local
   git merge main
   ```
