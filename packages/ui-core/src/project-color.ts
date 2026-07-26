// Paleta fija de colores determinísticos por proyecto. Se usa para que el
// usuario reconozca el proyecto activo por color sin depender solo de texto,
// cuando tiene varios proyectos abiertos (ver openspec change
// selector-proyecto-confirmacion-critica). Los tonos usan la misma técnica de
// opacidad (ej. `emerald-500/10`) que ya usa SectionBadge, así que funcionan
// igual en tema claro y oscuro sin variables CSS adicionales.
export interface ProjectColor {
  name: string;
  dot: string;
  border: string;
  bgSoft: string;
  text: string;
  ring: string;
}

const PROJECT_COLOR_PALETTE: ProjectColor[] = [
  { name: 'emerald', dot: 'bg-emerald-500', border: 'border-emerald-500/40', bgSoft: 'bg-emerald-500/10', text: 'text-emerald-600', ring: 'ring-emerald-500/30' },
  { name: 'amber', dot: 'bg-amber-500', border: 'border-amber-500/40', bgSoft: 'bg-amber-500/10', text: 'text-amber-600', ring: 'ring-amber-500/30' },
  { name: 'sky', dot: 'bg-sky-500', border: 'border-sky-500/40', bgSoft: 'bg-sky-500/10', text: 'text-sky-600', ring: 'ring-sky-500/30' },
  { name: 'violet', dot: 'bg-violet-500', border: 'border-violet-500/40', bgSoft: 'bg-violet-500/10', text: 'text-violet-600', ring: 'ring-violet-500/30' },
  { name: 'rose', dot: 'bg-rose-500', border: 'border-rose-500/40', bgSoft: 'bg-rose-500/10', text: 'text-rose-600', ring: 'ring-rose-500/30' },
  { name: 'teal', dot: 'bg-teal-500', border: 'border-teal-500/40', bgSoft: 'bg-teal-500/10', text: 'text-teal-600', ring: 'ring-teal-500/30' },
  { name: 'fuchsia', dot: 'bg-fuchsia-500', border: 'border-fuchsia-500/40', bgSoft: 'bg-fuchsia-500/10', text: 'text-fuchsia-600', ring: 'ring-fuchsia-500/30' },
  { name: 'orange', dot: 'bg-orange-500', border: 'border-orange-500/40', bgSoft: 'bg-orange-500/10', text: 'text-orange-600', ring: 'ring-orange-500/30' },
];

/**
 * Deriva un color estable de la paleta fija a partir del id del proyecto.
 * Mismo `projectId` -> mismo color siempre, sin estado ni configuración.
 */
export function getProjectColor(projectId: string | null | undefined): ProjectColor {
  if (!projectId) {
    return PROJECT_COLOR_PALETTE[0];
  }

  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash * 31 + projectId.charCodeAt(i)) | 0;
  }

  const index = Math.abs(hash) % PROJECT_COLOR_PALETTE.length;
  return PROJECT_COLOR_PALETTE[index];
}
