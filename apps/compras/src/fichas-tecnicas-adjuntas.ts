import axios from 'axios';
import type { AdjuntoExtra } from './mailer';

interface FichaTecnicaListItem {
  id_ficha: string;
  nombre_doc: string;
  mime_type: string;
}

interface ResolveFichasOpts {
  gtUrl: string;
  insumoIds: string[];
  authHeader?: string;
  tenantHeader?: string;
  proyectoHeader?: string;
  timeoutMs?: number;
}

/**
 * Resuelve las fichas técnicas de un conjunto de insumos como adjuntos de
 * correo listos para nodemailer. Best-effort: si Gerencia Técnica no
 * responde, o una ficha puntual no se puede descargar, esa ficha (o todas)
 * simplemente se omiten — nunca lanza.
 */
export async function resolveFichasTecnicasAdjuntas(opts: ResolveFichasOpts): Promise<AdjuntoExtra[]> {
  const timeout = opts.timeoutMs ?? 5000;
  const headers = {
    authorization: opts.authHeader,
    'x-tenant-id': opts.tenantHeader,
    'x-proyecto-id': opts.proyectoHeader,
  };

  const insumoIdsUnicos = Array.from(new Set(opts.insumoIds.filter(Boolean)));
  const adjuntos: AdjuntoExtra[] = [];

  for (const insumoId of insumoIdsUnicos) {
    const fichas = await axios
      .get(`${opts.gtUrl}/insumos/${insumoId}/fichas`, { headers, timeout })
      .then(r => (r.data?.data ?? []) as FichaTecnicaListItem[])
      .catch(() => [] as FichaTecnicaListItem[]);

    for (const ficha of fichas) {
      const buffer = await axios
        .get(`${opts.gtUrl}/insumos/${insumoId}/fichas/${ficha.id_ficha}/descargar`, {
          headers, timeout, responseType: 'arraybuffer',
        })
        .then(r => Buffer.from(r.data))
        .catch(() => null);

      if (buffer) {
        adjuntos.push({ filename: ficha.nombre_doc, content: buffer, contentType: ficha.mime_type });
      }
    }
  }

  return adjuntos;
}
