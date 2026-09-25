## 1. Línea base

- [x] 1.1 Ejecutar validación integral estricta y guardar conteos por tipo.
- [x] 1.2 Clasificar las 128 fallas sin modificar las specs.
- [x] 1.3 Generar inventario de archivos por los diez dominios definidos (`inventory.md`): 92 specs, 52 estructurales (T1/T2), 11 con requisitos por reubicar (T3a) y 29 de prosa que exigen redactar requisitos (T3b).

## 2. Corrección bloqueante

- [x] 2.1 Corregir el delta de `centro-costos-confirmar-y-editar-consecutivo` conservando todos los escenarios canónicos y reemplazar el propósito placeholder de la spec canónica.
- [ ] 2.2 Validar el change y completar su QA antes de archivarlo.

- [x] 2.3 Normalizar los 10 requisitos de 7 specs que la validación marcaba sin `SHALL`/`MUST`: el validador solo lee la primera línea del cuerpo y la palabra normativa quedaba en una línea posterior. Solo se unieron líneas partidas; el texto palabra por palabra es idéntico al de `HEAD`. Specs válidas 64 → 71.

## 3. Migración estructural

- [ ] 3.1–3.10 Migrar los diez lotes de specs con formato anterior, siguiendo el orden y las reglas de lote de `inventory.md`. Los PR se dividen por nivel (T1/T2, T3a, T3b) y nunca los mezclan; las T3b no son migración mecánica y requieren revisión funcional.
- [ ] 3.11 Demostrar por script que ningún requisito ni escenario cambió durante la transformación.

## 4. Propósitos

- [ ] 4.1–4.10 Redactar y revisar los propósitos placeholder por dominio.
- [ ] 4.11 Confirmar que ningún `Purpose` contiene `TBD`, `TODO` o texto generado por defecto.

## 5. Gate

- [ ] 5.1 Obtener 177/177 elementos válidos con `openspec validate --all --strict`.
- [ ] 5.2 Añadir el comando como gate obligatorio de CI.
- [ ] 5.3 Probar que una spec inválida de fixture hace fallar el gate.
- [ ] 5.4 Archivar el change tras merge y CI verde.
