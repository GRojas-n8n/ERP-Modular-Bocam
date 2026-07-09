const AUTO_ASSIGN_ROLES: readonly string[] = ['admin', 'superintendent', 'gerencia_tecnica'];

interface AutoAssignCandidateUser {
  id_usuario: string;
  rol_global: string[];
  activo: boolean;
}

export function resolveAutoAssignedUserIds(users: AutoAssignCandidateUser[]): string[] {
  return users
    .filter((u) => u.activo && u.rol_global.some((r) => AUTO_ASSIGN_ROLES.includes(r)))
    .map((u) => u.id_usuario);
}
