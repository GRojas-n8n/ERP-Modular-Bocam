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

  // Listados en paralelo — con muchos insumos y GT caído, resolver uno por
  // uno haría esperar hasta insumoIdsUnicos.length * timeout antes de
  // degradar. En paralelo, el peor caso es una sola ventana de timeout.
  const fichasPorInsumo = await Promise.all(
    insumoIdsUnicos.map(insumoId =>
      axios
        .get(`${opts.gtUrl}/insumos/${insumoId}/fichas`, { headers, timeout })
        .then(r => (r.data?.data ?? []) as FichaTecnicaListItem[])
        .catch(() => [] as FichaTecnicaListItem[])
        .then(fichas => fichas.map(ficha => ({ insumoId, ficha })))
    )
  );

  // Descargas también en paralelo, por el mismo motivo.
  const adjuntos = await Promise.all(
    fichasPorInsumo.flat().map(({ insumoId, ficha }) =>
      axios
        .get(`${opts.gtUrl}/insumos/${insumoId}/fichas/${ficha.id_ficha}/descargar`, {
          headers, timeout, responseType: 'arraybuffer',
        })
        .then(r => ({ filename: ficha.nombre_doc, content: Buffer.from(r.data), contentType: ficha.mime_type } as AdjuntoExtra))
        .catch(() => null)
    )
  );

  return adjuntos.filter((a): a is AdjuntoExtra => a !== null);
}
