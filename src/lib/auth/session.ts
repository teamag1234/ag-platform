import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { env, isProd } from '@/lib/env';

export const SESSION_COOKIE = 'ag_aula';
const SESSION_DAYS = 30;

const secret = () => new TextEncoder().encode(env().SESSION_SECRET);

export type SessionStudent = { id: string; email: string; name: string | null };

export async function createSessionToken(studentId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(studentId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd(),
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

/** Devuelve el alumno de la sesión actual o null. */
export async function getCurrentStudent(): Promise<SessionStudent | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    const rows = await getDb()
      .select({ id: schema.students.id, email: schema.students.email, name: schema.students.name })
      .from(schema.students)
      .where(eq(schema.students.id, payload.sub))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Igual que getCurrentStudent, pero redirige a /acceso si no hay sesión. */
export async function requireStudent(): Promise<SessionStudent> {
  const student = await getCurrentStudent();
  if (!student) redirect('/acceso');
  return student;
}
