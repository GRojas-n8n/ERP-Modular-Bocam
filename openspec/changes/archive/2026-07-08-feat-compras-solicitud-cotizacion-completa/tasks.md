## 1. Visibilidad de items en tarjetas de requisición

- [x] 1.1 Agregar sección expandible de items en `ComprasView.tsx` (insumo
      resuelto contra catálogo, cantidad, unidad, especificaciones, notas)
- [x] 1.2 Agregar `solicitante_nombre` a `Requisicion` (schema + `POST
      /requisiciones` toma `req.securityContext.name`)
- [x] 1.3 Misma sección expandible de items en `ResidenciaView.tsx` (tarjetas
      propias del Residente)
- [x] 1.4 Commit `d45a84a`

## 2. Separación de notas para proveedores vs. internas

- [x] 2.1 Agregar `Requisicion.observaciones_internas` al schema
- [x] 2.2 Formulario de Nueva Requisición: separar "Notas para Proveedores" de
      "Notas internas para Compras" (con aviso 🔒 de confidencialidad)
- [x] 2.3 Panel de Solicitud de Cotización: mostrar ambos bloques, diferenciados
      visualmente (rojo = interno, ámbar = para proveedores)
- [x] 2.4 Confirmar que el prellenado de "Notas Adicionales" del RFQ solo usa
      `observaciones` (nunca `observaciones_internas`)
- [x] 2.5 Commit `e9feebc`

## 3. Envío real de correo — tema claro

- [x] 3.1 Instalar `nodemailer` + `@types/nodemailer` en `apps/compras`
- [x] 3.2 Crear `apps/compras/src/mailer.ts` (transporter SMTP, plantilla HTML
      tema claro, envío best-effort)
- [x] 3.3 Extraer logo real de iretum desde el SVG de la app (PNG embebido en
      base64, `logo-base64.ts`) para adjunto CID
- [x] 3.4 Wire en `POST /solicitud-cotizacion`: resolver items vía `GT_URL`,
      armar datos y enviar correo a cada proveedor con `email_contacto`
- [x] 3.5 Configurar `SMTP_HOST/PORT/USER/PASS/FROM` en `docker-compose.vps.yml`
      + `.env` real del VPS (secreto, no committeado)
- [x] 3.6 Corregir `SMTP_HOST` (certificado del hosting solo cubre
      `mail.bocam.com.mx`, no `smtp.bocam.com.mx`)
- [x] 3.7 Verificación: envío real de prueba, `emails.enviados: 1`
- [x] 3.8 Commit `08dd1e1`

## 4. Tema oscuro + doble logo + dirección de entrega

- [x] 4.1 Plantilla HTML tema oscuro industrial (paleta, callout PDF
      obligatorio, tabla de partidas con 5 columnas) según especificación
      explícita del usuario
- [x] 4.2 Descargar logo real de Constructora Bocam (`bocam.com.mx`, `-k` por
      certificado inválido del sitio) y embeber como `logo-bocam-base64.ts`
- [x] 4.3 Header de doble logo (iretum + Bocam) en AMBAS plantillas (claro y
      oscuro)
- [x] 4.4 Agregar `Requisicion.direccion_entrega` al schema
- [x] 4.5 Campo "Dirección de entrega" en formulario de Nueva Requisición
      (Residente)
- [x] 4.6 Selector de tema (Claro/Oscuro) en el panel de Solicitud de
      Cotización de Compras
- [x] 4.7 Excluir `Condiciones_Pago` del tema oscuro (decisión explícita: las
      impone cada proveedor)
- [x] 4.8 `proyecto_nombre` enviado desde el frontend (patrón ya usado en
      calificaciones de proveedor), sin nueva llamada B2B a Auth
- [x] 4.9 Migración `direccion_entrega` en `bocam_compras`
- [x] 4.10 Verificación: envío real con tema oscuro, `emails.enviados: 1`
- [x] 4.11 Commit `c6af47b`

## 5. Editar proveedores de una solicitud existente

- [x] 5.1 Backend: reemplazar upsert destructivo (delete-all + recreate-all) por
      diff (`aQuitar` / `aAgregar`) en `POST /solicitud-cotizacion`
- [x] 5.2 Backend: enviar correo solo a `proveedoresNuevos`, no a la lista
      completa en cada edición
- [x] 5.3 Frontend: botón "Seleccionar otros proveedores" en la vista de solo
      lectura, reabre el formulario precargado
- [x] 5.4 Frontend: bloquear en el checklist a los proveedores con estado
      `RESPONDIO` (no se pueden desmarcar)
- [x] 5.5 Verificación real: agregar un proveedor manteniendo el existente →
      `proveedoresNuevos` solo trae el nuevo, `updated_at` del existente no
      cambia, `emails.enviados: 1`
- [x] 5.6 Commit `9791aa5`

## 6. Fix: nombre de proveedor no aparecía ("—")

- [x] 6.1 Diagnóstico: `SolicitudCotizacionProveedor` nunca tuvo relación Prisma
      hacia `Proveedor` (solo `proveedor_id` suelto)
- [x] 6.2 Agregar relación `proveedor` en el schema (ambos lados)
- [x] 6.3 Incluir la relación en el `GET /solicitud-cotizacion` y mapear
      `proveedor_nombre`/`proveedor_ciudad`
- [x] 6.4 Verificación real: `razon_social` y `proveedor_nombre` correctos en la
      respuesta del endpoint
- [x] 6.5 Commit `b78ab43`

## Nota sobre tests

**No se escribieron tests automatizados para ninguna de las 6 áreas.** Toda la
verificación fue manual: compilación TypeScript limpia en cada paso + pruebas
reales contra producción (`curl` con JWT válido, envíos de correo reales,
consultas SQL directas). El área con lógica más crítica para testear
retroactivamente sería la de diff de proveedores (sección 5) — queda pendiente
para un change futuro de cobertura de tests.
