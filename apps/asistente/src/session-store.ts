import { randomUUID } from 'node:crypto';
import { createClient, type RedisClientType } from 'redis';
import { requireEnv } from '../../../packages/auth-middleware/src';
import type { MensajeConversacion } from './types';

// TTL de inactividad de una conversación — se renueva en cada turno (ver design.md D3)
const TTL_SEGUNDOS = 30 * 60;
const PREFIJO_CLAVE = 'asistente:conversacion';

function construirClave(tenantId: string, conversacionId: string): string {
  return `${PREFIJO_CLAVE}:${tenantId}:${conversacionId}`;
}

let redisClient: RedisClientType | null = null;
let conexion: Promise<RedisClientType> | null = null;

async function obtenerCliente(): Promise<RedisClientType> {
  if (redisClient?.isOpen) return redisClient;

  if (!conexion) {
    const REDIS_URL = requireEnv('REDIS_URL');
    const client = createClient({
      url: REDIS_URL,
      socket: {
        // Máximo 3 reintentos con 500ms entre ellos — mismo patrón que apps/auth
        reconnectStrategy: (retries) => (retries >= 3 ? false : 500),
      },
    }) as RedisClientType;

    client.on('error', (err) => console.error('[Asistente] Redis session-store error:', err.message));

    conexion = client.connect().then(() => {
      redisClient = client;
      return client;
    });
  }

  return conexion;
}

export function crearConversacionId(): string {
  return randomUUID();
}

// tenantId SHALL provenir de req.securityContext.tenantId (JWT verificado), nunca del cliente —
// es lo único que garantiza que un conversacion_id no sea legible desde otro tenant.
export async function getConversacion(
  tenantId: string,
  conversacionId: string,
): Promise<MensajeConversacion[] | null> {
  if (!tenantId || !conversacionId) return null;

  const client = await obtenerCliente();
  const raw = await client.get(construirClave(tenantId, conversacionId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as MensajeConversacion[];
  } catch (err) {
    console.error('[Asistente] Historial de conversación corrupto, se descarta:', (err as Error).message);
    return null;
  }
}

// mensajes SHALL ser el historial completo del turno — la API de Claude es stateless.
export async function guardarTurno(
  tenantId: string,
  conversacionId: string,
  mensajes: MensajeConversacion[],
): Promise<void> {
  const client = await obtenerCliente();
  await client.set(construirClave(tenantId, conversacionId), JSON.stringify(mensajes), {
    EX: TTL_SEGUNDOS,
  });
}
