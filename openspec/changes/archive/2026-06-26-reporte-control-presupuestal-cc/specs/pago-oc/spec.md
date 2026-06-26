## MODIFIED Requirements

### Requirement: POST /finanzas/pagos acepta concepto_id en detalles
El endpoint `POST /api/v1/finanzas/pagos` SHALL aceptar `concepto_id` y `concepto_clave` opcionales en cada objeto del array `detalles`. Cuando presentes, se persisten en `DetallePagoOC` sin validación cruzada con GT. La lógica de negocio existente (validación de monto, descuento de saldo/anticipo, publicación de evento) no cambia.

```
POST /api/v1/finanzas/pagos
  Body: {
    proyecto_id: string,
    fuente: "ANTICIPO" | "CUENTA_BANCARIA",
    cuenta_bancaria_id?: string,
    tipo_pago: "CHEQUE" | "TRANSFERENCIA" | "EFECTIVO",
    referencia?: string,
    fecha_pago: string (ISO),
    concepto?: string,
    detalles: Array<{
      oc_id: string,
      oc_folio: string,
      proveedor: string,
      monto_aplicado: number,
      concepto_id?: string,       // NUEVO — UUID del Concepto (partida APU) en GT
      concepto_clave?: string     // NUEVO — clave desnormalizada para display
    }>
  }
  → 201 PagoOC creado con detalles (incluye concepto_id/concepto_clave en respuesta)
```

#### Scenario: Crear pago con concepto_id en detalles
- **WHEN** el body incluye `detalles[i].concepto_id` y `detalles[i].concepto_clave`
- **THEN** se persisten en `DetallePagoOC` y aparecen en la respuesta 201

#### Scenario: Crear pago sin concepto_id (compatibilidad)
- **WHEN** el body no incluye `concepto_id` en los detalles
- **THEN** el pago se crea con `concepto_id = null` sin ningún error — comportamiento idéntico al anterior
