\# 🏗️ Guía Maestra de Desarrollo: ERP Modular BOCAM



\[cite\_start]Este documento establece las reglas de cumplimiento obligatorio para el desarrollo de módulos dentro del ecosistema SaaS Multi-Tenant y Multi-Proyecto de \*\*Constructora BOCAM, S. A. de C.V.\*\*\[cite: 1, 19].



\## 🛑 1. Reglas de Oro (Tolerancia Cero)

El incumplimiento de estos puntos resultará en el rechazo automático de cualquier Pull Request (PR).



\* \*\*Soberanía de Datos:\*\* Está estrictamente prohibido realizar consultas SQL cruzadas (JOINs) entre tablas de diferentes módulos. Cada módulo es dueño exclusivo de su base de datos.

\* \*\*Aislamiento Multi-Tenant:\*\* Toda tabla (maestra o transaccional) debe incluir la columna `tenant\_id` (UUID) para segregar la información por cliente.

\* \*\*Aislamiento Multi-Proyecto:\*\* Toda tabla transaccional debe incluir la columna `proyecto\_id` (UUID) para identificar el centro de costos o sucursal.

\* \*\*Row-Level Security (RLS):\*\* Es obligatorio habilitar políticas RLS en PostgreSQL para todas las tablas. El motor de base de datos debe rechazar consultas sin el contexto del cliente y sucursal.

\* \*\*Origen del Contexto:\*\* Los IDs de Tenant y Proyecto se extraen SIEMPRE del token JWT, NUNCA del payload enviado por el frontend.



\## 🔌 2. Interoperabilidad y Comunicación

La comunicación entre módulos se realiza exclusivamente por red, nunca por memoria local.



\### A. Consultas Sincrónicas (API-First)

\* \*\*Endpoints:\*\* Expón interfaces REST/GraphQL claras y documentadas con OpenAPI/Swagger.

\* \*\*Seguridad:\*\* Todo endpoint debe validar el token JWT, verificando permisos y Límites de Autoridad Financiera (RBAC).

\* \*\*Single Source of Truth (SSOT):\*\* Para referenciar Proyectos, Usuarios, Terceros o Insumos, usa exclusivamente los UUIDs definidos en el Diccionario de Entidades Globales.



\### B. Comunicación Asincrónica (Eventos)

\* \*\*Bus de Eventos:\*\* Usa RabbitMQ o Redis para emitir eventos (ej. `OrdenCompraAprobada`).

\* \[cite\_start]\*\*Payload Estándar:\*\* Los eventos deben incluir obligatoriamente el contexto de seguridad para que el consumidor sepa a qué cliente pertenece la acción\[cite: 36].



\## 🎨 3. Frontend y Marca Blanca (White-Label)

El frontend debe ser agnóstico y dinámico según el cliente actual.



\* \*\*Design System:\*\* No construyas componentes desde cero. Importa botones, tablas y modales de `@bocam/ui-core`.

\* \*\*Tailwind CSS:\*\* Prohibido el uso de CSS vanilla o estilos en línea. Usa exclusivamente clases utilitarias de Tailwind.

\* \*\*Agnosticismo del Módulo:\*\* Los módulos no dibujan Sidebars ni Topbars; solo renderizan su dashboard interno dentro del App Shell.

\* \*\*Dinamicidad:\*\* El App Shell inyectará el logotipo y la paleta de colores de la constructora mediante un Provider global.



\## 🔄 4. Flujo de Trabajo (GitFlow)

\* \*\*Ramas:\*\* Nomenclatura obligatoria: `feature/BOCAM-\[ID]-descripcion` o `bugfix/BOCAM-\[ID]-descripcion`.

\* \*\*Conventional Commits:\*\*

&nbsp;   \* `feat(modulo): \[ID] descripción` para nuevas funcionalidades.

&nbsp;   \* `fix(modulo): \[ID] descripción` para correcciones.

\* \*\*Variables de Entorno:\*\* Credenciales y URIs de bases de datos van estrictamente en el archivo `.env`.



\## ✅ Checklist Pre-PR

\- \[ ] ¿El código respeta el aislamiento (No hay JOINs externos)?

\- \[ ] ¿Todas las tablas tienen RLS habilitado?

\- \[ ] ¿Los endpoints validan permisos (RBAC) y límites financieros?

\- \[ ] ¿El frontend usa exclusivamente Tailwind y componentes de `@bocam/ui-core`?

\- \[ ] ¿Se emiten los eventos necesarios tras mutaciones de datos?

