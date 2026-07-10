import nodemailer from 'nodemailer';
import { LOGO_PNG_BASE64 } from './logo-base64';
import { LOGO_BOCAM_PNG_BASE64 } from './logo-bocam-base64';

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

export type TemaCorreo = 'claro' | 'oscuro';

export interface ItemCotizacionEmail {
  partida: string;
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
  proyectoNombre: string;
  prioridad: string;
  diasHabiles: number;
  fechaSolicitud: Date;
  fechaLimite: Date;
  notasProveedor?: string | null;
  direccionEntrega?: string | null;
  items: ItemCotizacionEmail[];
  comprador: CompradorEmail;
}

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtFecha(d: Date): string {
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtHora(d: Date): string {
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMA CLARO — tarjeta minimalista sobre fondo gris claro
// ═══════════════════════════════════════════════════════════════════════════

const CLARO_INK = '#0f172a';
const CLARO_MUTED = '#64748b';
const CLARO_BORDER = '#e2e8f0';
const CLARO_ACCENT = '#0ea5c4';
const CLARO_HEADER_BG = '#0b1220';

function buildHtmlClaro(data: SolicitudCotizacionEmailData, proveedor: ProveedorContactoEmail): string {
  const filas = data.items.map((it, idx) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid ${CLARO_BORDER};font-size:13px;color:${CLARO_INK};${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${escapeHtml(it.descripcion)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${CLARO_BORDER};font-size:13px;color:${CLARO_INK};white-space:nowrap;${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${it.cantidad} ${escapeHtml(it.unidad || '')}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${CLARO_BORDER};font-size:12px;color:${CLARO_MUTED};${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${escapeHtml([it.marca_modelo, it.especificacion_detalle].filter(Boolean).join(' — ') || '—')}</td>
    </tr>`).join('');

  const direccionHtml = data.direccionEntrega ? `
    <tr>
      <td style="padding:16px 32px 0 32px;">
        <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CLARO_MUTED};">Dirección de entrega</p>
        <p style="margin:0;font-size:13px;color:${CLARO_INK};">${escapeHtml(data.direccionEntrega)}</p>
      </td>
    </tr>` : '';

  const notasHtml = data.notasProveedor ? `
    <tr>
      <td style="padding:20px 32px 0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
          <tr>
            <td style="padding:14px 16px;">
              <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#92400e;">Consideraciones</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:${CLARO_INK};white-space:pre-line;">${escapeHtml(data.notasProveedor)}</p>
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
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:92%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${CLARO_BORDER};">

            <!-- Header: doble logo -->
            <tr>
              <td style="background:${CLARO_HEADER_BG};padding:20px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="width:50%;"><img src="cid:iretum-logo" alt="Iretum" height="26" style="height:26px;display:block;border:0;" /></td>
                    <td align="right" style="width:50%;"><img src="cid:bocam-logo" alt="Constructora Bocam" height="16" style="height:16px;display:block;border:0;margin-left:auto;" /></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height:3px;background:${CLARO_ACCENT};line-height:0;font-size:0;">&nbsp;</td></tr>

            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CLARO_ACCENT};">Solicitud de Cotización</p>
                <h1 style="margin:0;font-size:21px;font-weight:800;color:${CLARO_INK};">Folio ${escapeHtml(data.folio)}</h1>
                <p style="margin:8px 0 0 0;font-size:13px;color:${CLARO_MUTED};">
                  Prioridad <strong style="color:${CLARO_INK};">${escapeHtml(data.prioridad)}</strong>
                  &nbsp;·&nbsp; Emitida el ${fmtFecha(data.fechaSolicitud)}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdff;border:1px solid #bae6fd;border-radius:8px;">
                  <tr>
                    <td style="padding:12px 16px;font-size:13px;color:${CLARO_INK};">
                      Favor de responder a más tardar el <strong>${fmtFecha(data.fechaLimite)}</strong> (${data.diasHabiles} días hábiles).
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="vertical-align:top;padding-right:10px;">
                      <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CLARO_MUTED};">Solicitado por</p>
                      <p style="margin:0;font-size:13px;font-weight:700;color:${CLARO_INK};">${escapeHtml(data.comprador.nombre)}</p>
                      <p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_MUTED};">Departamento de Compras</p>
                      <p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_MUTED};">Constructora Bocam, S.A. de C.V.</p>
                      <p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_ACCENT};">${escapeHtml(data.comprador.email)}</p>
                    </td>
                    <td width="50%" style="vertical-align:top;padding-left:10px;border-left:1px solid ${CLARO_BORDER};">
                      <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CLARO_MUTED};">Dirigido a</p>
                      <p style="margin:0;font-size:13px;font-weight:700;color:${CLARO_INK};">${escapeHtml(proveedor.razon_social)}</p>
                      ${proveedor.rfc_tax_id ? `<p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_MUTED};">RFC: ${escapeHtml(proveedor.rfc_tax_id)}</p>` : ''}
                      ${proveedor.ciudad ? `<p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_MUTED};">${escapeHtml(proveedor.ciudad)}</p>` : ''}
                      ${proveedor.telefono ? `<p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_MUTED};">Tel: ${escapeHtml(proveedor.telefono)}</p>` : ''}
                      <p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_ACCENT};">${escapeHtml(proveedor.email_contacto)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            ${direccionHtml}

            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0 0 8px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CLARO_MUTED};">Materiales / servicios a cotizar</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${CLARO_BORDER};border-radius:8px;overflow:hidden;">
                  <tr>
                    <td style="padding:9px 12px;background:${CLARO_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;">Descripción</td>
                    <td style="padding:9px 12px;background:${CLARO_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;white-space:nowrap;">Cantidad</td>
                    <td style="padding:9px 12px;background:${CLARO_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;">Especificaciones</td>
                  </tr>
                  ${filas}
                </table>
              </td>
            </tr>

            ${notasHtml}

            <tr>
              <td style="padding:28px 32px 24px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${CLARO_BORDER};">
                  <tr>
                    <td style="padding-top:16px;font-size:11px;line-height:1.6;color:${CLARO_MUTED};">
                      Este correo fue generado automáticamente por el ERP Industrial iretum.com. Favor de responder
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

// ═══════════════════════════════════════════════════════════════════════════
// TEMA OSCURO — industrial, doble logo, callout PDF obligatorio
// ═══════════════════════════════════════════════════════════════════════════

const OSC_BG = '#0F172A';
const OSC_CARD = '#1E293B';
const OSC_ACCENT = '#6366F1';
const OSC_BORDER = '#334155';
const OSC_MUTED = '#9CA3AF';
const OSC_HEAD_BG = '#111827';

function buildHtmlOscuro(data: SolicitudCotizacionEmailData, proveedor: ProveedorContactoEmail): string {
  const filas = data.items.map((it, idx) => `
                        <tr>
                          <td style="font-size:13px; color:#FFFFFF; padding:10px 12px; border-bottom:${idx === data.items.length - 1 ? 'none' : `1px solid ${OSC_BORDER}`};">${escapeHtml(it.partida)}</td>
                          <td style="font-size:13px; color:#FFFFFF; padding:10px 12px; border-bottom:${idx === data.items.length - 1 ? 'none' : `1px solid ${OSC_BORDER}`};">${escapeHtml([it.descripcion, it.especificacion_detalle].filter(Boolean).join(' — '))}</td>
                          <td align="right" style="font-size:13px; color:#FFFFFF; padding:10px 12px; border-bottom:${idx === data.items.length - 1 ? 'none' : `1px solid ${OSC_BORDER}`}; white-space:nowrap;">${it.cantidad}</td>
                          <td style="font-size:13px; color:#FFFFFF; padding:10px 12px; border-bottom:${idx === data.items.length - 1 ? 'none' : `1px solid ${OSC_BORDER}`};">${escapeHtml(it.unidad || '')}</td>
                          <td style="font-size:12px; color:${OSC_MUTED}; padding:10px 12px; border-bottom:${idx === data.items.length - 1 ? 'none' : `1px solid ${OSC_BORDER}`};">${escapeHtml(it.marca_modelo || '—')}</td>
                        </tr>`).join('');

  const direccionRow = data.direccionEntrega ? `
                <tr>
                  <td colspan="2" style="padding-top:4px;">
                    <span style="display:block; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${OSC_MUTED}; padding-bottom:4px;">Dirección de entrega</span>
                    <span style="font-size:14px; color:#FFFFFF;">${escapeHtml(data.direccionEntrega)}</span>
                  </td>
                </tr>` : '';

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Solicitud de Cotización ${escapeHtml(data.folio)}</title>
<style>
  body, table, td { font-family: Arial, Helvetica, sans-serif; }
  body { margin:0; padding:0; }
  table { border-collapse:collapse; }
  img { border:0; line-height:100%; outline:none; text-decoration:none; }
  @media screen and (max-width: 600px) {
    .rfq-container { width:100% !important; border-radius:0 !important; }
    .rfq-px { padding-left:20px !important; padding-right:20px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:${OSC_BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${OSC_BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">

          <tr>
            <td class="rfq-container rfq-px" style="background-color:${OSC_CARD}; border-radius:12px 12px 0 0; padding:24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="width:50%; vertical-align:middle;"><img src="cid:iretum-logo" alt="iretum" height="30" style="height:30px; display:block;" /></td>
                  <td align="right" style="width:50%; vertical-align:middle;"><img src="cid:bocam-logo" alt="Constructora Bocam" height="18" style="height:18px; display:block; margin-left:auto;" /></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:${OSC_CARD}; padding:0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="height:2px; line-height:2px; font-size:2px; background-color:${OSC_ACCENT};">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="rfq-container rfq-px" style="background-color:${OSC_CARD}; padding:32px; border-radius:0 0 12px 12px;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding-bottom:4px;"><span style="font-size:11px; font-weight:700; letter-spacing:0.10em; text-transform:uppercase; color:${OSC_ACCENT};">Solicitud de Cotización</span></td></tr>
                <tr><td style="padding-bottom:18px;"><span style="font-size:22px; font-weight:700; color:#FFFFFF;">Folio ${escapeHtml(data.folio)}</span></td></tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:20px; font-size:14px; line-height:22px; color:#FFFFFF;">
                    Estimado(a) <strong>${escapeHtml(proveedor.razon_social)}</strong>,
                    <br /><br />
                    <span style="color:${OSC_MUTED};">
                      Constructora Bocam solicita su cotización para el proyecto <strong style="color:#FFFFFF;">${escapeHtml(data.proyectoNombre)}</strong>.
                      Le pedimos revisar cuidadosamente las partidas y especificaciones técnicas detalladas a continuación.
                    </span>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border:1px solid ${OSC_ACCENT}; border-radius:10px; padding:16px 18px; background-color:rgba(99,102,241,0.08);">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="28" valign="top" style="padding-right:10px;"><span style="font-size:16px;">📄</span></td>
                        <td style="font-size:13px; line-height:20px; color:#FFFFFF;">
                          Su propuesta debe enviarse obligatoriamente en <strong style="color:${OSC_ACCENT};">formato PDF</strong>,
                          considerando estrictamente las especificaciones técnicas indicadas para cada partida. No se aceptarán
                          cotizaciones en formatos distintos ni que omitan las especificaciones solicitadas.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr><td style="padding-bottom:10px;"><span style="font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${OSC_MUTED};">Partidas a cotizar</span></td></tr>
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${OSC_BORDER}; border-radius:8px; overflow:hidden;">
                      <thead>
                        <tr>
                          <th align="left"  style="font-size:10px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:${OSC_MUTED}; background-color:${OSC_HEAD_BG}; padding:10px 12px; border-bottom:1px solid ${OSC_BORDER};">Partida</th>
                          <th align="left"  style="font-size:10px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:${OSC_MUTED}; background-color:${OSC_HEAD_BG}; padding:10px 12px; border-bottom:1px solid ${OSC_BORDER};">Descripción / Especificación Técnica</th>
                          <th align="right" style="font-size:10px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:${OSC_MUTED}; background-color:${OSC_HEAD_BG}; padding:10px 12px; border-bottom:1px solid ${OSC_BORDER}; white-space:nowrap;">Cantidad</th>
                          <th align="left"  style="font-size:10px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:${OSC_MUTED}; background-color:${OSC_HEAD_BG}; padding:10px 12px; border-bottom:1px solid ${OSC_BORDER};">Unidad</th>
                          <th align="left"  style="font-size:10px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:${OSC_MUTED}; background-color:${OSC_HEAD_BG}; padding:10px 12px; border-bottom:1px solid ${OSC_BORDER};">Marca / Modelo de Referencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${filas}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px; border-top:1px solid ${OSC_BORDER};">
                <tr><td style="height:20px; line-height:20px; font-size:0;">&nbsp;</td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" valign="top" style="padding-right:10px; padding-bottom:16px;">
                    <span style="display:block; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${OSC_MUTED}; padding-bottom:4px;">Fecha límite de respuesta</span>
                    <span style="font-size:14px; font-weight:700; color:#FFFFFF;">${fmtFecha(data.fechaLimite)} — ${fmtHora(data.fechaLimite)} h</span>
                  </td>
                  <td width="50%" valign="top" style="padding-left:10px; padding-bottom:16px; border-left:1px solid ${OSC_BORDER};">
                    <span style="display:block; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${OSC_MUTED}; padding-bottom:4px;">Prioridad</span>
                    <span style="font-size:14px; font-weight:700; color:#FFFFFF;">${escapeHtml(data.prioridad)}</span>
                  </td>
                </tr>
                ${direccionRow}
              </table>

              ${data.notasProveedor ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border:1px solid ${OSC_BORDER}; border-radius:8px; padding:14px 16px; background-color:#111827;">
                    <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${OSC_MUTED};">Consideraciones</p>
                    <p style="margin:0;font-size:13px;line-height:1.6;color:#FFFFFF;white-space:pre-line;">${escapeHtml(data.notasProveedor)}</p>
                  </td>
                </tr>
              </table>` : ''}

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-top:8px; font-size:13px; line-height:20px; color:${OSC_MUTED};">
                    Quedamos atentos a su propuesta. Cualquier duda, favor de responder directamente a este correo.
                    <br /><br />
                    Atentamente,<br />
                    <strong style="color:#FFFFFF;">${escapeHtml(data.comprador.nombre)}</strong><br />
                    Departamento de Compras — Constructora Bocam
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 32px 32px;">
              <span style="font-size:11px; line-height:18px; color:#6B7280;">
                Este correo fue generado automáticamente por el ERP Industrial iretum.com.
              </span>
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
  data: SolicitudCotizacionEmailData,
  tema: TemaCorreo = 'claro'
): Promise<{ enviado: boolean; error?: string }> {
  const t = getTransporter();
  if (!t) {
    return { enviado: false, error: 'SMTP no configurado (SMTP_HOST/SMTP_USER/SMTP_PASS faltantes).' };
  }
  try {
    const html = tema === 'oscuro' ? buildHtmlOscuro(data, proveedor) : buildHtmlClaro(data, proveedor);
    await t.sendMail({
      from: `"Compras · Constructora Bocam" <${SMTP_FROM}>`,
      to: proveedor.email_contacto,
      subject: `Solicitud de Cotización ${data.folio} — Constructora Bocam`,
      html,
      attachments: [
        { filename: 'iretum-logo.png', content: Buffer.from(LOGO_PNG_BASE64, 'base64'), cid: 'iretum-logo', contentType: 'image/png' },
        { filename: 'bocam-logo.png', content: Buffer.from(LOGO_BOCAM_PNG_BASE64, 'base64'), cid: 'bocam-logo', contentType: 'image/png' },
      ],
    });
    return { enviado: true };
  } catch (err: any) {
    return { enviado: false, error: err?.message || 'Error desconocido al enviar correo.' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Correo de Orden de Compra — ver openspec/changes/envio-oc-correo-proveedores
// ═══════════════════════════════════════════════════════════════════════════

export interface OrdenCompraResumenEmail {
  codigo: string;
  fecha_emision: Date;
  subtotal: number;
  iva: number;
  total: number;
}

export interface OrdenCompraPdfAdjunto {
  codigo: string;
  buffer: Buffer;
}

const fmtMoneda = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

function buildHtmlOrdenCompra(ordenes: OrdenCompraResumenEmail[], proveedor: ProveedorContactoEmail): string {
  const filas = ordenes.map((oc, idx) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid ${CLARO_BORDER};font-size:13px;font-weight:700;color:${CLARO_INK};${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${escapeHtml(oc.codigo)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${CLARO_BORDER};font-size:13px;color:${CLARO_INK};white-space:nowrap;${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${fmtFecha(oc.fecha_emision)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${CLARO_BORDER};font-size:13px;color:${CLARO_INK};text-align:right;white-space:nowrap;${idx % 2 === 1 ? `background:#f8fafc;` : ''}">${fmtMoneda(oc.total)}</td>
    </tr>`).join('');

  const asuntoLista = ordenes.map(o => o.codigo).join(', ');

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#eef2f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:92%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${CLARO_BORDER};">

            <tr>
              <td style="background:${CLARO_HEADER_BG};padding:20px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="left" style="width:50%;"><img src="cid:iretum-logo" alt="Iretum" height="26" style="height:26px;display:block;border:0;" /></td>
                    <td align="right" style="width:50%;"><img src="cid:bocam-logo" alt="Constructora Bocam" height="16" style="height:16px;display:block;border:0;margin-left:auto;" /></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height:3px;background:${CLARO_ACCENT};line-height:0;font-size:0;">&nbsp;</td></tr>

            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CLARO_ACCENT};">Orden${ordenes.length > 1 ? 'es' : ''} de Compra</p>
                <h1 style="margin:0;font-size:21px;font-weight:800;color:${CLARO_INK};">${escapeHtml(asuntoLista)}</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px 0 32px;">
                <p style="margin:0 0 6px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CLARO_MUTED};">Dirigido a</p>
                <p style="margin:0;font-size:13px;font-weight:700;color:${CLARO_INK};">${escapeHtml(proveedor.razon_social)}</p>
                ${proveedor.rfc_tax_id ? `<p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_MUTED};">RFC: ${escapeHtml(proveedor.rfc_tax_id)}</p>` : ''}
                <p style="margin:2px 0 0 0;font-size:12px;color:${CLARO_ACCENT};">${escapeHtml(proveedor.email_contacto)}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 0 32px;">
                <p style="margin:0 0 8px 0;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CLARO_MUTED};">Órdenes de compra adjuntas</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${CLARO_BORDER};border-radius:8px;overflow:hidden;">
                  <tr>
                    <td style="padding:9px 12px;background:${CLARO_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;">Código</td>
                    <td style="padding:9px 12px;background:${CLARO_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;">Fecha de emisión</td>
                    <td style="padding:9px 12px;background:${CLARO_INK};font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#ffffff;text-align:right;">Total</td>
                  </tr>
                  ${filas}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 24px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${CLARO_BORDER};">
                  <tr>
                    <td style="padding-top:16px;font-size:11px;line-height:1.6;color:${CLARO_MUTED};">
                      Este correo fue generado automáticamente por el ERP Industrial iretum.com. El PDF de cada
                      Orden de Compra va adjunto a este mensaje. Favor de confirmar recepción respondiendo
                      directamente a este correo.
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
 * Envía a un proveedor un correo con una o más Órdenes de Compra adjuntas
 * (un solo correo agrupando todas las OC seleccionadas de ese proveedor, ver
 * capability envio-oc-proveedor). No lanza excepción si falla (best-effort)
 * — retorna { enviado, error }. `transporterOverride` existe únicamente para
 * pruebas (inyecta un transporte `jsonTransport` en vez del SMTP real).
 */
export async function enviarOrdenCompraEmail(
  proveedor: ProveedorContactoEmail,
  ordenes: OrdenCompraResumenEmail[],
  pdfs: OrdenCompraPdfAdjunto[],
  transporterOverride?: nodemailer.Transporter,
): Promise<{ enviado: boolean; error?: string }> {
  const t = transporterOverride ?? getTransporter();
  if (!t) {
    return { enviado: false, error: 'SMTP no configurado (SMTP_HOST/SMTP_USER/SMTP_PASS faltantes).' };
  }
  try {
    const html = buildHtmlOrdenCompra(ordenes, proveedor);
    const asuntoLista = ordenes.map(o => o.codigo).join(', ');
    await t.sendMail({
      from: `"Compras · Constructora Bocam" <${SMTP_FROM}>`,
      to: proveedor.email_contacto,
      subject: `Orden${ordenes.length > 1 ? 'es' : ''} de Compra ${asuntoLista} — Constructora Bocam`,
      html,
      attachments: [
        { filename: 'iretum-logo.png', content: Buffer.from(LOGO_PNG_BASE64, 'base64'), cid: 'iretum-logo', contentType: 'image/png' },
        { filename: 'bocam-logo.png', content: Buffer.from(LOGO_BOCAM_PNG_BASE64, 'base64'), cid: 'bocam-logo', contentType: 'image/png' },
        ...pdfs.map(p => ({ filename: `${p.codigo}.pdf`, content: p.buffer, contentType: 'application/pdf' })),
      ],
    });
    return { enviado: true };
  } catch (err: any) {
    return { enviado: false, error: err?.message || 'Error desconocido al enviar correo.' };
  }
}
