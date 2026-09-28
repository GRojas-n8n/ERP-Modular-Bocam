## 1. Backend — tests y modelo (TDD)

- [x] 1.1 Escribir tests Jest/Supertest de `POST /avances/lote` (válido, concepto inválido atómico, estimación inexistente)
- [x] 1.2 Escribir tests de `GET /avances/resumen-por-concepto` y `GET /estimaciones/totales` (incl. `parcial: true`)
- [x] 1.3 Migración Prisma: `AvanceFisico.estimacion_referencia_id` nullable + índice

## 2. Backend — implementación

- [x] 2.1 Implementar `POST /avances/lote` transaccional reutilizando el cálculo de `POST /avances`; publicar `AVANCE_FISICO_REGISTRADO` por avance
- [x] 2.2 Implementar `GET /avances/resumen-por-concepto`
- [x] 2.3 Implementar `GET /estimaciones/totales` con consulta backend-to-backend a gerencia-tecnica

## 3. Frontend — EstimacionesTab

- [x] 3.1 Tests de vista: tarjetas de totales, agrupación por concepto, registro por estimación
- [x] 3.2 Tarjetas contratado / estimado / cobrado / restante (manejo de `parcial`)
- [x] 3.3 Tabla de avances agrupada por concepto con detalle expandible
- [x] 3.4 Panel "Registrar avance por estimación" con prellenado desde la estimación
- [x] 3.5 Actualizar demoData y ayuda `help/content/residencia.ts`

## 4. Cierre

- [ ] 4.1 Correr suites de control-proyectos y app-shell; PR `feat/` contra main
