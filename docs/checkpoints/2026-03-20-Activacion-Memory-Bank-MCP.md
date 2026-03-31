# Activacion de Memory Bank MCP

**Fecha:** 2026-03-20  
**Paquete:** `@allpepper/memory-bank-mcp`

## Lo que se hizo

Se dejo operativa la activacion del MCP en el workspace con dependencia local del monorepo:

- Configuracion Cursor: [\.cursor/mcp.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/.cursor/mcp.json)
- Banco raiz: [\.memory-bank/README.md](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/.memory-bank/README.md)
- Proyecto inicial del banco: [\.memory-bank/Proyecto ERP MODULAR Bocam/projectBrief.md](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/.memory-bank/Proyecto%20ERP%20MODULAR%20Bocam/projectBrief.md)
- Contexto actual local: [activeContext.md](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/activeContext.md)
- Dependencia instalada localmente en `node_modules`

## Configuracion aplicada

Se configuro el servidor MCP para correr con:

```json
{
  "mcpServers": {
    "allpepper-memory-bank": {
      "command": "node",
      "args": [
        "D:\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\node_modules\\@allpepper\\memory-bank-mcp\\dist\\main\\index.js"
      ],
      "env": {
        "MEMORY_BANK_ROOT": "D:\\Mis_Scripts_IA\\Flujos Agenticos\\Proyecto ERP MODULAR Bocam\\.memory-bank"
      },
      "disabled": false,
      "autoApprove": [
        "memory_bank_read",
        "memory_bank_write",
        "memory_bank_update",
        "list_projects",
        "list_project_files"
      ]
    }
  }
}
```

## Fuente consultada

Documentacion y ejemplos de configuracion del paquete:

- [npm package](https://www.npmjs.com/package/%40allpepper/memory-bank-mcp)

Segun la documentacion, el servidor puede arrancarse por `npx`, pero para este repo se fijo a la dependencia local ya instalada para no depender de descargas dinamicas al iniciar el cliente.

## Estado operativo del repo

- Paquete instalado localmente
- Configuracion del workspace apuntando al binario local
- Banco raiz creado
- Estructura inicial del proyecto creada

## Lo unico pendiente fuera del repo

1. Reiniciar o recargar Cursor para que lea [\.cursor/mcp.json](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/.cursor/mcp.json)
2. Verificar en la UI de MCP que `allpepper-memory-bank` aparezca conectado
3. Si Cursor no toma la configuracion por workspace, copiar la misma configuracion a su archivo global de MCP
