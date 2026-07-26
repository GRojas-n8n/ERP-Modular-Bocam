/**
 * ---------------------------------------------------------------------------
 * Propiedad Intelectual: Constructora Bocam, S. A. de C.V.
 * Hoja imprimible de credenciales de obra (frente + reverso, CR80, 2×5 por
 * página carta). QR y foto ya vienen resueltos como data URLs — esta función
 * no hace ninguna llamada de red, solo arma el HTML para imprimir/window.print().
 * ---------------------------------------------------------------------------
 */

export interface CredencialImprimible {
  numeroEmpleado: string;
  nombre: string;
  puesto: string;
  categoria: string;
  contactoEmergencia: string | null;
  vigenciaInicio: string; // ISO
  vigenciaFin: string;    // ISO
  qrDataUrl: string;
  fotoDataUrl: string | null;
}

const ROLE_COLOR: Record<string, string> = {
  OBRERO: '#c98a12',
  TECNICO: '#2c6e9e',
  SUPERVISOR: '#a8352f',
  ADMINISTRATIVO: '#6b6f70',
};

function initials(nombre: string): string {
  return nombre.trim().charAt(0).toUpperCase();
}

function fmt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}

export function construirHojaCredenciales(
  items: CredencialImprimible[],
  tenantNombre: string,
  tenantColor: string,
  proyectoNombre: string,
): string {
  const frentes = items.map((c, i) => `
    <div class="card front">
      <span class="idx">${i + 1}</span>
      <div class="band">
        <span class="brand">${esc(tenantNombre)}</span>
        <span class="doctype">Credencial de Obra</span>
      </div>
      <div class="front-body">
        <span class="role-pill" style="background:${ROLE_COLOR[c.categoria] ?? '#6b6f70'}">${esc(c.categoria)}</span>
        ${c.fotoDataUrl
          ? `<img class="photo" src="${c.fotoDataUrl}" alt="" />`
          : `<div class="photo" style="background:${ROLE_COLOR[c.categoria] ?? '#6b6f70'};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:12px;">${esc(initials(c.nombre))}</div>`}
        <div class="id-col">
          <p class="name">${esc(c.nombre)}</p>
          <p class="puesto">${esc(c.puesto)}</p>
          <div class="kv"><span class="k">No.</span> <span class="v">${esc(c.numeroEmpleado)}</span></div>
          <div class="kv" style="margin-top:1mm;"><span class="k">Proyecto</span><br><span class="v" style="font-size:6px;">${esc(proyectoNombre)}</span></div>
        </div>
        <div class="qr-wrap">
          <img src="${c.qrDataUrl}" style="width:8mm;height:8mm;" alt="QR" />
          <span>escanear</span>
        </div>
      </div>
    </div>
  `).join('');

  const reversos = items.map((c, i) => `
    <div class="card back">
      <span class="idx">${i + 1}</span>
      <div class="back-top">
        <span class="k">Vigencia</span>
        <span class="dates">${fmt(c.vigenciaInicio)} – ${fmt(c.vigenciaFin)}</span>
      </div>
      <div class="back-body">
        <div>
          <div class="label">Contacto de emergencia</div>
          <div class="contact">${c.contactoEmergencia ? esc(c.contactoEmergencia) : 'No registrado'}</div>
        </div>
        <p class="hse-note">Uso obligatorio de casco, botas y chaleco reflejante dentro del sitio. Esta credencial es personal e intransferible; repórtala de inmediato a RH si se pierde.</p>
        <div class="back-footer">
          <span>${esc(tenantNombre)}</span>
          <div class="sig"><div class="line"></div>Autorizó RH</div>
        </div>
      </div>
    </div>
  `).join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Credenciales de obra</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #eeece3; font-family: -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif; }
  .mono { font-family: ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", Consolas, monospace; }
  .toolbar { position: sticky; top: 0; z-index: 10; background: #fff; border-bottom: 1px solid #ddd; padding: 10px 16px; display: flex; gap: 10px; }
  .toolbar button { font: inherit; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; font-size: 11px; padding: 8px 14px; border-radius: 8px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
  .toolbar button.primary { background: ${tenantColor}; color: #fff; border-color: ${tenantColor}; }
  @media print { .toolbar { display: none; } body { background: #fff; } .page { box-shadow: none !important; margin: 0 !important; } .page { break-after: page; } }

  .page { width: 216mm; min-height: 279mm; margin: 20px auto; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.15); padding: 12.5mm 15mm; }
  .grid { display: grid; grid-template-columns: repeat(2, 85.6mm); grid-auto-rows: 54mm; gap: 5mm 4mm; justify-content: center; }
  .card { position: relative; width: 85.6mm; height: 54mm; border: 0.6pt dashed #cabfa8; border-radius: 2.6mm; overflow: hidden; background: #f5f2ea; color: #1b1e20; display: flex; flex-direction: column; }
  .idx { position: absolute; top: 1.6mm; left: 1.6mm; width: 4.2mm; height: 4.2mm; border-radius: 50%; background: rgba(0,0,0,.28); color: #fff; font-family: ui-monospace, monospace; font-size: 6.4px; font-weight: 700; display: flex; align-items: center; justify-content: center; z-index: 3; }
  .band { height: 8.4mm; background: ${tenantColor}; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 3mm; flex-shrink: 0; }
  .band .brand { font-size: 8px; font-weight: 800; letter-spacing: .04em; }
  .band .doctype { font-family: ui-monospace, monospace; font-size: 6px; letter-spacing: .12em; opacity: .85; text-transform: uppercase; }
  .front-body { flex: 1; display: grid; grid-template-columns: 15.5mm 1fr; gap: 2.6mm; padding: 2.4mm 3mm 2.2mm; position: relative; }
  .photo { width: 15.5mm; height: 18mm; border-radius: 1.4mm; object-fit: cover; align-self: start; }
  .id-col { min-width: 0; display: flex; flex-direction: column; }
  .id-col .name { font-size: 9.6px; font-weight: 800; line-height: 1.14; margin: 0 0 .6mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .id-col .puesto { font-size: 6.6px; text-transform: uppercase; letter-spacing: .06em; color: #5b5f5e; font-weight: 700; margin: 0 0 1.6mm; }
  .kv { font-size: 6.3px; line-height: 1.55; }
  .kv .k { text-transform: uppercase; letter-spacing: .07em; color: #8a8d89; font-weight: 700; }
  .kv .v { font-family: ui-monospace, monospace; color: #1b1e20; font-weight: 600; }
  .role-pill { position: absolute; top: 2.4mm; right: 3mm; font-size: 5.4px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; padding: .9mm 1.6mm; border-radius: 20px; color: #fff; line-height: 1; }
  .qr-wrap { position: absolute; right: 3mm; bottom: 2.2mm; display: flex; flex-direction: column; align-items: center; gap: .6mm; }
  .qr-wrap span { font-size: 4.6px; color: #8a8d89; letter-spacing: .06em; text-transform: uppercase; font-family: ui-monospace, monospace; }
  .card.back { background: #f5f2ea; }
  .back-top { height: 8.4mm; background: #dde7ee; display: flex; align-items: center; justify-content: space-between; padding: 0 3mm; flex-shrink: 0; border-bottom: .5pt solid #cabfa8; }
  .back-top .k { font-size: 5.6px; text-transform: uppercase; letter-spacing: .08em; color: ${tenantColor}; font-weight: 800; }
  .back-top .dates { font-size: 6.6px; font-family: ui-monospace, monospace; font-weight: 700; }
  .back-body { flex: 1; padding: 2.2mm 3mm; display: flex; flex-direction: column; gap: 1.8mm; }
  .back-body .label { font-size: 5.6px; text-transform: uppercase; letter-spacing: .07em; color: #8a8d89; font-weight: 700; }
  .back-body .contact { font-size: 7px; font-weight: 700; line-height: 1.35; }
  .hse-note { font-size: 5.7px; line-height: 1.5; color: #5b5f5e; border-top: .5pt dashed #cabfa8; padding-top: 1.6mm; }
  .back-footer { display: flex; justify-content: space-between; align-items: flex-end; font-size: 5px; color: #8a8d89; letter-spacing: .03em; }
  .back-footer .sig { text-align: right; }
  .back-footer .sig .line { width: 22mm; border-top: .5pt solid #8a8d89; margin-bottom: .8mm; }
</style>
</head>
<body>
  <div class="toolbar">
    <button class="primary" onclick="window.print()">Imprimir</button>
    <span style="align-self:center;font-size:11px;color:#666;">Página 1 = frentes · Página 2 = reversos · mismo orden para recortar y pegar</span>
  </div>
  <div class="page"><div class="grid">${frentes}</div></div>
  <div class="page"><div class="grid">${reversos}</div></div>
</body>
</html>`;
}
