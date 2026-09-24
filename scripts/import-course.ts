/**
 * Importa o actualiza un curso desde un JSON.
 * Uso: npm run import:course -- content/directo-al-aptis.json
 *
 * Formato del JSON:
 * {
 *   "slug": "directo-al-aptis", "title": "Directo al APTIS", "description": "...", "thumbnailUrl": null,
 *   "published": true, "kajabiCourseId": "123", "kajabiOfferIds": ["456", "789"],
 *   "modules": [
 *     { "title": "Módulo 1", "description": null, "lessons": [
 *       { "slug": "bienvenida", "title": "Bienvenida", "bunnyVideoId": "guid-de-bunny", "bodyHtml": "<p>...</p>",
 *         "attachments": [{ "title": "Guía PDF", "url": "https://..." }] }
 *     ]}
 *   ]
 * }
 */
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { getDb, schema } from '@/db';
import { run, slugify } from './_bootstrap';

const LessonSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1),
  bunnyVideoId: z.string().nullable().optional(),
  bodyHtml: z.string().nullable().optional(),
  attachments: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
  published: z.boolean().default(true),
  kajabiLessonId: z.string().nullable().optional(),
});
const CourseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  published: z.boolean().default(false),
  position: z.number().int().default(0),
  kajabiCourseId: z.string().nullable().optional(),
  kajabiOfferIds: z.array(z.string()).default([]),
  modules: z.array(
    z.object({ title: z.string().min(1), description: z.string().nullable().optional(), kajabiModuleId: z.string().nullable().optional(), lessons: z.array(LessonSchema) }),
  ),
});

run(async () => {
  const file = process.argv[2];
  if (!file) throw new Error('Indica el archivo JSON del curso');
  const data = CourseSchema.parse(JSON.parse(readFileSync(file, 'utf8')));
  const db = getDb();

  const [course] = await db
    .insert(schema.courses)
    .values({
      slug: data.slug,
      title: data.title,
      description: data.description ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      published: data.published,
      position: data.position,
      kajabiCourseId: data.kajabiCourseId ?? null,
    })
    .onConflictDoUpdate({
      target: schema.courses.slug,
      set: { title: data.title, description: data.description ?? null, thumbnailUrl: data.thumbnailUrl ?? null, published: data.published, position: data.position, kajabiCourseId: data.kajabiCourseId ?? null },
    })
    .returning();

  const seenSlugs = new Set<string>();
  let lessonsCount = 0;
  for (const [mi, m] of data.modules.entries()) {
    const existing = await db.query.modules.findFirst({ where: and(eq(schema.modules.courseId, course.id), eq(schema.modules.title, m.title)) });
    const modRow = existing
      ? (await db.update(schema.modules).set({ position: mi + 1, description: m.description ?? null, kajabiModuleId: m.kajabiModuleId ?? null }).where(eq(schema.modules.id, existing.id)).returning())[0]
      : (await db.insert(schema.modules).values({ courseId: course.id, title: m.title, description: m.description ?? null, position: mi + 1, kajabiModuleId: m.kajabiModuleId ?? null }).returning())[0];

    for (const [li, l] of m.lessons.entries()) {
      let slug = l.slug ?? slugify(l.title);
      while (seenSlugs.has(slug)) slug = `${slug}-${li + 1}`;
      seenSlugs.add(slug);
      await db
        .insert(schema.lessons)
        .values({
          moduleId: modRow.id,
          slug,
          title: l.title,
          position: li + 1,
          bunnyVideoId: l.bunnyVideoId ?? null,
          bodyHtml: l.bodyHtml ?? null,
          attachments: l.attachments,
          published: l.published,
          kajabiLessonId: l.kajabiLessonId ?? null,
        })
        .onConflictDoUpdate({
          target: [schema.lessons.moduleId, schema.lessons.slug],
          set: { title: l.title, position: li + 1, bunnyVideoId: l.bunnyVideoId ?? null, bodyHtml: l.bodyHtml ?? null, attachments: l.attachments, published: l.published, kajabiLessonId: l.kajabiLessonId ?? null },
        });
      lessonsCount++;
    }
  }

  for (const offerId of data.kajabiOfferIds) {
    await db.insert(schema.kajabiOfferCourses).values({ kajabiOfferId: offerId, courseId: course.id }).onConflictDoNothing();
  }

  console.log(`Curso "${course.title}" (${course.slug}): ${data.modules.length} módulos, ${lessonsCount} lecciones, ${data.kajabiOfferIds.length} ofertas de Kajabi mapeadas.`);
});
