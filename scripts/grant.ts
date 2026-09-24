/**
 * Acceso manual, SOLO para pruebas y piloto. En producción los accesos vienen de Kajabi.
 * Uso: npm run grant -- alumno@email.com directo-al-aptis [revocar]
 */
import { eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { revokeGrant } from '@/lib/kajabi/grants';
import { run } from './_bootstrap';

run(async () => {
  const [emailRaw, slug, action] = process.argv.slice(2);
  if (!emailRaw || !slug) throw new Error('Uso: grant <email> <slug-del-curso> [revocar]');
  const email = emailRaw.trim().toLowerCase();
  const db = getDb();
  const course = await db.query.courses.findFirst({ where: eq(schema.courses.slug, slug) });
  if (!course) throw new Error(`No existe el curso ${slug}`);

  const [student] = await db
    .insert(schema.students)
    .values({ email })
    .onConflictDoUpdate({ target: schema.students.email, set: { email } })
    .returning();

  if (action === 'revocar') {
    await revokeGrant(student.id, course.id);
    console.log(`Acceso revocado: ${email} -> ${course.title}`);
    return;
  }
  await db
    .insert(schema.grants)
    .values({ studentId: student.id, courseId: course.id, source: 'manual', status: 'active' })
    .onConflictDoUpdate({ target: [schema.grants.studentId, schema.grants.courseId], set: { status: 'active', source: 'manual', revokedAt: null, updatedAt: new Date() } });
  console.log(`Acceso concedido: ${email} -> ${course.title}`);
});
