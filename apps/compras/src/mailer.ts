import nodemailer from 'nodemailer';

/**
 * -----------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Módulo: Compras — Envío de Solicitudes de Cotización por correo
 * -----------------------------------------------------------------------------
 */

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export interface ItemCotizacionEmail {
  descripcion: string;
  cantidad: number;
  unidad: string;
  marca_modelo?: string | null;
  especificacion_detalle?: string | null;
}

export interface SolicitudCotizacionEmailData {
  folio: string;
  prioridad: string;
  diasHabiles: number;
  fechaLimite: Date;
  notasProveedor?: string | null; // notas para el proveedor (observaciones de la req + notas del RFQ)
  items: ItemCotizacionEmail[];
}

function buildHtml(data: SolicitudCotizacionEmailData, proveedorNombre: string): string {
  const filas = data.items.map(it => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml(it.descripcion)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${it.cantidad} ${escapeHtml(it.unidad || '')}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${escapeHtml([it.marca_modelo, it.especificacion_detalle].filter(Boolean).join(' — ') || '—')}</td>
    </tr>`).join('');

  const notasHtml = data.notasProveedor
    ? `<div style="margin-top:16px;padding:12px 14px;background:#fef3c7;border-left:4px solid #d97706;border-radius:4px;">
         <strong>Consideraciones:</strong><br/>
         <span style="white-space:pre-line;">${escapeHtml(data.notasProveedor)}</span>
       </div>`
    : '';

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;max-width:640px;margin:0 auto;">
    <h2 style="color:#0f172a;">Solicitud de Cotización — ${escapeHtml(data.folio)}</h2>
    <p>Estimados <strong>${escapeHtml(proveedorNombre)}</strong>,</p>
    <p>Constructora Bocam les solicita cotización para los siguientes materiales/servicios. Por favor respondan a más tardar el
      <strong>${data.fechaLimite.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
      (${data.diasHabiles} días hábiles) — prioridad <strong>${escapeHtml(data.prioridad)}</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <thead>
        <tr style="background:#f1f5f9;text-align:left;">
          <th style="padding:8px 10px;">Descripción</th>
          <th style="padding:8px 10px;">Cantidad</th>
          <th style="padding:8px 10px;">Especificaciones / Marca</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
    ${notasHtml}
    <p style="margin-top:20px;color:#6b7280;font-size:12px;">
      Este correo fue generado automáticamente por el sistema ERP de Constructora Bocam. Favor de responder directamente
      a este correo con su cotización.
    </p>
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Envía la solicitud de cotización a un proveedor. No lanza excepción si falla
 * (best-effort) — retorna { enviado, error } para que el caller reporte el resultado.
 */
export async function enviarSolicitudCotizacionEmail(
  proveedorEmail: string,
  proveedorNombre: string,
  data: SolicitudCotizacionEmailData
): Promise<{ enviado: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { enviado: false, error: 'SMTP no configurado (SMTP_HOST/SMTP_USER/SMTP_PASS faltantes).' };
  }
  try {
    await t.sendMail({
      from: `"Compras Bocam" <${SMTP_FROM}>`,
      to: proveedorEmail,
      subject: `Solicitud de Cotización ${data.folio} — Constructora Bocam`,
      html: buildHtml(data, proveedorNombre),
    });
    return { enviado: true };
  } catch (err: any) {
    return { enviado: false, error: err?.message || 'Error desconocido al enviar correo.' };
  }
}
