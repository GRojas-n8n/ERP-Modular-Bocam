# ADR-002: Módulo de Asistencia y Prenómina como servicio propio

- **Estado:** Propuesta (inicio de desarrollo: semana del 2 de noviembre de 2026)
- **Fecha:** 27 de octubre de 2026
- **Responsable:** Germán Rojas Galeana, Lead Software Architect
- **Desarrollo:** Aldahir Molina Medina, bajo supervisión

## Contexto

El residente de obra toma lista a su cuadrilla (entrada cerca de las 8:00, salida entre 16:00 y 17:00). Con esos registros se arma la prenómina semanal, que el residente revisa y autoriza digitalmente; después pasa a Finanzas para su revisión y pago. Hoy la asistencia de Residencia vive en memoria del laboratorio y «Marcar salida» no registra la salida (hallazgo JR-01, fila 4).

Requisitos definidos:

- Registro por **QR** (Iretum ya genera un QR único por trabajador) o por **reconocimiento facial** con la foto del expediente; el método se elige por proyecto (QR para cuadrillas grandes, por ejemplo 500 trabajadores).
- Aplicación web instalable (**PWA**) en la **tablet oficial** del residente, con **modo sin conexión** y sincronización al recuperar señal. Solo tablets registradas a la empresa; el teléfono personal del residente no es válido.
- **Geocercas:** hasta 4 o 5 puntos de trabajo por proyecto, definidos antes de tomar lista.
- Foto opcional al checar, para evitar que un trabajador cheque por otro. QR difícil de replicar.
- Tolerancia de reloj entre tablet y servidor: 10 minutos (configurable); fuera de ella, el registro se marca para revisión.
- Registro manual de respaldo cuando falle QR o facial: permitido sin límite, marcado en la prenómina.
- **Préstamo de trabajadores entre obras:** cada residente autoriza solo las horas o días que el trabajador estuvo en su proyecto.
- **Incidencias:** faltas y retardos automáticos desde la tablet, confirmados al cerrar el día; permisos solicitados por el residente y aprobados por Recursos Humanos (con o sin goce); incapacidades IMSS y vacaciones capturadas por Recursos Humanos.
- **Cierre diario** que bloquea el día, con correcciones permitidas al cerrar la semana y antes de autorizar.
- Solo el residente corrige y autoriza la prenómina; Recursos Humanos queda informado; Finanzas la recibe ya autorizada.
- Prenómina con salario base registrado ante el IMSS, horas extra dobles y triples según la Ley Federal del Trabajo, y conceptos complementarios definidos por el contador.
- **Datos biométricos:** consentimiento firmado en Recursos Humanos al contratar y en cada recontratación; quien no firme usa solo QR. Al dar de baja se bloquean y se borran después del periodo de retención. Foto actualizada en cada recontratación; alerta a Recursos Humanos cuando baja la confianza del reconocimiento.

## Decisión

Construir **Asistencia y Prenómina como un servicio propio** del ERP, con su base de datos, y no dentro de Finanzas ni de Residencia.

- Residencia muestra las pantallas del residente (toma de lista, cierre diario, autorización).
- Al autorizar la prenómina, el servicio publica un evento (`asistencia.prenomina_autorizada.v1`) que consume Finanzas, igual que hoy se integran Compras, Almacén y Finanzas.
- Personal (Recursos Humanos) sigue siendo dueño del expediente del trabajador, su QR, su foto y su consentimiento biométrico.

## Alternativas evaluadas

| Opción | A favor | En contra |
| --- | --- | --- |
| Dentro de Finanzas | Cerca del pago | Mezcla captura en campo con contabilidad; Finanzas no tiene cliente en tablet ni modo sin conexión |
| Dentro de Residencia | Cerca del residente | Residencia ya está repartida en cinco módulos; los datos biométricos quedarían mezclados con la operación de obra |
| **Servicio propio (elegida)** | Datos biométricos aislados con reglas propias; soporta picos de 500 registros a las 8:00; se integra por eventos ya probados | Un servicio más que desplegar y vigilar |

## Etapas

| Semana | Alcance | Responsable |
| --- | --- | --- |
| 2 al 6 de noviembre | Modelo de datos, servicio base y PWA con registro por QR en línea | Aldahir, con revisión de Germán |
| 9 al 13 de noviembre | Cola sin conexión y sincronización, geocercas y registro de tablets | Aldahir, con guía de Germán |
| 16 al 20 de noviembre | Cierre de día y semana, incidencias y prenómina básica | Aldahir y Germán |
| Posterior | Reconocimiento facial, préstamo entre obras, conceptos de prenómina con el contador | Germán lidera |

El reconocimiento facial va al final por ser lo más complejo y lo más sensible en datos personales; el QR cubre las cuadrillas grandes desde la primera etapa.

## Consecuencias

- La asistencia actual de Residencia no se corrige en JR-01: se reemplaza con este módulo.
- Se agrega el módulo a `MADUREZ.md` cuando exista su primer código.
- Pendiente con el contador: catálogo de conceptos complementarios de la prenómina.
