import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

function salir() {
  const res = NextResponse.redirect(new URL('/acceso', env().APP_URL));
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}

export async function GET() {
  return salir();
}
export async function POST() {
  return salir();
}
