import { NextResponse } from 'next/server';
import { verifyMagicLink } from '@/lib/auth/magic-link';
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from '@/lib/auth/session';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const result = await verifyMagicLink(token);
  const base = env().APP_URL;
  if (!result.ok) return NextResponse.redirect(new URL(`/acceso?error=${result.reason}`, base));

  const res = NextResponse.redirect(new URL('/mis-cursos', base));
  res.cookies.set(SESSION_COOKIE, await createSessionToken(result.studentId), sessionCookieOptions());
  return res;
}
