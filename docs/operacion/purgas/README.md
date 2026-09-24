# Bitácora de purgas de proyectos

Cada ejecución real de `scripts/ops/purga-proyecto/purga-proyecto.sh --ejecutar` escribe aquí un archivo `AAAAMMDD-HHMMSS-purga.md` con:

- Fecha (UTC), operador y tenant.
- **Códigos de Centro de Costos** purgados.
- Nombre y **SHA-256** del respaldo previo.
- Filas eliminadas por esquema.
- Resultado de las verificaciones y número de archivos huérfanos.

**No** contiene nombres de proyecto, proveedores, montos, datos personales ni rutas de archivos: es constancia de qué se hizo, no una copia de los datos. El manifiesto de archivos (`purga-archivos-*.txt`) se genera en el directorio de ejecución y **no** se versiona.

Procedimiento completo: [`../purga-proyectos-demo.md`](../purga-proyectos-demo.md).
