/** Utilidades para leer un webhook de Kajabi sin depender de su forma exacta. */

type Json = unknown;

function getPath(obj: Json, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split('.')) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part];
    else return undefined;
  }
  return cur;
}

export function findString(payload: Json, paths: string[]): string | null {
  for (const p of paths) {
    const v = getPath(payload, p);
    if (typeof v === 'string' && v) return v;
    if (typeof v === 'number') return String(v);
  }
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Busca en profundidad la primera clave "email" con un valor que parezca un email. */
export function findEmail(payload: Json, depth = 0): string | null {
  if (!payload || typeof payload !== 'object' || depth > 6) return null;
  const obj = payload as Record<string, unknown>;
  for (const key of ['email', 'customer_email', 'member_email', 'contact_email']) {
    const v = obj[key];
    if (typeof v === 'string' && EMAIL_RE.test(v)) return v.toLowerCase();
  }
  for (const v of Object.values(obj)) {
    const found = findEmail(v, depth + 1);
    if (found) return found;
  }
  return null;
}

export const CUSTOMER_ID_PATHS = [
  'customer_id',
  'customer.id',
  'data.customer_id',
  'data.customer.id',
  'data.attributes.customer_id',
  'data.relationships.customer.data.id',
  'payload.customer_id',
  'payload.customer.id',
  'member_id',
  'member.id',
  'contact_id',
  'contact.id',
  'purchase.customer_id',
  'order.customer_id',
];
export const EVENT_PATHS = ['event', 'event_type', 'type', 'data.type'];
