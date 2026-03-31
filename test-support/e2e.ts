import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

interface TokenOptions {
  userId: string;
  tenantId: string;
  proyectoId: string;
  roles?: string[];
  projects?: string[];
  name?: string;
  email?: string;
  limiteAprobacion?: number;
}

export function signTenantToken(options: TokenOptions): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET es obligatorio para ejecutar pruebas E2E.');
  }

  return jwt.sign(
    {
      sub: options.userId,
      tenant_id: options.tenantId,
      proyecto_id: options.proyectoId,
      roles: options.roles || ['admin'],
      projects: options.projects || [options.proyectoId],
      name: options.name || 'E2E User',
      email: options.email || 'e2e@bocam.local',
      limite_aprobacion: options.limiteAprobacion ?? 999999999,
    },
    secret,
    { expiresIn: '1h' }
  );
}

export async function startHttpApp(app: Express): Promise<{ server: Server; baseUrl: string }> {
  const server = await new Promise<Server>((resolve) => {
    const listeningServer = app.listen(0, () => resolve(listeningServer));
  });
  const address = server.address() as AddressInfo;

  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

export async function stopHttpApp(server: Server | undefined): Promise<void> {
  if (!server) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
