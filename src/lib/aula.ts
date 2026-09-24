import { and, asc, eq, inArray } from 'drizzle-orm';
import { getDb, schema } from '@/db';

export type LessonRow = typeof schema.lessons.$inferSelect;
export type ModuleWithLessons = typeof schema.modules.$inferSelect & { lessons: LessonRow[] };

/** Cursos con acceso activo del alumno, con su progreso. */
export async function getStudentCourses(studentId: string) {
  const db = getDb();
  const rows = await db
    .select({ course: schema.courses })
    .from(schema.grants)
    .innerJoin(schema.courses, eq(schema.grants.courseId, schema.courses.id))
    .where(and(eq(schema.grants.studentId, studentId), eq(schema.grants.status, 'active'), eq(schema.courses.published, true)))
    .orderBy(asc(schema.courses.position), asc(schema.courses.title));

  const out = [];
  for (const { course } of rows) {
    const outline = await getCourseOutline(course.id);
    const total = outline.reduce((n, m) => n + m.lessons.length, 0);
    const done = total ? (await getProgressSet(studentId, course.id)).size : 0;
    out.push({ course, total, done });
  }
  return out;
}

export async function getCourseBySlug(slug: string) {
  return getDb().query.courses.findFirst({ where: eq(schema.courses.slug, slug) });
}

export async function hasActiveGrant(studentId: string, courseId: string) {
  const row = await getDb().query.grants.findFirst({
    where: and(eq(schema.grants.studentId, studentId), eq(schema.grants.courseId, courseId), eq(schema.grants.status, 'active')),
  });
  return !!row;
}

/** Módulos y lecciones publicadas, ordenados. */
export async function getCourseOutline(courseId: string): Promise<ModuleWithLessons[]> {
  const db = getDb();
  const mods = await db.select().from(schema.modules).where(eq(schema.modules.courseId, courseId)).orderBy(asc(schema.modules.position));
  if (!mods.length) return [];
  const lessonRows = await db
    .select()
    .from(schema.lessons)
    .where(and(inArray(schema.lessons.moduleId, mods.map((m) => m.id)), eq(schema.lessons.published, true)))
    .orderBy(asc(schema.lessons.position));
  return mods.map((m) => ({ ...m, lessons: lessonRows.filter((l) => l.moduleId === m.id) }));
}

export async function getProgressSet(studentId: string, courseId: string): Promise<Set<string>> {
  const db = getDb();
  const rows = await db
    .select({ lessonId: schema.progress.lessonId })
    .from(schema.progress)
    .innerJoin(schema.lessons, eq(schema.progress.lessonId, schema.lessons.id))
    .innerJoin(schema.modules, eq(schema.lessons.moduleId, schema.modules.id))
    .where(and(eq(schema.progress.studentId, studentId), eq(schema.modules.courseId, courseId)));
  return new Set(rows.map((r) => r.lessonId));
}

export function flattenLessons(outline: ModuleWithLessons[]) {
  return outline.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleTitle: m.title })));
}

export async function markLessonDone(studentId: string, lessonId: string) {
  await getDb().insert(schema.progress).values({ studentId, lessonId }).onConflictDoNothing();
}
