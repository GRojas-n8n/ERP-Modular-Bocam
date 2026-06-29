# Proposal: control-proyectos-modulo

## Why

Sin el módulo Control de Proyectos, el Director de Proyectos no tiene un único punto de vista para saber cómo va la obra en términos de costo y tiempo. Los datos existen (avances en GT, costos en Finanzas, OCs en Compras) pero están dispersos y nadie los consolida en métricas EVM.

## What

Nuevo microservicio independiente (`apps/control-proyectos`, puerto 3013) que:

1. **Recibe eventos** de GT, Compras, Finanzas, Control de Obra y los convierte en métricas EVM por partida.
2. **Expone un dashboard ejecutivo** con CPI, SPI, VAC, semáforo y alertas activas.
3. **Calcula Curva S** comparando programación planificada vs. avance real.
4. **Genera alertas predictivas** automáticamente (sobrecosto, retraso crítico, partida bloqueada, etc.).
5. **Proyecta flujo de caja** mensual basado en la programación y el ritmo actual.

## New Capabilities

- `ProgramacionObra`: registro de fechas planificadas y curva S por partida (ingresado por el CP).
- `AlertaProyecto`: alertas predictivas generadas automáticamente + workflow reconocer/ignorar.
- `ProyeccionCierre`: snapshots diarios de EVM global.

## Modified Capabilities

- `control_obra.avance_fisico_validado` → CP actualiza `pct_avance_real` y EVM por partida.
- `gerencia_tecnica.partida_bloqueada` → CP crea alerta `PARTIDA_BLOQUEADA`.
- `gerencia_tecnica.transferencia_partida_aprobada` → CP resuelve alerta de bloqueo en destino.

## Impact

- **Backend nuevo:** `apps/control-proyectos/` puerto 3013
- **Frontend nuevo:** `ControlProyectosView.tsx` con 5 pestañas
- **Infraestructura:** `docker-compose.vps.yml`, `nginx.conf`, `vite.config.ts`
- **Sin cambios en otros microservicios** — CP solo suscribe eventos, no llama a otros servicios en tiempo real.
