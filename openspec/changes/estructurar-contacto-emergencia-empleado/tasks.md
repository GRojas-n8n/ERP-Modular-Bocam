## 1. Esquema y migración (personal)

- [x] 1.1 Agregar `contacto_emergencia_nombre`, `contacto_emergencia_telefono`,
      `contacto_emergencia_parentesco` (nullable) a `Empleado` en
      `apps/personal/prisma/schema.prisma`, sin tocar `contacto_emergencia`
- [x] 1.2 Generar migración Prisma que agregue las 3 columnas y copie
      `contacto_emergencia` → `contacto_emergencia_nombre` en la misma
      migración (`UPDATE ... WHERE contacto_emergencia IS NOT NULL`)
- [x] 1.3 Correr la migración en local y verificar contra datos de prueba
      existentes que el valor legacy quedó copiado en `contacto_emergencia_nombre`

## 2. Backend — alta y edición de empleado (TDD)

- [x] 2.1 Escribir/actualizar tests de `POST /api/v1/personal/empleados` que
      cubran: alta con los 3 campos nuevos, alta sin ninguno (quedan `null`),
      y que el body ya no acepta `contacto_emergencia` (se ignora si se envía)
- [x] 2.2 Escribir/actualizar tests de `PATCH /api/v1/personal/empleados/:id`
      que cubran: editar solo `contacto_emergencia_telefono` sin afectar
      nombre/parentesco existentes
- [x] 2.3 Implementar en `apps/personal/src/main.ts` la aceptación de los 3
      campos nuevos en alta y edición, y dejar de leer/escribir
      `contacto_emergencia`
- [x] 2.4 Actualizar el mapeo de salida del empleado (línea ~2111) para
      exponer los 3 campos nuevos en vez de `contacto_emergencia`
- [x] 2.5 Correr la suite de `personal` y confirmar verde

## 3. Frontend — formularios de alta y edición (TDD)

- [x] 3.1 Actualizar `PersonalView.editar-empleado.test.tsx` para cubrir los 3
      inputs nuevos en vez del input único de contacto de emergencia
- [x] 3.2 En `PersonalView.tsx`: reemplazar `contacto_emergencia` por los 3
      campos nuevos en `NuevoEmpleadoForm`, el estado de edición, y el tipo del
      empleado usado en la lista
- [x] 3.3 Reemplazar el `FormField` único "Contacto de emergencia" por tres
      `FormField`s (Nombre, Teléfono, Parentesco) en el panel de alta
      (línea ~1825) y en el panel de edición (línea ~1890)
- [x] 3.4 Correr los tests de `PersonalView` y confirmar verde

## 4. Impresión de credenciales (TDD)

- [x] 4.1 Actualizar `PersonalView.imprimir-lote-credenciales.test.tsx` para
      cubrir nombre + teléfono del contacto de emergencia en vez del campo
      único, incluyendo el caso sin datos ("No registrado")
- [x] 4.2 Actualizar el tipo de entrada y el render en
      `apps/app-shell/src/lib/credencialesPrint.ts` para mostrar
      `contactoEmergenciaNombre` y `contactoEmergenciaTelefono`
- [x] 4.3 Actualizar el punto donde `PersonalView.tsx` arma el payload para
      `credencialesPrint.ts` (línea ~904) con los campos nuevos
- [x] 4.4 Correr los tests y confirmar verde

## 5. Verificación end-to-end

- [x] 5.1 Levantar el entorno local, dar de alta un empleado con los 3 campos
      nuevos vía navegador real, y confirmar que persisten tras recargar
- [x] 5.2 Editar un empleado existente con `contacto_emergencia` legacy y
      confirmar que el nombre migrado aparece precargado en el panel de
      edición
- [x] 5.3 Generar una hoja de impresión de credenciales y confirmar que
      muestra nombre + teléfono del contacto de emergencia

## 6. Despliegue a producción

- [x] 6.1 Aplicar la migración en el VPS (`prisma migrate deploy` en
      `personal`) y confirmar contra la BD real que los valores legacy se
      copiaron correctamente antes de redesplegar el backend
      (verificado: 0 empleados reales tenían `contacto_emergencia` legacy
      poblado, no había nada que migrar; columnas nuevas presentes en el
      esquema real)
- [x] 6.2 Redesplegar `personal` y `app-shell` (vía CI/CD automatizado,
      ambos healthy y con smoke test de Playwright en verde)
- [x] 6.3 Verificar en producción (esquema real + servicio healthy + CI
      smoke tests en verde; sin prueba de alta/edición en vivo para no
      crear datos de prueba en la BD real de la empresa — decisión del
      usuario)
- [x] 6.4 Archivar el change (`openspec archive`) tras verificación en
      producción
