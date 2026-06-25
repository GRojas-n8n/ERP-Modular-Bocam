## 1. Estado y lógica de filtrado

- [x] 1.1 En `ComprasView.tsx`, agregar `const [filtroEstadoCiclo, setFiltroEstadoCiclo] = useState<string>('todos')` junto al resto de estados del componente (cerca de la línea ~256 donde están los demás `useState`)
- [x] 1.2 Definir la constante `FILTROS_CICLO` antes del `return` del componente — array de objetos `{ id, label, color }` con los chips: `todos`, `pendiente-aprobacion`, `lista-cotizar`, `cotizando`, `evaluacion-tecnica`, `pendiente-gt`, `autorizado`
- [x] 1.3 Crear la función `getIdCiclo(req, comp?)` que retorna el id del chip correspondiente a cada combinación req.estado + comp.estado — reutilizar la misma lógica de `getReqCycleStep` (línea 1182) pero retornando el id del chip en lugar del label/cls

## 2. Filtrado del array

- [x] 2.1 En la línea 1438, reemplazar el `.filter` existente para combinar ambos filtros:
  ```ts
  requisiciones
    .filter(req => !reqFiltroConcepto || req.concepto_id === reqFiltroConcepto)
    .filter(req => {
      if (filtroEstadoCiclo === 'todos') return true;
      const comp = comparativas.find(c => c.requisicion_id === req.id);
      return getIdCiclo(req, comp) === filtroEstadoCiclo;
    })
  ```

## 3. Chips en el JSX

- [x] 3.1 Insertar la barra de chips justo después del cierre del bloque `{/* ── Filtro por partida ──*/}` (después del `</div>` de línea ~1436), antes del `<div className="grid...">` de línea 1437
- [x] 3.2 Renderizar los chips como una fila `flex flex-wrap gap-2 pb-1` con `overflow-x-auto` para mobile
- [x] 3.3 Cada chip es un `<button>` con estilos condicionales: activo = fondo sólido del color del estado (`bg-{color}-500/20 text-{color}-700 border-{color}-500/40 font-black`), inactivo = `bg-muted/30 text-muted-foreground border-border/30`
- [x] 3.4 Cada chip muestra `{filtro.label} ({count})` donde `count` es el número de requisiciones que pasan ese filtro de ciclo (independiente del filtro de partida activo)

## 4. Verificación

- [x] 4.1 Build local sin errores de TypeScript (`npm run build -w app-shell`)
- [x] 4.2 Verificar en UI: chips aparecen en el tab Requisiciones con rol compras
- [x] 4.3 Verificar: hacer clic en "Lista para cotizar" filtra solo las reqs APROBADA sin comparativa
- [x] 4.4 Verificar: hacer clic en "Todos" vuelve a mostrar todas las reqs
- [x] 4.5 Deploy en VPS: `docker compose -f docker-compose.vps.yml build app-shell && docker compose -f docker-compose.vps.yml up -d app-shell`
