type AuthProjectAccess = { proyecto_id: string };

type AuthUserProjectScope = { proyectos_acceso: AuthProjectAccess[] };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function resolveRefreshExpiry(refreshExpiresIn: string): Date {
  const now = Date.now();
  const trimmed = refreshExpiresIn.trim();
  const match = /^(\d+)([smhd])$/i.exec(trimmed);

  if (!match) {
    const fallback = new Date(now);
    fallback.setDate(fallback.getDate() + 7);
    return fallback;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(now + (value * multipliers[unit]));
}

export function resolveActiveProjectId(
  user: AuthUserProjectScope,
  requestedProjectId?: string
): string {
  const projectIds = user.proyectos_acceso.map((project) => project.proyecto_id);

  if (!requestedProjectId) {
    return projectIds[0] || '';
  }

  if (!projectIds.includes(requestedProjectId)) {
    throw new Error('AUTH_PROJECT_FORBIDDEN');
  }

  return requestedProjectId;
}
