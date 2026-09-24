import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { env } from '@/lib/env';

const LINK_MINUTES = 20;
const MAX_LINKS_PER_HOUR = 5;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export type MagicLinkRequest =
  | { kind: 'sent'; url: string; email: string }
  | { kind: 'unknown_email'; email: string }
  | { kind: 'rate_limited'; email: string };

/**
 * Crea un enlace mágico para un email. Si el email no pertenece a ningún alumno,
 * no se crea nada (la página muestra el mismo mensaje en ambos casos).
 */
export async function requestMagicLink(rawEmail: string): Promise<MagicLinkRequest> {
  const email = normalizeEmail(rawEmail);

  const student = await getDb().query.students.findFirst({ where: eq(schema.students.email, email) });
  if (!student) return { kind: 'unknown_email', email };

  const [{ count }] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.magicLinks)
    .where(and(eq(schema.magicLinks.email, email), gt(schema.magicLinks.createdAt, sql`now() - interval '1 hour'`)));
  if (count >= MAX_LINKS_PER_HOUR) return { kind: 'rate_limited', email };

  const token = randomBytes(32).toString('base64url');
  await getDb().insert(schema.magicLinks).values({
    email,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + LINK_MINUTES * 60_000),
  });

  const url = `${env().APP_URL}/acceso/verificar?token=${encodeURIComponent(token)}`;
  return { kind: 'sent', url, email };
}

export type MagicLinkVerification = { ok: true; studentId: string } | { ok: false; reason: 'invalid' | 'expired' | 'used' };

/** Valida un token de un solo uso y devuelve el alumno. */
export async function verifyMagicLink(token: string): Promise<MagicLinkVerification> {
  if (!token || token.length > 200) return { ok: false, reason: 'invalid' };
  const tokenHash = hashToken(token);
  const link = await getDb().query.magicLinks.findFirst({ where: eq(schema.magicLinks.tokenHash, tokenHash) });
  if (!link) return { ok: false, reason: 'invalid' };
  if (link.usedAt) return { ok: false, reason: 'used' };
  if (link.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' };

  const marked = await getDb()
    .update(schema.magicLinks)
    .set({ usedAt: new Date() })
    .where(and(eq(schema.magicLinks.id, link.id), isNull(schema.magicLinks.usedAt)))
    .returning({ id: schema.magicLinks.id });
  if (marked.length === 0) return { ok: false, reason: 'used' };

  const student = await getDb().query.students.findFirst({ where: eq(schema.students.email, link.email) });
  if (!student) return { ok: false, reason: 'invalid' };

  await getDb().update(schema.students).set({ lastLoginAt: new Date() }).where(eq(schema.students.id, student.id));
  return { ok: true, studentId: student.id };
}
