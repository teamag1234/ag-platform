'use server';

import { z } from 'zod';
import { requestMagicLink } from '@/lib/auth/magic-link';
import { sendMagicLinkEmail, sendNoCoursesEmail } from '@/lib/email';

export type AccesoState = { status: 'idle' } | { status: 'sent'; email: string } | { status: 'error'; message: string };

const schema = z.object({ email: z.string().trim().email('Escribe un email válido') });

export async function solicitarAcceso(_prev: AccesoState, formData: FormData): Promise<AccesoState> {
  const parsed = schema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Email no válido' };

  const result = await requestMagicLink(parsed.data.email);
  try {
    if (result.kind === 'sent') await sendMagicLinkEmail(result.email, result.url);
    else if (result.kind === 'unknown_email') await sendNoCoursesEmail(result.email);
  } catch (err) {
    console.error('[acceso] error enviando email', err);
    return { status: 'error', message: 'No hemos podido enviar el correo. Inténtalo de nuevo en un minuto.' };
  }
  // Mismo mensaje aunque el email no exista o esté limitado: no revelamos quién es alumno.
  return { status: 'sent', email: result.email };
}
