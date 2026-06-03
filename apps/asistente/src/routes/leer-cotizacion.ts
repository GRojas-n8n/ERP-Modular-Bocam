import { Router, Request, Response } from 'express';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import { requireRoles } from '../../../../packages/auth-middleware/src';
import { logError, logInfo } from '../../../../packages/observability/src';
import { SYSTEM_LEER_COTIZACION } from '../prompts';
import type { LecturaCotizacionResult } from '../types';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('SOLO_PDF'));
  },
});

function buildClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    timeout: Number(process.env.ANTHROPIC_TIMEOUT_MS ?? 30000),
  });
}

router.post(
  '/api/v1/asistente/leer-cotizacion',
  requireRoles('procurement', 'admin'),
  (req: Request, res: Response, next) => {
    upload.single('cotizacion')(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'El PDF supera el límite de 10 MB.' });
      }
      if (err && (err as Error).message === 'SOLO_PDF') {
        return res.status(400).json({ success: false, message: 'Solo se aceptan archivos PDF.' });
      }
      if (err) return next(err);
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Se requiere el campo cotizacion (PDF).' });
      }

      const pdfBase64 = req.file.buffer.toString('base64');
      const proveedorNombre: string = (req.body as { proveedor_nombre?: string }).proveedor_nombre ?? '';

      const userContent = proveedorNombre
        ? `Extrae los renglones de esta cotización del proveedor: ${proveedorNombre}`
        : 'Extrae todos los renglones de esta cotización.';

      const anthropic = buildClient();
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [SYSTEM_LEER_COTIZACION],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: pdfBase64,
                },
              },
              { type: 'text', text: userContent },
            ],
          },
        ],
      });

      const raw = message.content[0];
      if (raw.type !== 'text') throw new Error('Respuesta inesperada de Claude.');

      let parsed: LecturaCotizacionResult;
      try {
        parsed = JSON.parse(raw.text) as LecturaCotizacionResult;
      } catch {
        const jsonMatch = raw.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Claude no devolvió JSON válido.');
        parsed = JSON.parse(jsonMatch[0]) as LecturaCotizacionResult;
      }

      logInfo(req, 'asistente', 'asistente.leer-cotizacion.ok', 'Cotización extraída', {
        renglones: parsed.renglones?.length ?? 0,
      });

      return res.json({ success: true, data: parsed });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const isTimeout = msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('timed out');
      logError(req, 'asistente', 'asistente.leer-cotizacion.error', 'Error al leer cotización', { error_message: msg });
      return res.status(isTimeout ? 503 : 500).json({
        success: false,
        message: isTimeout ? 'El servicio de IA no respondió a tiempo. Intenta de nuevo.' : msg,
      });
    }
  },
);

export default router;
