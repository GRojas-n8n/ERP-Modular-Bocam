# Checkpoint: PersonalView y Evaluacion de SlidePanel

**Fecha:** 2026-03-19  
**Objetivo:** migrar otra vista operativa del shell a `@bocam/ui-core` y evaluar si `SlidePanel` ya puede promoverse como patron compartido.

---

## Cambios realizados

### 1. `PersonalView` ya esta migrada a `@bocam/ui-core`

Se reescribio:

- [apps/app-shell/src/views/PersonalView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/PersonalView.tsx)

La vista ahora usa componentes compartidos para:

- acciones y tabs (`Button`)
- tarjetas (`Card`, `CardContent`)
- estados vacios (`EmptyStatePanel`)
- badges (`SectionBadge`)
- tabla principal de empleados (`Table*`)
- composicion (`cn`)

Con esto, el shell ya tiene una tercera vista operativa migrada sobre tablas/listados base del design system.

### 2. Evaluacion de `SlidePanel`

Archivo evaluado:

- [apps/app-shell/src/components/SlidePanel.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/components/SlidePanel.tsx)

Conclusion:

- **Si puede entrar parcialmente a `@bocam/ui-core`**.
- **Todavia no conviene subirlo completo tal como esta**.

Motivos:

1. Ya comparte primitives de formulario y accion (`Button`, `FormField`, `Input`, `Textarea`, `Select`) desde `ui-core`, lo cual confirma que la base visual ya esta desacoplada.
2. El contenedor drawer sigue teniendo semantica de shell y decisiones visuales muy locales:
   - `accentColor`
   - gradiente superior
   - ancho fijo `max-w-lg`
   - bloqueo de scroll y cierre por backdrop
3. `SubmitButton` hoy tambien mezcla el rol de accion compartida con color tokens muy orientados a las vistas actuales del shell.

Recomendacion:

- subir despues una primitiva **parcial y mas neutra**, por ejemplo `SideSheet` o `PanelSheet`, con:
  - overlay;
  - cierre por `Esc`;
  - header opcional;
  - ancho configurable;
  - footer opcional;
- mantener por ahora fuera de `ui-core`:
  - el sistema de `accentColor`;
  - cualquier copy o CTA semantico tipo `Guardar Bitacora`;
  - wrappers demasiado orientados a un modulo.

En resumen: `SlidePanel` **ya esta listo para extraccion parcial**, pero **no para una subida 1:1**.

---

## Validacion ejecutada

Pasaron:

- `npx tsc --noEmit -p packages/ui-core/tsconfig.json`
- `npx tsc --noEmit -p apps/app-shell/tsconfig.app.json`

---

## Resultado

`@bocam/ui-core` ya quedo validado en cinco frentes reales del shell:

1. layout y branding;
2. login;
3. compras;
4. control de obra;
5. finanzas;
6. personal.

Y la decision sobre `SlidePanel` ya no queda ambigua: se recomienda **extraerlo por capas**, no moverlo entero todavia.

---

## Siguiente paso recomendado

1. migrar [apps/app-shell/src/views/SeguridadView.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/views/SeguridadView.tsx) para cubrir la ultima gran vista con tablas y cards;
2. despues crear en `@bocam/ui-core` una primitiva nueva `SideSheet` neutral;
3. refactorizar [apps/app-shell/src/components/SlidePanel.tsx](/d:/Mis_Scripts_IA/Flujos%20Agenticos/Proyecto%20ERP%20MODULAR%20Bocam/apps/app-shell/src/components/SlidePanel.tsx) como adapter del shell encima de esa primitiva.

---

*Propiedad Intelectual: Constructora Bocam, S. A. de C.V. - Estrictamente Confidencial.*
