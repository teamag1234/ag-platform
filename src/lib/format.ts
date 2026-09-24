/** Duración en formato corto: "12 min", "1 h 05 min". */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.round(seconds / 60);
  if (m < 1) return '1 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${String(rest).padStart(2, '0')} min` : `${h} h`;
}

export function initials(name: string | null | undefined, email: string): string {
  const source = (name && name.trim()) || email.split('@')[0];
  const parts = source.replace(/[._-]+/g, ' ').trim().split(/\s+/);
  const two = parts.length >= 2 ? parts[0][0] + parts[1][0] : source.slice(0, 2);
  return two.toUpperCase();
}

export function firstName(name: string | null | undefined): string | null {
  const n = name?.trim();
  return n ? n.split(/\s+/)[0] : null;
}

export type LessonKind = 'video' | 'texto' | 'material';
export function lessonKind(l: { bunnyVideoId: string | null; bodyHtml: string | null; attachments: unknown[] }): LessonKind {
  if (l.bunnyVideoId) return 'video';
  if (l.bodyHtml) return 'texto';
  return 'material';
}
