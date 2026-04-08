# Diagrama de Contenedores

## Vista logica
```text
Internet
  |
  v
[ DNS ]
  |
  v
[ Reverse Proxy: Caddy/Nginx ]
  |
  v
[ App Shell ]
  |
  +--> auth
  +--> gerencia-tecnica
  +--> compras
  +--> finanzas
  +--> control-obra
  +--> contabilidad
  +--> personal
  +--> seguridad
  +--> ventas

compras ----------HTTP---------> finanzas
control-obra -----HTTP---------> finanzas
compras ----------evento-------> rabbitmq
control-obra -----evento-------> rabbitmq
finanzas ---------evento-------> rabbitmq
contabilidad <-----evento------> rabbitmq

auth -------------> bocam_auth
gerencia-tecnica -> bocam_gerencia_tecnica
compras ---------> bocam_compras
finanzas --------> bocam_finanzas
control-obra ----> bocam_control_obra
contabilidad ----> bocam_contabilidad
personal --------> bocam_personal
seguridad -------> bocam_seguridad
ventas ----------> bocam_ventas
```

## Contenedores esperados
- `caddy`
- `app-shell`
- `postgres`
- `rabbitmq`
- `redis`
- `workspace-tooling`
- `auth`
- `gerencia-tecnica`
- `compras`
- `finanzas`
- `control-obra`
- `contabilidad`
- `contabilidad-sat-worker`
- `personal`
- `seguridad`
- `ventas`

## Puertos
### Publicos
- `80`
- `443`

### Internos
- `3001` gerencia-tecnica
- `3002` compras
- `3003` auth
- `3004` finanzas
- `3005` control-obra
- `3006` personal
- `3007` seguridad
- `3008` contabilidad
- `5432` postgres
- `5672` rabbitmq
- `6379` redis

## Reglas operativas
- Ningun backend debe publicarse directo a internet.
- El proxy es el unico punto de entrada.
- Cada servicio debe exponer `/health`.
- Los servicios deben depender de infraestructura saludable, no solo iniciada.
