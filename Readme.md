# 🏗️ ERP Modular BOCAM - Módulo: [Nombre del Módulo]

> **Propiedad Intelectual:** MÁS Impulso Digital.  
> **Arquitectura:** SaaS Multi-Tenant y Multisucursal.  
> **Clasificación:** Confidencial - Uso Interno.

Bienvenido al repositorio del módulo **[Nombre del Módulo]**. Al contribuir a este código, operas como parte del ecosistema central BOCAM. Tu desarrollo debe ser completamente autónomo en su lógica, pero estrictamente obediente a las reglas globales del sistema.

## 📋 1. Dominio y Responsabilidad
* **Alcance Operativo:** [Ej. Gestiona el ciclo de vida de las órdenes de compra y validación de proveedores].
* **Límites Estrictos:** [Ej. No ejecuta pagos ni genera facturas fiscales. Todo flujo financiero se delega al módulo de Finanzas vía eventos].
* **Entidades Maestras a su cargo:** [Ej. Catálogo de Proveedores]. Si otro módulo necesita estas entidades, deberá consultarlas a través de las APIs que tú expongas aquí.

## 🛑 2. Reglas de Arquitectura y Datos (Tolerancia Cero)
El incumplimiento de cualquiera de estos puntos resultará en el rechazo automático del *Pull Request* (PR).

1. **Aislamiento Multi-Tenant y Multisucursal:**
   * **Base de Datos:** Toda tabla transaccional DEBE incluir `tenant_id` (UUID) y `sucursal_id` (UUID).
   * **Row-Level Security (RLS):** Es obligatorio habilitar políticas RLS en PostgreSQL para estas tablas. El motor de base de datos debe rechazar cualquier consulta que no contenga el contexto del cliente y la sucursal actual.
   * **Extracción Segura:** Estos IDs se extraen SIEMPRE del token JWT desencriptado en el backend, NUNCA del payload o *body* enviado por el frontend.
2. **Soberanía de Datos (Anti-JOINs):**
   * Tu módulo tiene su propia base de datos aislada. ESTÁ ESTRICTAMENTE PROHIBIDO intentar conectar o hacer cruces (JOINs) con tablas de otros módulos. 
   * Utiliza el *Diccionario de Entidades Globales* (UUIDs) para referenciar elementos externos.
3. **Interoperabilidad (API-First y Eventos):**
   * **Lectura:** Expón endpoints REST/GraphQL claros y documentados (Swagger/OpenAPI) para que otros consuman tus datos.
   * **Escritura/Reacción:** Emite eventos asíncronos (ej. `OrdenCompraAprobada`) al bus de mensajes (RabbitMQ/Redis) para detonar procesos en otros módulos sin generar cuellos de botella.



## 🎨 3. Homogeneidad Frontend (Micro-Frontends)
Tu trabajo en el frontend es renderizar vistas de contenido que el **App Shell** (Carcasa Maestra) consumirá. 

1. **Prohibido el CSS Vanilla:** Cero archivos `.css`, `.scss` o estilos en línea. Todo el layout, márgenes, colores y tipografía se construye exclusivamente con **Tailwind CSS**.
2. **Design System Obligatorio:** No programes componentes visuales base (Botones, Tablas, Modales, Inputs). Impórtalos SIEMPRE de nuestra librería centralizada `@bocam/ui-core`.
3. **Marca Blanca (White-Label):**
   * No "quemes" logotipos, colores fijos de marca ni la palabra "Bocam" en la interfaz.
   * El App Shell te inyectará el `tenant_id`, el logotipo y la paleta de colores de la constructora actual mediante un Provider global de estado. Tu vista debe reaccionar a ese contexto de forma dinámica.
4. **Cero Navegación Global:** No dibujes barras laterales (Sidebars) ni barras superiores (Topbars). 

## 🔄 4. Flujo de Trabajo (GitFlow y Pull Requests)
Para mantener el código estable y libre de conflictos, trabajaremos bajo un flujo estricto:

* **Ramas:** Nadie sube código directo a `main` o `develop`. Crea una rama con la nomenclatura: `feature/BOCAM-[Ticket-ID]-breve-descripcion` o `bugfix/BOCAM-[Ticket-ID]-...`.
* **Commits:** Usa Conventional Commits (ej. `feat: añade validación de sucursal en OC`, `fix: corrige timeout en consulta de catálogo`).

### ✅ Checklist obligatorio antes de solicitar revisión (PR):
- [ ] Mi código no rompe el aislamiento de la base de datos (No hay JOINs externos).
- [ ] Todas las nuevas tablas incluyen `tenant_id` y `sucursal_id` con RLS habilitado.
- [ ] Los endpoints validan los permisos del usuario (RBAC) según su rol.
- [ ] El frontend utiliza exclusivamente Tailwind y componentes de `@bocam/ui-core`.
- [ ] No hay llaves, tokens o contraseñas "quemadas" en el código (uso de `.env`).

## 🚀 5. Arranque Local
Copia el archivo `.env.example` a `.env` y configura tus variables locales.

```bash
npm install
npm run db:migrate # Ejecuta migraciones estructurales
npm run dev        # Inicia el servidor de desarrollo local