import test from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import { enviarOrdenCompraEmail, OrdenCompraResumenEmail, OrdenCompraPdfAdjunto, ProveedorContactoEmail } from './mailer';

const proveedor: ProveedorContactoEmail = {
  razon_social: 'Aceros del Norte SA de CV',
  rfc_tax_id: 'ADN010101AAA',
  email_contacto: 'compras@acerosdelnorte.example',
};

function fakePdf(nombre: string): OrdenCompraPdfAdjunto {
  return { codigo: nombre, buffer: Buffer.from(`%PDF-fake-${nombre}`) };
}

test('enviarOrdenCompraEmail: una sola OC — asunto, destinatario y PDF adjunto correctos', async () => {
  const transporter = nodemailer.createTransport({ jsonTransport: true });
  const ordenes: OrdenCompraResumenEmail[] = [
    { codigo: 'OC-AUTO-1-1', fecha_emision: new Date('2026-07-10'), subtotal: 1000, iva: 160, total: 1160 },
  ];

  const result = await enviarOrdenCompraEmail(proveedor, ordenes, [fakePdf('OC-AUTO-1-1')], transporter);

  assert.equal(result.enviado, true);
});

test('enviarOrdenCompraEmail: el mensaje construido contiene destinatario, asunto con el codigo de OC, y 1 PDF adjunto (mas los 2 logos)', async () => {
  let capturado: any = null;
  const transporter = nodemailer.createTransport({
    jsonTransport: true,
  });
  const originalSendMail = transporter.sendMail.bind(transporter);
  transporter.sendMail = (async (mailOptions: any) => {
    capturado = mailOptions;
    return originalSendMail(mailOptions);
  }) as typeof transporter.sendMail;

  const ordenes: OrdenCompraResumenEmail[] = [
    { codigo: 'OC-AUTO-1-1', fecha_emision: new Date('2026-07-10'), subtotal: 1000, iva: 160, total: 1160 },
  ];

  await enviarOrdenCompraEmail(proveedor, ordenes, [fakePdf('OC-AUTO-1-1')], transporter);

  assert.equal(capturado.to, proveedor.email_contacto);
  assert.match(capturado.subject, /OC-AUTO-1-1/);
  assert.equal(capturado.attachments.length, 3); // 2 logos + 1 PDF
  const pdfAdjunto = capturado.attachments.find((a: any) => a.filename === 'OC-AUTO-1-1.pdf');
  assert.ok(pdfAdjunto, 'debe incluir el PDF de la OC como adjunto');
  assert.equal(pdfAdjunto.contentType, 'application/pdf');
});

test('enviarOrdenCompraEmail: dos OC del mismo proveedor — un solo correo con 2 PDFs adjuntos y ambos codigos en el asunto', async () => {
  let capturado: any = null;
  const transporter = nodemailer.createTransport({ jsonTransport: true });
  const originalSendMail = transporter.sendMail.bind(transporter);
  transporter.sendMail = (async (mailOptions: any) => {
    capturado = mailOptions;
    return originalSendMail(mailOptions);
  }) as typeof transporter.sendMail;

  const ordenes: OrdenCompraResumenEmail[] = [
    { codigo: 'OC-AUTO-1-1', fecha_emision: new Date('2026-07-10'), subtotal: 1000, iva: 160, total: 1160 },
    { codigo: 'OC-AUTO-1-2', fecha_emision: new Date('2026-07-10'), subtotal: 500, iva: 80, total: 580 },
  ];

  const result = await enviarOrdenCompraEmail(
    proveedor,
    ordenes,
    [fakePdf('OC-AUTO-1-1'), fakePdf('OC-AUTO-1-2')],
    transporter,
  );

  assert.equal(result.enviado, true);
  assert.match(capturado.subject, /OC-AUTO-1-1/);
  assert.match(capturado.subject, /OC-AUTO-1-2/);
  assert.equal(capturado.attachments.length, 4); // 2 logos + 2 PDFs
  assert.ok(capturado.attachments.some((a: any) => a.filename === 'OC-AUTO-1-1.pdf'));
  assert.ok(capturado.attachments.some((a: any) => a.filename === 'OC-AUTO-1-2.pdf'));
});

test('enviarOrdenCompraEmail: SMTP no configurado (sin transporter y sin env vars) retorna enviado:false sin lanzar', async () => {
  const originales = { host: process.env.SMTP_HOST, user: process.env.SMTP_USER, pass: process.env.SMTP_PASS };
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;

  try {
    const ordenes: OrdenCompraResumenEmail[] = [
      { codigo: 'OC-AUTO-1-1', fecha_emision: new Date('2026-07-10'), subtotal: 1000, iva: 160, total: 1160 },
    ];

    const result = await enviarOrdenCompraEmail(proveedor, ordenes, [fakePdf('OC-AUTO-1-1')]);

    assert.equal(result.enviado, false);
    assert.match(result.error ?? '', /SMTP no configurado/);
  } finally {
    if (originales.host !== undefined) process.env.SMTP_HOST = originales.host;
    if (originales.user !== undefined) process.env.SMTP_USER = originales.user;
    if (originales.pass !== undefined) process.env.SMTP_PASS = originales.pass;
  }
});
