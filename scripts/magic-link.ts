/**
 * Genera un enlace de acceso para un alumno sin pasar por el email (soporte y pruebas).
 * Uso: npm run enlace -- alumno@email.com
 */
import { createHash, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { env } from '@/lib/env';
import { run } from './_bootstrap';

run(async () => {
  const email = (process.argv[2] ?? '').trim().toLowerCase();
  if (!email.includes('@')) throw new Error('Uso: enlace <email>');
  const db = getDb();
  const student = await db.query.students.findFirst({ where: eq(schema.students.email, email) });
  if (!student) throw new Error(`No existe ningún alumno con el email ${email}. Dale acceso primero con: npm run grant -- ${email} <slug-del-curso>`);
  const token = randomBytes(32).toString('base64url');
  await db.insert(schema.magicLinks).values({ email, tokenHash: createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 20 * 60_000) });
  console.log(`${env().APP_URL}/acceso/verificar?token=${encodeURIComponent(token)}`);
  console.log('(caduca en 20 minutos y solo vale una vez)');
});
