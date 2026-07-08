import nodemailer from 'nodemailer';
import { LOGO_PNG_BASE64 } from './logo-base64';

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

export interface CompradorEmail {
  nombre: string;
  email: string;
}

export interface ProveedorContactoEmail {
  razon_social: string;
  rfc_tax_id?: string | null;
  email_contacto: string;
  telefono?: string | null;
  ciudad?: string | null;
}

export interface SolicitudCotizacionEmailData {
  folio: string;
  prioridad: string;
  diasHabiles: number;
  fechaSolicitud: Date;
  fechaLimite: Date;
  notasProveedor?: string | null; // notas para el proveedor (observaciones de la req + notas del RFQ)
  items: ItemCotizacionEmail[];
  comprador: CompradorEmail;
}

const COLOR_INK = '#0f172a';
const COLOR_MUTED = '#64748b';
const COLOR_BORDER = '#e2e8f0';
const COLOR_ACCENT = '#0ea5c4';
const COLOR_HEADER_BG = '#0b1220';

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtFecha(d: Date): string {
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function buildHtml(data: SolicitudCotizacionEmailData, proveedor: ProveedorContactoEmail): string {
  const filas = data.items.map((it, idx) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLOR_BORDER};font-size:13px;color:${COLOR_INK};${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${escapeHtml(it.descripcion)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLOR_BORDER};font-size:13px;color:${COLOR_INK};white-space:nowrap;${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${it.cantidad} ${escapeHtml(it.unidad || '')}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${COLOR_BORDER};font-size:12px;color:${COLOR_MUTED};${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${escapeHtml([it.marca_modelo, it.especificacion_detalle].filter(Boolean).join(' — ') || '—')}</td>
    </tr>`).join('');

  const notasHtml = data.notasProveedor ? `
    <tr>
      <td style="padding:20px 32px 0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
          <tr>
            <td style="padding:14px 16px;">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#92400e;">Consideraciones</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:${COLOR_INK};white-space:pre-line;">${escapeHtml(data.notasProveedor)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '';

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:92%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${COLOR_BORDER};">

            <!-- Header -->
            <tr>
              <td style="background:${COLOR_HEADER_BG};padding:22px 32px;">
                <img src="cid:iretum-logo" alt="Iretum" height="28" style="height:28px;display:block;border:0;" />
              </td>
            </tr>
            <tr><td style="height:3px;background:${COLOR_ACCENT};line-height:0;font-size:0;">&nbsp;</td></tr>

            <!-- Titulo -->
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${COLOR_ACCENT};">Solicitud de Cotización</p>
                <h1 style="margin:0;font-size:21px;font-weight:800;color:${COLOR_INK};">Folio ${escapeHtml(data.folio)}</h1>
                <p style="margin:8px 0 0 0;font-size:13px;color:${COLOR_MUTED};">
                  Prioridad <strong style="color:${COLOR_INK};">${escapeHtml(data.prioridad)}</strong>
                  &nbsp;·&nbsp; Emitida el ${fmtFecha(data.fechaSolicitud)}
                </p>
              </td>
            </tr>

            <!-- Plazo -->
            <tr>
              <td style="padding:12px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdff;border:1px solid #bae6fd;border-radius:8px;">
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:${COLOR_INK};">
                      Favor de responder a más tardar el <strong>${fmtFecha(data.fechaLimite)}</strong> (${data.diasHabiles} días hábiles).
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Comprador / Proveedor -->
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="vertical-align:top;padding-right:10px;">
                      <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${COLOR_MUTED};">Solicitado por</p>
                      <p style="margin:0;font-size:13px;font-weight:700;color:${COLOR_INK};">${escapeHtml(data.comprador.nombre)}</p>
                      <p style="margin:2px 0 0 0;font-size:12px;color:${COLOR_MUTED};">Departamento de Compras</p>
                      <p style="margin:2px 0 0 0;font-size:12px;color:${COLOR_MUTED};">Constructora Bocam, S.A. de C.V.</p>
                      <p style="margin:2px 0 0 0;font-size:12px;color:${COLOR_ACCENT};">${escapeHtml(data.comprador.email)}</p>
                    </td>
                    <td width="50%" style="vertical-align:top;padding-left:10px;border-left:1px solid ${COLOR_BORDER};">
                      <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${COLOR_MUTED};">Dirigido a</p>
                      <p style="margin:0;font-size:13px;font-weight:700;color:${COLOR_INK};">${escapeHtml(proveedor.razon_social)}</p>
                      ${proveedor.rfc_tax_id ? `<p style="margin:2px 0 0 0;font-size:12px;color:${COLOR_MUTED};">RFC: ${escapeHtml(proveedor.rfc_tax_id)}</p>` : ''}
                      ${proveedor.ciudad ? `<p style="margin:2px 0 0 0;font-size:12px;color:${COLOR_MUTED};">${escapeHtml(proveedor.ciudad)}</p>` : ''}
                      ${proveedor.telefono ? `<p style="margin:2px 0 0 0;font-size:12px;color:${COLOR_MUTED};">Tel: ${escapeHtml(proveedor.telefono)}</p>` : ''}
                      <p style="margin:2px 0 0 0;font-size:12px;color:${COLOR_ACCENT};">${escapeHtml(proveedor.email_contacto)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Items -->
            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0 0 8px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${COLOR_MUTED};">Materiales / servicios a cotizar</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${COLOR_BORDER};border-radius:8px;overflow:hidden;">
                  <tr>
                    <td style="padding:9px 12px;background:${COLOR_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;">Descripción</td>
                    <td style="padding:9px 12px;background:${COLOR_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;white-space:nowrap;">Cantidad</td>
                    <td style="padding:9px 12px;background:${COLOR_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;">Especificaciones</td>
                  </tr>
                  ${filas}
                </table>
              </td>
            </tr>

            ${notasHtml}

            <!-- Footer -->
            <tr>
              <td style="padding:28px 32px 24px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${COLOR_BORDER};">
                  <tr>
                    <td style="padding-top:16px;font-size:11px;line-height:1.6;color:${COLOR_MUTED};">
                      Este correo fue generado automáticamente por el ERP de Constructora Bocam. Favor de responder
                      directamente a este correo con su propuesta de cotización.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Envía la solicitud de cotización a un proveedor. No lanza excepción si falla
 * (best-effort) — retorna { enviado, error } para que el caller reporte el resultado.
 */
export async function enviarSolicitudCotizacionEmail(
  proveedor: ProveedorContactoEmail,
  data: SolicitudCotizacionEmailData
): Promise<{ enviado: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { enviado: false, error: 'SMTP no configurado (SMTP_HOST/SMTP_USER/SMTP_PASS faltantes).' };
  }
  try {
    await t.sendMail({
      from: `"Compras · Constructora Bocam" <${SMTP_FROM}>`,
      to: proveedor.email_contacto,
      subject: `Solicitud de Cotización ${data.folio} — Constructora Bocam`,
      html: buildHtml(data, proveedor),
      attachments: [
        {
          filename: 'iretum-logo.png',
          content: Buffer.from(LOGO_PNG_BASE64, 'base64'),
          cid: 'iretum-logo',
          contentType: 'image/png',
        },
      ],
    });
    return { enviado: true };
  } catch (err: any) {
    return { enviado: false, error: err?.message || 'Error desconocido al enviar correo.' };
  }
}
